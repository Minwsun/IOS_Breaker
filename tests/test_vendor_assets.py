import hashlib
import io
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from vendor_assets import restore, target_path, validate_content, validate_url, SafeRedirect


class Opener:
    def __init__(self, data):
        self.data = data

    def open(self, request, timeout):
        return io.BytesIO(self.data)


class VendorTests(unittest.TestCase):
    def test_error_body_never_overwrites_last_good_file(self):
        for body in (b"404: Not Found", b"<!DOCTYPE html><html>Not found</html>"):
            with self.subTest(body=body), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                (root / "good.list").write_bytes(b"DOMAIN,example.com\n")
                entry = dict(path="good.list", url="https://raw.githubusercontent.com/a/b/sha/file",
                             sha256=hashlib.sha256(body).hexdigest(), kind="rules")
                with self.assertRaises(ValueError):
                    restore(entry, root, Opener(body))
                self.assertEqual((root / "good.list").read_bytes(), b"DOMAIN,example.com\n")

    def test_hash_mismatch_does_not_create_or_replace_asset(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            entry = dict(path="file.js", url="https://raw.githubusercontent.com/a/b/sha/file", sha256="0" * 64)
            with self.assertRaisesRegex(ValueError, "SHA256 mismatch"):
                restore(entry, root, Opener(b"untrusted data"))
            self.assertFalse((root / "file.js").exists())

    def test_verified_download_replaces_atomically(self):
        data = b"DOMAIN,example.com\n"
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            entry = dict(path="nested/file.list", url="https://raw.githubusercontent.com/a/b/sha/file",
                         sha256=hashlib.sha256(data).hexdigest(), kind="rules")
            restore(entry, root, Opener(data))
            self.assertEqual((root / entry["path"]).read_bytes(), data)
            self.assertEqual(len(list((root / "nested").iterdir())), 1)

    def test_paths_cannot_escape_repository(self):
        with tempfile.TemporaryDirectory() as directory:
            for path in ("..", "../outside.js", str(Path(directory).parent / "outside.js")):
                with self.subTest(path=path), self.assertRaises(ValueError):
                    target_path(Path(directory), path)

    def test_download_hosts_and_scheme_are_restricted(self):
        for url in ("http://raw.githubusercontent.com/file", "https://evil.example/file",
                    "https://user:secret@github.com/file", "https://github.com:444/file"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                validate_url(url)

    def test_redirects_cannot_leave_allowlist(self):
        with self.assertRaises(ValueError):
            SafeRedirect().redirect_request(None, None, 302, "", {}, "http://127.0.0.1/private")

    def test_quantumult_policy_rules_are_rejected(self):
        with self.assertRaises(ValueError):
            validate_content(b"HOST,example.com,Global\n", "rules")

    def test_empty_rules_are_rejected(self):
        with self.assertRaises(ValueError):
            validate_content(b"# only comments\n", "rules")

    def test_adapted_module_cannot_be_overwritten_with_upstream(self):
        entry = dict(path="module.sgmodule", url="https://raw.githubusercontent.com/a/b/sha/file",
                     sha256="1" * 64, source_sha256="2" * 64)
        with self.assertRaisesRegex(ValueError, "Locally adapted asset"):
            restore(entry, opener=Opener(b"upstream bytes"))


if __name__ == "__main__":
    unittest.main()
