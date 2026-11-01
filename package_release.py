"""Create a deployment ZIP from explicitly selected game files."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent
FILES = (
    "streamlit_app.py",
    "game_bundle.py",
    "device_layout.py",
    "requirements.txt",
    ".streamlit/config.toml",
    ".github/workflows/check.yml",
    ".gitignore",
    "index.html",
    "style.css",
    "interactions.css",
    "opening.css",
    "mobile.css",
    "device.js",
    "game-v2.js",
    "corlex-cargo-berth-concept.png",
    "cover.png",
    "tests/game.test.mjs",
    "tests/device.test.mjs",
    "tests/test_streamlit.py",
    "README.md",
    "DEPLOY.md",
    "package_release.py",
)


def main() -> None:
    output = ROOT / "dist" / "corlex-game.zip"
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
        for filename in FILES:
            archive.write(ROOT / filename, arcname=filename)
    print(f"Packaged {len(FILES)} files: {output}")


if __name__ == "__main__":
    main()
