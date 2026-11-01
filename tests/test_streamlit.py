import base64
import re
import unittest
from pathlib import Path

from streamlit.testing.v1 import AppTest

from game_bundle import ROOT, SCENE, COVER, build_game_html
from device_layout import detect_device


class StreamlitGameTests(unittest.TestCase):
    def test_device_detection(self):
        cases = [
            ({"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18) Mobile"}, "phone"),
            ({"user-agent": "Mozilla/5.0 (Linux; Android 15) Mobile"}, "phone"),
            ({"user-agent": "Mozilla/5.0 (iPad; CPU OS 18)"}, "tablet"),
            ({"user-agent": "Mozilla/5.0 (Linux; Android 15; Tablet)"}, "tablet"),
            ({"user-agent": "Mozilla/5.0 (Windows NT 10.0)"}, "desktop"),
            ({"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X)"}, "desktop"),
            ({"Sec-CH-UA-Mobile": "?1"}, "phone"),
            ({}, "unknown"),
        ]
        for headers, expected in cases:
            with self.subTest(headers=headers):
                self.assertEqual(detect_device(headers), expected)

    def test_layout_hint_and_manual_override_are_bundled(self):
        page = build_game_html(device_hint="phone", layout_mode="mobile")
        self.assertIn('data-device-hint="phone"', page)
        self.assertIn('data-layout-mode="mobile"', page)
        self.assertIn("window.CorlexDevice", page)
        self.assertIn('id="touch-targets"', page)
        with self.assertRaises(ValueError):
            build_game_html(layout_mode='invalid')
    def test_bundle_is_self_contained_and_keeps_game_controls(self):
        page = build_game_html()
        self.assertNotRegex(page, r'<(?:script|link)\b[^>]*(?:src|href)="(?!data:)')
        self.assertNotIn(f"url('{SCENE}')", page)
        self.assertIn('id="inventory"', page)
        self.assertIn('id="modal"', page)
        self.assertIn("function network()", page)
        self.assertIn("function dossier()", page)
        self.assertIn("#game { width: 100%;", page)
        images = re.findall(r"data:image/png;base64,([A-Za-z0-9+/=]+)", page)
        self.assertEqual(len(images), 2)
        self.assertEqual(
            {base64.b64decode(image) for image in images},
            {(ROOT / SCENE).read_bytes(), (ROOT / COVER).read_bytes()},
        )
        self.assertIn('id="opening"', page)
        self.assertIn('id="start-game"', page)
        self.assertNotIn('src="cover.png"', page)

    def test_streamlit_app_starts_and_embeds_game(self):
        app = AppTest.from_file(str(ROOT / "streamlit_app.py"), default_timeout=20).run()
        self.assertEqual(len(app.exception), 0, str(app.exception))
        frames = app.get("iframe")
        self.assertEqual(len(frames), 1)
        self.assertIn('id="game"', frames[0].proto.srcdoc)
        self.assertEqual(len(app.expander), 1)
        self.assertEqual(app.selectbox[0].value, "Automatic")
        app.selectbox[0].select("Touch / mobile").run()
        self.assertEqual(len(app.exception), 0)
        self.assertIn('data-layout-mode="mobile"', app.get("iframe")[0].proto.srcdoc)
        app.selectbox[0].select("Desktop").run()
        self.assertEqual(len(app.exception), 0)
        self.assertIn('data-layout-mode="desktop"', app.get("iframe")[0].proto.srcdoc)


if __name__ == "__main__":
    unittest.main()
