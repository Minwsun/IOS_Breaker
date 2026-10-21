"""Create local Sub-Store bundles that open the repository-hosted frontend."""
import argparse
import re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FRONTEND = "https://minwsun.github.io/IOS_Breaker/assets/sub-store/"


def render(frontend=DEFAULT_FRONTEND):
    parsed = urlsplit(frontend)
    if (not re.fullmatch(r"https://[A-Za-z0-9.-]+(?::[0-9]+)?/[A-Za-z0-9_./%~-]*", frontend)
            or parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment):
        raise ValueError("Frontend must be an HTTPS URL without credentials, query or fragment")
    origin = "https://" + parsed.netloc
    outputs = {}
    for name in ("sub-store-0", "sub-store-1"):
        source = ROOT / ("js/vendor/sub-store/" + name + ".min.js")
        content = source.read_text(encoding="utf-8")
        if "https://sub-store.vercel.app" not in content:
            raise ValueError("Expected upstream UI origin missing; review upstream changes")
        if name == "sub-store-0" and content.count('r.set("location","https://sub-store.vercel.app/").status(302).end()') != 1:
            raise ValueError("Expected root redirect changed; review upstream before rebuilding")
        # The precise root redirect retains the frontend subdirectory. CORS uses origin only.
        content = content.replace('"https://sub-store.vercel.app/"', '"' + frontend.rstrip("/") + '/"')
        content = content.replace("https://sub-store.vercel.app", origin)
        header = ("// Derived from Sub-Store 2.42.6 (AGPL-3.0); local frontend redirect/CORS adaptation.\n"
                  "// Source and license: vendor/sources/Sub-Store-2.42.6.tar.gz, licenses/Sub-Store-AGPL-3.0.txt.\n"
                  "// Reproduce with scripts/prepare_substore.py.\n")
        outputs["js/" + name + ".selfhost.js"] = header + content
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--frontend", default=DEFAULT_FRONTEND)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for name, content in render(args.frontend).items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                raise SystemExit("Regenerate " + name)
        else:
            path.write_bytes(content.encode("utf-8"))
        print(("Checked " if args.check else "Prepared ") + name)


if __name__ == "__main__":
    main()
