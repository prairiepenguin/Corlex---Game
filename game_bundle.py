"""Bundle the existing browser game for a Streamlit iframe without asset routes."""

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCENE = "corlex-cargo-berth-concept.png"
COVER = "cover.png"


def build_game_html(root: Path = ROOT, *, device_hint: str = "unknown", layout_mode: str = "auto") -> str:
    """Inline only the game's trusted local files; never load the manuscript."""
    page = (root / "index.html").read_text(encoding="utf-8-sig")
    if device_hint not in {"phone", "tablet", "desktop", "unknown"}:
        raise ValueError("Invalid device hint")
    if layout_mode not in {"auto", "mobile", "desktop"}:
        raise ValueError("Invalid layout mode")
    page = page.replace('<html lang="en">', f'<html lang="en" data-device-hint="{device_hint}" data-layout-mode="{layout_mode}">')
    for filename in ("style.css", "interactions.css", "opening.css", "mobile.css"):
        css = (root / filename).read_text(encoding="utf-8-sig")
        css = css.replace(f"url('{SCENE}')", "var(--scene-image)")
        css = css.replace(f'url("{SCENE}")', "var(--scene-image)")
        page = page.replace(
            f'<link rel="stylesheet" href="{filename}">',
            f"<style>\n{css}\n</style>",
        )

    # Avoid viewport-height feedback when Streamlit measures iframe content.
    page = page.replace(
        "</head>",
        """<style>
html, body { min-height: 0; height: auto; margin: 0; }
body { justify-content: flex-start; }
#game { width: 100%; max-width: 1672px; flex-shrink: 0; }
.instructions { margin: 8px 12px; }
</style></head>""",
    )
    # Keep a single copy of the image in the payload, shared by all CSS crops.
    image = base64.b64encode((root / SCENE).read_bytes()).decode("ascii")
    image_url = json.dumps(f"data:image/png;base64,{image}")
    bootstrap = (
        f"const bundledSceneUrl = {image_url};\n"
        "document.documentElement.style.setProperty('--scene-image', "
        "'url(\"' + bundledSceneUrl + '\")');\n"
        "document.getElementById('scene').src = bundledSceneUrl;\n"
    )
    page = page.replace(f'src="{SCENE}"', 'data-bundled-scene="true"')
    cover = base64.b64encode((root / COVER).read_bytes()).decode("ascii")
    page = page.replace(f'src="{COVER}"', f'src="data:image/png;base64,{cover}"')
    script = (root / "game-v2.js").read_text(encoding="utf-8-sig")
    script = script.replace("</script", "<\\/script")
    page = page.replace(
        '<script src="game-v2.js"></script>',
        f"<script>\n{bootstrap}{script}\n</script>",
    )
    device_script = (root / "device.js").read_text(encoding="utf-8-sig").replace("</script", "<\\/script")
    page = page.replace('<script src="device.js"></script>', f"<script>\n{device_script}\n</script>")
    return page
