import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_app_catalog import CatalogError, build_catalog, generated


class AppCatalogTests(unittest.TestCase):
    def fixture(self, script_url="https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/handler.js", pattern="^https://api.example.test/v1/response$"):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        (root / "modules").mkdir()
        (root / "js").mkdir()
        (root / "config").mkdir()
        (root / "docs").mkdir()
        (root / "js/handler.js").write_text("// fixture processor\n", encoding="utf-8")
        (root / "modules/Example.sgmodule").write_text(
            "#!name=Example\n[MITM]\nhostname = %APPEND%, api.example.test\n[Script]\n"
            + f"example = type=http-response, pattern={pattern}, script-path={script_url}, requires-body=true\n",
            encoding="utf-8",
        )
        self.addCleanup(temp.cleanup)
        return root

    def test_reads_active_script_and_resolves_local_asset(self):
        root = self.fixture()
        catalog = build_catalog(root)
        module = catalog["modules"][0]
        self.assertEqual(module["scripts"][0]["local_script"], "js/handler.js")
        self.assertEqual(module["scripts"][0]["phase"], "http-response")
        self.assertEqual(module["scripts"][0]["endpoint_regex"], "^https://api.example.test/v1/response$")
        self.assertEqual(module["mitm_hosts"], ["api.example.test"])
        self.assertFalse(module["device_tested"])

    def test_rejects_malformed_script_url(self):
        root = self.fixture(script_url="not a URL")
        with self.assertRaisesRegex(CatalogError, "malformed script-path URL"):
            build_catalog(root)

    def test_rejects_missing_local_dependency(self):
        root = self.fixture(script_url="https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/missing.js")
        with self.assertRaisesRegex(CatalogError, "missing script-path dependency"):
            build_catalog(root)

    def test_rejects_path_escape(self):
        root = self.fixture(script_url="https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/%2e%2e/secret.js")
        with self.assertRaisesRegex(CatalogError, "escapes repository"):
            build_catalog(root)

    def test_rejects_other_raw_repository_even_when_local_suffix_exists(self):
        root = self.fixture(script_url="https://raw.githubusercontent.com/other/project/main/js/handler.js")
        with self.assertRaisesRegex(CatalogError, "must point to Minwsun/IOS_Breaker"):
            build_catalog(root)

    def test_accepts_repository_owner_and_name_case_insensitively(self):
        root = self.fixture(script_url="https://raw.githubusercontent.com/mINwSun/iOS_bReAkEr/main/js/handler.js")
        self.assertEqual(build_catalog(root)["modules"][0]["scripts"][0]["local_script"], "js/handler.js")

    def test_groups_overlapping_provider_patterns(self):
        root = self.fixture(
            script_url="https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/handler.js",
            pattern=r"^https:\/\/api\.revenuecat\.com\/.+\/(receipts|subscribers)",
        )
        second = (root / "modules/Example.sgmodule").read_text(encoding="utf-8")
        (root / "modules/Example.sgmodule").write_text(second.replace("Example", "Example Two"), encoding="utf-8")
        (root / "modules/Second.sgmodule").write_text(second.replace("Example", "Second"), encoding="utf-8")
        catalog = build_catalog(root)
        groups = catalog["conflict_groups"]
        self.assertEqual(len(groups), 1)
        self.assertEqual(groups[0]["id"], "revenuecat-overlap")
        self.assertEqual(len(groups[0]["members"]), 2)

    def test_describes_cross_provider_group_separately_from_conflicts(self):
        root = self.fixture()
        (root / "modules/Example.sgmodule").write_text(
            "#!name=RevenueCat\n[Script]\nrc = type=http-response, pattern=^https://api.revenuecat.com/receipts$, "
            "script-path=https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/handler.js\n",
            encoding="utf-8",
        )
        (root / "modules/Spotify.sgmodule").write_text(
            "#!name=Spotify\n[Script]\nsp = type=http-response, pattern=^https://spclient.spotify.com/customize$, "
            "script-path=https://raw.githubusercontent.com/Minwsun/IOS_Breaker/main/js/handler.js\n",
            encoding="utf-8",
        )
        catalog = build_catalog(root)
        self.assertEqual(catalog["integration_groups"][0]["id"], "revenuecat-plus-spotify")
        self.assertEqual(catalog["conflict_groups"], [])

    def test_generated_outputs_are_deterministic(self):
        root = self.fixture()
        first = generated(root)
        second = generated(root)
        self.assertEqual(first, second)
        payload = json.loads(first[root / "config/module-catalog.json"])
        self.assertEqual(payload["schema_version"], 1)

    def test_reads_selector_from_argument_and_first_append_hostname(self):
        root = self.fixture()
        path = root / "modules/Example.sgmodule"
        text = path.read_text(encoding="utf-8").replace("script-path=", "argument=ua=1Blocker%7CBlockerX,script-path=")
        text += "\n[MITM]\nhostname = %APPEND% api.revenuecat.com, api.rc-backup.com\n"
        path.write_text(text, encoding="utf-8")
        item = build_catalog(root)["modules"][0]
        self.assertEqual(item["scripts"][0]["user_agent"], "1Blocker|BlockerX")
        self.assertIn("api.revenuecat.com", item["mitm_hosts"])

    def test_all_in_one_is_included_in_overlap_detection(self):
        root = self.fixture(pattern="^https://api.revenuecat.com/v1/subscribers/test$")
        (root / "All_In_One.sgmodule").write_text((root / "modules/Example.sgmodule").read_text(encoding="utf-8"), encoding="utf-8")
        catalog = build_catalog(root)
        self.assertEqual(len(catalog["modules"]), 2)
        self.assertIn("All_In_One.sgmodule", catalog["conflict_groups"][0]["members"])

    def test_all_in_one_conf_variant_is_in_catalog_and_global_conflicts(self):
        root = self.fixture(pattern=r"^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/test$")
        scoped = (root / "modules/Example.sgmodule").read_text(encoding="utf-8")
        scoped = scoped.replace("script-path=", "argument=ua=Example,script-path=")
        (root / "modules/Example.sgmodule").write_text(scoped, encoding="utf-8")
        global_handler = scoped.replace(", argument=ua=Example", "")
        (root / "All_In_One.sgmodule").write_text(global_handler, encoding="utf-8")
        (root / "All_In_One.conf").write_text(global_handler, encoding="utf-8")
        catalog = build_catalog(root)
        revenuecat = next(group for group in catalog["conflict_groups"] if group["id"] == "revenuecat-overlap")
        self.assertIn("All_In_One.sgmodule", revenuecat["global_handlers"])
        self.assertIn("All_In_One.conf", revenuecat["global_handlers"])
        self.assertIn(["All_In_One.conf", "modules/Example.sgmodule"], revenuecat["global_scoped_pairs"])

    def test_scoped_profiles_conflict_only_for_matching_user_agent(self):
        root = self.fixture(pattern=r"^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/test$")
        template = (root / "modules/Example.sgmodule").read_text(encoding="utf-8").replace("script-path=", "argument=ua=Example,script-path=")
        (root / "modules/Example.sgmodule").write_text(template, encoding="utf-8")
        template = template.replace("ua=Example", "ua=Locket")
        (root / "modules/Locket.sgmodule").write_text(template, encoding="utf-8")
        (root / "modules/RevenueCat-Locket.sgmodule").write_text(template, encoding="utf-8")
        other = template.replace("ua=Locket", "ua=VSCO")
        (root / "modules/RevenueCat-VSCO.sgmodule").write_text(other, encoding="utf-8")
        catalog = build_catalog(root)
        group = next(group for group in catalog["conflict_groups"] if group["id"] == "revenuecat-overlap")
        self.assertEqual(group["same_selector_pairs"], [{
            "modules": ["modules/Locket.sgmodule", "modules/RevenueCat-Locket.sgmodule"],
            "selectors": ["locket"],
        }])
        self.assertEqual(group["global_scoped_pairs"], [])


if __name__ == "__main__":
    unittest.main()
