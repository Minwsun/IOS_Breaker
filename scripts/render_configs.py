"""Render both All-In-One formats from one reviewed module template."""
import argparse
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def render(ref):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_./-]*", ref) or ".." in ref:
        raise ValueError("Invalid Git ref")
    base = "https://raw.githubusercontent.com/Minwsun/IOS_Breaker/refs/heads/" + ref
    template = (ROOT / "config/all-in-one.template.sgmodule").read_text(encoding="utf-8")
    module = template.replace("{{BASE_URL}}", base)
    general = ("[General]\nbypass-system = true\nskip-proxy = *.local, *.crashlytics.com\n"
               "tun-excluded-routes = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12\n\n")
    return {"All_In_One.sgmodule": module, "All_In_One.conf": general + module}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ref", default="codex/self-hosted-app-expansion")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for name, content in render(args.ref).items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                raise SystemExit("Generated file out of date: " + name)
        else:
            path.write_bytes(content.encode("utf-8"))
        print(("Checked " if args.check else "Rendered ") + name)


if __name__ == "__main__":
    main()
