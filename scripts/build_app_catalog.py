#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a deterministic, offline inventory of app modules and processors."""
from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
import re
from urllib.parse import parse_qs, unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = Path("config/module-catalog.json")
DOC_PATH = Path("docs/app-catalog.md")
SCRIPT_RE = re.compile(r"^\s*([^=]+?)\s*=\s*(.*)$")
FIELD_RE = re.compile(r"(?:^|,)\s*([\w-]+)\s*=\s*(.*?)(?=,\s*[\w-]+\s*=|$)")
URL_RE = re.compile(r"^https://raw\.githubusercontent\.com/([^/]+)/([^/]+)/.+/(?:js|modules)/(.+)$")
HOST_RE = re.compile(r"(?<![\w-])(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.)+[a-z]{2,}(?![\w-])", re.I)
EXPERIMENTAL_RE = re.compile(r"experimental|unverified|device validation required", re.I)


class CatalogError(ValueError):
    pass


def _parse_fields(text: str) -> dict[str, str]:
    result = {}
    for match in FIELD_RE.finditer(text):
        result[match.group(1).strip().lower()] = match.group(2).strip()
    return result


def _resolve_script(root: Path, url: str, module: Path) -> str:
    parsed = urlsplit(url)
    if not parsed.scheme or parsed.scheme != "https" or not parsed.netloc:
        raise CatalogError(f"{module}: malformed script-path URL: {url}")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise CatalogError(f"{module}: unsupported script-path URL components: {url}")
    match = URL_RE.match(url)
    if not match:
        raise CatalogError(f"{module}: script-path URL is not a supported repository raw URL: {url}")
    if match.group(1).lower() != "minwsun" or match.group(2).lower() != "ios_breaker":
        raise CatalogError(f"{module}: script-path URL must point to Minwsun/IOS_Breaker: {url}")
    rel = unquote(match.group(3)).replace("\\", "/")
    path = PurePosixPath(rel)
    if path.is_absolute() or any(part in ("", ".", "..") for part in path.parts):
        raise CatalogError(f"{module}: script-path escapes repository: {url}")
    kind = "js" if "/js/" in parsed.path else "modules"
    local = (root / kind / Path(*path.parts)).resolve()
    base = (root / kind).resolve()
    try:
        local.relative_to(base)
    except ValueError:
        raise CatalogError(f"{module}: script-path escapes repository: {url}")
    if not local.is_file():
        raise CatalogError(f"{module}: missing script-path dependency: {kind}/{path.as_posix()}")
    return (Path(kind) / Path(*path.parts)).as_posix()


def _load_provenance(root: Path) -> dict[str, dict]:
    result = {}
    for path in sorted((root / "vendor").glob("*-lock.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise CatalogError(f"invalid {path.name}: {exc}") from exc
        result.update({item["path"]: item for item in data.get("assets", [])
                       if isinstance(item, dict) and item.get("path")})
    return result


def _read_module(root: Path, file: Path, provenance: dict[str, dict]) -> dict:
    content = file.read_text(encoding="utf-8")
    lines = content.splitlines()
    name = file.stem
    description = ""
    for line in lines:
        if line.startswith("#!name="):
            name = line.partition("=")[2].strip()
        elif line.startswith("#!desc="):
            description = line.partition("=")[2].strip()

    scripts, hosts, comments = [], set(), []
    section = ""
    for number, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("#"):
            if "source" in stripped.lower() or "license" in stripped.lower() or "experimental" in stripped.lower():
                comments.append(stripped.lstrip("# "))
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            section = stripped[1:-1].strip().lower()
            continue
        if section == "mitm" and stripped.lower().startswith("hostname") and "=" in stripped:
            value = stripped.split("=", 1)[1].replace("%APPEND%", "")
            hosts.update(token.strip() for token in value.split(",") if token.strip())
        if section != "script":
            continue
        match = SCRIPT_RE.match(line)
        if not match:
            continue
        script_name, raw = match.groups()
        fields = _parse_fields(raw)
        if "type" not in fields and "script-path" not in fields:
            continue
        url = fields.get("script-path")
        if not url:
            raise CatalogError(f"{file}:{number}: active script has no script-path")
        local = _resolve_script(root, url, file)
        endpoint = fields.get("pattern", "")
        hosts.update(HOST_RE.findall(endpoint.replace(r"\.", ".").replace(r"\/", "/")))
        source = provenance.get(local, {})
        scripts.append({
            "name": script_name,
            "phase": fields.get("type", "unknown").strip().lower(),
            "endpoint_regex": endpoint,
            "mitm_hosts": sorted(hosts) if not endpoint else sorted(set(HOST_RE.findall(endpoint.replace(r"\.", ".").replace(r"\/", "/")))),
            "local_script": local,
            "script_source_url": url,
            "requires_body": fields.get("requires-body"),
            "binary_body_mode": fields.get("binary-body-mode"),
            "user_agent": parse_qs(fields.get("argument", "")).get("ua", [fields.get("ua")])[0],
            "source": source.get("url") or _source_from_comments(comments),
            "license": source.get("license") or _license_from_comments(comments),
        })
    experimental = bool(EXPERIMENTAL_RE.search(" ".join([name, description, *comments])))
    return {
        "name": name,
        "module": file.relative_to(root).as_posix(),
        "description": description,
        "status": "experimental-unverified" if experimental else "unverified",
        "device_tested": False,
        "mitm_hosts": sorted(hosts),
        "scripts": scripts,
        "notes": comments,
    }


def _source_from_comments(comments: list[str]) -> str | None:
    for comment in comments:
        m = re.search(r"(https?://\S+|[\w.-]+/[\w.-]+(?:\s+commit\s+[0-9a-f]{7,40})?)", comment, re.I)
        if m:
            return m.group(1).rstrip(".)")
    return None


def _license_from_comments(comments: list[str]) -> str | None:
    for comment in comments:
        m = re.search(r"\b(MIT|Apache-2\.0|GPL(?:-\d(?:\.\d)?(?:-only|-or-later)?)?|AGPL-\d(?:\.\d)?(?:-only|-or-later)?)\b", comment, re.I)
        if m:
            return m.group(1)
    return None


def _processor_inventory(root: Path, modules: list[dict], provenance: dict[str, dict]) -> list[dict]:
    references: dict[str, list[str]] = {}
    names: dict[str, list[str]] = {}
    for module in modules:
        for script in module["scripts"]:
            references.setdefault(script["local_script"], []).append(module["module"])
            names.setdefault(script["local_script"], []).append(script["name"])
    output = []
    for path in sorted((root / "js").glob("*.js")):
        rel = path.relative_to(root).as_posix()
        meta = provenance.get(rel, {})
        output.append({
            "path": rel,
            "script_names": sorted(set(names.get(rel, []))),
            "modules": sorted(set(references.get(rel, []))),
            "source": meta.get("url"),
            "license": meta.get("license"),
            "device_tested": False,
            "status": "experimental-unverified" if any("experimental" in str(m).lower() for m in references.get(rel, [])) else "unverified",
        })
    return output


def _conflicts(modules: list[dict]) -> list[dict]:
    groups = []
    for provider, needles, group_id, guidance in [
        ("Spotify", ("spotify.com", "bootstrap/v1/bootstrap", "user-customization-service/v1/customize"), "spotify-overlap", "Choose one Spotify module: their active rules overlap."),
    ]:
        members = []
        for module in modules:
            block = " ".join([module["name"], module["module"]] + [s["endpoint_regex"] + " " + s["local_script"] for s in module["scripts"]]).lower().replace("\\", "")
            if sum(needle.lower() in block for needle in needles) >= 2:
                members.append(module["module"])
        if len(members) > 1:
            groups.append({"id": group_id, "provider": provider, "members": sorted(members), "reason": guidance})

    revenuecat = []
    for module in modules:
        matching = [s for s in module["scripts"] if "revenuecat" in (s["endpoint_regex"] + " " + s["local_script"]).lower()]
        if not matching:
            continue
        selectors = sorted({token.strip().lower() for script in matching if script.get("user_agent")
                            for token in script["user_agent"].split("|") if token.strip()})
        has_global = any(not script.get("user_agent") for script in matching)
        revenuecat.append({"path": module["module"], "selectors": selectors, "global": has_global})
    global_modules = sorted(item["path"] for item in revenuecat if item["global"])
    scoped_modules = sorted(item["path"] for item in revenuecat if not item["global"])
    same_selector_pairs = []
    for index, left in enumerate(revenuecat):
        for right in revenuecat[index + 1:]:
            shared = sorted(set(left["selectors"]) & set(right["selectors"]))
            if not left["global"] and not right["global"] and shared:
                same_selector_pairs.append({"modules": [left["path"], right["path"]], "selectors": shared})
    if global_modules and scoped_modules or same_selector_pairs or len(global_modules) > 1:
        groups.append({
            "id": "revenuecat-overlap",
            "provider": "RevenueCat",
            "members": sorted(set(global_modules + scoped_modules)),
            "global_handlers": global_modules,
            "scoped_modules": scoped_modules,
            "global_global_pairs": [[global_modules[i], global_modules[j]]
                                    for i in range(len(global_modules)) for j in range(i + 1, len(global_modules))],
            "global_scoped_pairs": [[global_path, scoped_path]
                                    for global_path in global_modules for scoped_path in scoped_modules],
            "same_selector_pairs": same_selector_pairs,
            "reason": "Global RevenueCat handlers overlap each other and every app-scoped handler. App-scoped handlers overlap only when their User-Agent selectors match.",
        })
    return groups


def _integration_groups(modules: list[dict]) -> list[dict]:
    revenuecat = [m["module"] for m in modules if any("revenuecat" in (s["endpoint_regex"] + s["local_script"]).lower() for s in m["scripts"])]
    spotify = [m["module"] for m in modules if any("spotify" in (s["endpoint_regex"] + s["local_script"]).lower() for s in m["scripts"])]
    if not revenuecat or not spotify:
        return []
    return [{
        "id": "revenuecat-plus-spotify",
        "name": "RevenueCat + Spotify",
        "members": sorted(set(revenuecat + spotify)),
        "relationship": "These target different provider hostnames and are not an endpoint conflict with each other; choose only one module within each provider conflict group.",
    }]


def build_catalog(root: Path = ROOT) -> dict:
    root = Path(root).resolve()
    provenance = _load_provenance(root)
    files = list((root / "modules").glob("*.sgmodule"))
    files.extend(path for path in (root / "All_In_One.sgmodule", root / "All_In_One.conf") if path.is_file())
    modules = [_read_module(root, file, provenance) for file in sorted(files)]
    return {
        "schema_version": 1,
        "generated_by": "scripts/build_app_catalog.py",
        "validation_policy": "No current device-test evidence was found; all entries are marked unverified.",
        "provenance_references": ["vendor/apps-lock.json", "docs/THIRD_PARTY.md", "docs/validation.md"],
        "modules": modules,
        "javascript_processors": _processor_inventory(root, modules, provenance),
        "conflict_groups": _conflicts(modules),
        "integration_groups": _integration_groups(modules),
    }


def render_markdown(catalog: dict) -> str:
    lines = [
        "# Danh mục module và script ứng dụng",
        "",
        "Tài liệu này được tạo từ các module và script trong repository. Trạng thái mô tả bằng chứng trong mã nguồn; **không phải xác nhận tính năng hoạt động**. Hiện chưa có bằng chứng kiểm thử trên thiết bị cho các mục bên dưới.",
        "",
        "## Chọn module",
        "",
        "1. Chọn đúng module ứng dụng bạn dùng và kiểm tra tên file trước khi import vào Shadowrocket.",
        "2. Không bật nhiều lựa chọn Spotify cùng lúc. Với RevenueCat, Dynamic, Legacy và All In One là handler chung; chúng đụng với các module theo app. Các module theo app khác nhau có thể cùng tồn tại nếu User-Agent selector khác nhau; hai đường dẫn Locket là alias trùng selector nên chỉ chọn một.",
        "3. Cấp quyền MITM/chứng chỉ chỉ khi bạn hiểu và chấp nhận việc proxy đọc được lưu lượng HTTPS của các hostname được liệt kê. Có thể cần bật HTTPS Decryption cho các host đó.",
        "4. Sau khi cài, kiểm tra app và log proxy; nếu gặp lỗi, tắt module trước. Không coi mô tả hoặc script name là cam kết mở khóa hay tương thích phiên bản.",
        "5. Source/license được ghi khi repository có manifest hoặc metadata rõ ràng. `Not recorded` nghĩa là nguồn hoặc giấy phép chưa được xác định trong dữ liệu máy đọc được.",
        "",
        "## Module",
        "",
    ]
    for module in catalog["modules"]:
        lines += [f"### {module['name']}", "", f"- Tệp: `{module['module']}`", f"- Trạng thái: `{module['status']}`; kiểm thử thiết bị: **chưa xác nhận**", f"- Host MITM: {', '.join(f'`{h}`' for h in module['mitm_hosts']) or 'không khai báo'}", f"- Mô tả: {module['description'] or 'không có'}"]
        if module["scripts"]:
            lines += ["- Quy tắc script:"]
            for script in module["scripts"]:
                lines.append(f"  - `{script['name']}` — `{script['phase']}`; endpoint regex `{script['endpoint_regex'] or '(không có)'}`; processor `{script['local_script']}`; source/license: `{script['source'] or 'Not recorded'}` / `{script['license'] or 'Not recorded'}`")
        else:
            lines.append("- Không có script-path đang hoạt động.")
        lines += [""]
    lines += ["## Nhóm xung đột", ""]
    if catalog["conflict_groups"]:
        for group in catalog["conflict_groups"]:
            lines.append(f"- **{group['provider']}** (`{group['id']}`): {group['reason']} Thành viên: {', '.join(f'`{m}`' for m in group['members'])}.")
            if group["provider"] == "RevenueCat":
                if group["global_handlers"]:
                    lines.append(f"  - Handler chung: {', '.join(f'`{m}`' for m in group['global_handlers'])}; mỗi handler chung đụng với các module theo app: {', '.join(f'`{m}`' for m in group['scoped_modules'])}.")
                for pair in group["same_selector_pairs"]:
                    lines.append(f"  - Alias/trùng selector `{', '.join(pair['selectors'])}`: `{pair['modules'][0]}` và `{pair['modules'][1]}`.")
    else:
        lines.append("Không phát hiện nhóm xung đột theo heuristic hiện tại.")
    lines += ["", "### Nhóm provider RevenueCat + Spotify", "", "Hai provider này dùng hostname khác nhau nên có thể cần trong cùng cấu hình; đó không phải nhóm xung đột. Vẫn chỉ bật một module trong mỗi nhóm endpoint chồng lấn ở trên.", "", "## JavaScript processors", "", "Danh sách đầy đủ nằm trong `config/module-catalog.json`. Các file không được module nào tham chiếu vẫn được liệt kê để thấy script orphan; không suy ra rằng chúng còn tương thích.", ""]
    for item in catalog["javascript_processors"]:
        lines.append(f"- `{item['path']}` — {item['status']}; module tham chiếu: {', '.join(f'`{m}`' for m in item['modules']) or 'không có'}; source/license: `{item['source'] or 'Not recorded'}` / `{item['license'] or 'Not recorded'}`.")
    lines += ["", "## Cập nhật danh mục", "", "Chạy `python scripts/build_app_catalog.py` để tạo `config/module-catalog.json` và tài liệu này; chạy `python scripts/build_app_catalog.py --check` trong kiểm tra để phát hiện artifact cũ. Công cụ chỉ đọc file local, không cần package cài thêm hoặc kết nối mạng.", ""]
    return "\n".join(lines)


def generated(root: Path) -> dict[Path, str]:
    catalog = build_catalog(root)
    return {
        root / JSON_PATH: json.dumps(catalog, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        root / DOC_PATH: render_markdown(catalog),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if generated catalog files are stale")
    parser.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        outputs = generated(args.root.resolve())
    except CatalogError as exc:
        parser.error(str(exc))
    stale = []
    for path, content in outputs.items():
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != content:
                stale.append(path.relative_to(args.root.resolve()).as_posix())
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("w", encoding="utf-8", newline="\n") as output:
                output.write(content)
    if stale:
        print("Stale generated files: " + ", ".join(stale))
        return 1
    print("App catalog is current." if args.check else "Generated config/module-catalog.json and docs/app-catalog.md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
