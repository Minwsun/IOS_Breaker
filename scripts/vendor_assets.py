"""Restore pinned, hashed upstream assets without executing downloaded code (Python 3.8+)."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_HOSTS = {"raw.githubusercontent.com", "github.com", "codeload.github.com",
                 "release-assets.githubusercontent.com", "objects.githubusercontent.com",
                 "cdn.tailwindcss.com", "unpkg.com", "cdnjs.cloudflare.com"}
MAX_BYTES = 32 * 1024 * 1024


def target_path(root, relative):
    candidate = (root / relative).resolve()
    if candidate == root.resolve() or root.resolve() not in candidate.parents:
        raise ValueError("Asset path escapes repository: " + relative)
    return candidate


def validate_url(url):
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS
            or parsed.username or parsed.password or parsed.port not in (None, 443)):
        raise ValueError("Unapproved asset URL: " + url)


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def validate_content(data, kind):
    if not data or data.lstrip().startswith((b"404:", b"<!DOCTYPE html", b"<!doctype html", b"<html")):
        raise ValueError("Empty or error document returned instead of asset")
    if kind == "rules":
        allowed = {"DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6",
                   "IP-ASN", "GEOIP", "USER-AGENT", "URL-REGEX", "PROCESS-NAME"}
        lines = [line.strip() for line in data.decode("utf-8-sig").splitlines()
                 if line.strip() and not line.lstrip().startswith("#")]
        if not lines or any(line.split(",")[0] not in allowed or "," not in line for line in lines):
            raise ValueError("Invalid Shadowrocket rule list")


def restore(entry, root=ROOT, opener=None):
    if entry.get("source_entry"):
        raise ValueError("Extracted asset must be restored from the retained archive/Git: " + entry["path"])
    if entry.get("source_sha256", entry["sha256"]) != entry["sha256"]:
        raise ValueError("Locally adapted asset must be restored from Git: " + entry["path"])
    validate_url(entry["url"])
    destination = target_path(root, entry["path"])
    expected = entry["sha256"]
    if len(expected) != 64 or any(c not in "0123456789abcdef" for c in expected):
        raise ValueError("Missing SHA256: " + entry["path"])
    opener = opener or urllib.request.build_opener(SafeRedirect())
    req = urllib.request.Request(entry["url"], headers={"User-Agent": "IOS-Breaker-vendor/1"})
    with opener.open(req, timeout=45) as response:
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("Asset exceeds size limit")
    validate_content(data, entry.get("kind", "asset"))
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError("SHA256 mismatch: " + entry["path"])
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=str(destination.parent), delete=False) as stream:
            temporary = stream.name
            stream.write(data)
        os.replace(temporary, str(destination))
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", default="vendor/assets-lock.json")
    parser.add_argument("--group", help="Only restore one asset group, e.g. rules")
    args = parser.parse_args()
    manifest = json.loads(target_path(ROOT, args.manifest).read_text(encoding="utf-8"))
    entries = [entry for entry in manifest["assets"] if not args.group or entry.get("group") == args.group]
    if not entries:
        parser.error("No matching assets")
    for entry in entries:
        if entry.get("source_entry"):
            print("Retaining extracted asset (restore from archive/Git): " + entry["path"])
            continue
        if entry.get("source_sha256", entry["sha256"]) != entry["sha256"]:
            print("Retaining local adaptation (restore with Git): " + entry["path"])
            continue
        restore(entry)
        print("Verified and restored " + entry["path"])


if __name__ == "__main__":
    main()
