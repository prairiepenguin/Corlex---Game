# Deploy Corlex

## Streamlit Community Cloud

1. Put the game files in a GitHub repository you control. If uploading the release ZIP, extract it first and upload its contents, not the ZIP itself.
2. Open https://share.streamlit.io and sign in with GitHub.
3. Create an app and select your repository, branch `main`, and main file `streamlit_app.py`.
4. In Advanced settings, choose Python 3.12. No secrets are required.
5. Deploy. Streamlit installs `requirements.txt` automatically.

If a private repository is missing, grant Streamlit access to that repository in GitHub. The GitHub connector used by this coding session separately needs access before it can upload code.

## Required deployment files

- `streamlit_app.py`
- `game_bundle.py`
- `device_layout.py`
- `requirements.txt`
- `.streamlit/config.toml`
- `index.html`
- `style.css`
- `interactions.css`
- `opening.css`
- `mobile.css`
- `device.js`
- `game-v2.js`
- `corlex-cargo-berth-concept.png`
- `cover.png`

The cover is the opening-screen artwork and is included in deployment. The source manuscript, generation prompt, and old `game.js` are not required. They are excluded from the release ZIP and ignored by Git.

## Local run and checks

```sh
python -m pip install -r requirements.txt
python -m streamlit run streamlit_app.py
```

```sh
python -m unittest discover -s tests -p "test_*.py"
node tests/game.test.mjs
node tests/device.test.mjs
```

The Python checks verify Streamlit startup and asset bundling. The JavaScript checks verify game interactions with a DOM fixture. They do not replace visual testing in a browser. GitHub Actions runs both on pushes and pull requests.

Automatic device detection runs for each visitor. Request headers provide the initial hint; browser checks choose and update the layout. Visitors can override the layout under Display & controls. No API keys or device-detection service are needed.

## Release ZIP

```sh
python package_release.py
```

This writes `dist/corlex-game.zip` from an explicit list of application files. It does not include local settings, environments, credentials, or the manuscript.

## References

- Streamlit iframe API: https://docs.streamlit.io/develop/api-reference/text/st.iframe
- Streamlit session headers: https://docs.streamlit.io/1.58.0/develop/api-reference/caching-and-state/st.context
- Streamlit deployment guide: https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/deploy
