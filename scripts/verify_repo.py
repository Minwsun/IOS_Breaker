"""Offline checks for local assets, config parity, vendor integrity and JavaScript syntax."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

from render_configs import render
from prepare_substore import render as render_substore
from build_premium_modules import build as premium_modules
from build_app_catalog import generated as generated_catalog
from vendor_assets import ROOT, target_path, validate_content


def verify():
    errors = []
    for name, expected in premium_modules().items():
        if not (ROOT / name).is_file() or (ROOT / name).read_text(encoding="utf-8") != expected:
            errors.append("Regenerate " + name)
    for path, expected in generated_catalog(ROOT).items():
        if not path.is_file() or path.read_text(encoding="utf-8") != expected:
            errors.append("Regenerate " + str(path.relative_to(ROOT)))
    for name, expected in render("codex/self-hosted-app-expansion").items():
        if (ROOT / name).read_text(encoding="utf-8") != expected:
            errors.append("Regenerate " + name)
    for name, expected in render_substore().items():
        if not (ROOT / name).is_file() or (ROOT / name).read_text(encoding="utf-8") != expected:
            errors.append("Regenerate " + name)
    assets = 0
    for manifest_path in (ROOT / "vendor").glob("*-lock.json"):
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for entry in manifest.get("assets", []):
            path = target_path(ROOT, entry["path"])
            if not path.is_file():
                errors.append("Missing locked asset: " + entry["path"])
            elif hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]:
                errors.append("Hash mismatch: " + entry["path"])
            assets += 1
    configs = list((ROOT / "modules").glob("*.sgmodule")) + [ROOT / name for name in
               ("All_In_One.conf", "All_In_One.sgmodule", "shadowrocket_basic.conf")]
    refs = 0
    for path in configs:
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if line.lstrip().startswith("#"):
                continue
            for url in re.findall(r"script-path\s*=\s*([^,\s]+)|^RULE-SET,([^,\s]+)", line):
                url = next(value for value in url if value)
                parsed = urlsplit(url)
                prefix = "/Minwsun/IOS_Breaker/"
                if parsed.scheme != "https" or parsed.hostname != "raw.githubusercontent.com" or not parsed.path.startswith(prefix):
                    errors.append(str(path.relative_to(ROOT)) + ":" + str(number) + " external code/rule asset: " + url)
                    continue
                local = re.split(r"/(?:js|rules)/", parsed.path, maxsplit=1)
                kind = "js" if "/js/" in parsed.path else "rules"
                if len(local) != 2 or not target_path(ROOT, kind + "/" + unquote(local[1])).is_file():
                    errors.append("Missing config asset: " + url)
                refs += 1
            if "{{" in line:
                errors.append("Unrendered config placeholder: " + str(path.relative_to(ROOT)))
    for path in (ROOT / "rules").rglob("*.list"):
        data = path.read_bytes()
        # Deliberately empty, commented local amendments are allowed.
        if any(line.strip() and not line.lstrip().startswith(b"#") for line in data.splitlines()):
            try:
                validate_content(data, "rules")
            except ValueError as exc:
                errors.append(str(path.relative_to(ROOT)) + ": " + str(exc))

    class AssetParser(HTMLParser):
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            value = attrs.get("src") if tag in ("script", "img") else attrs.get("href") if tag == "link" else None
            if value:
                if urlsplit(value).scheme or value.startswith("//"):
                    errors.append("External website runtime asset: " + value)
                elif not target_path(ROOT, value).is_file():
                    errors.append("Missing website asset: " + value)

    AssetParser().feed((ROOT / "index.html").read_text(encoding="utf-8"))
    # Parse without evaluating bundled app code or invoking proxy runtime APIs.
    js_check = r"""
const fs=require('fs'),path=require('path'),vm=require('vm');let files=[],errors=[];
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else if(p.endsWith('.js'))files.push(p);}}
walk('js');files.push('custom-sni.js');
for(const file of files){try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});}catch(e){errors.push(file+': '+e.message);}}
console.log(JSON.stringify({count:files.length,errors}));
"""
    result = subprocess.run(["node", "-e", js_check], cwd=str(ROOT), capture_output=True, text=True, check=True)
    syntax = json.loads(result.stdout)
    errors.extend(syntax["errors"])
    if errors:
        raise SystemExit("\n".join(errors))
    print("Verified {} locked assets, {} config references, {} JavaScript parses; rules, website assets and config parity OK."
          .format(assets, refs, syntax["count"]))


if __name__ == "__main__":
    verify()
