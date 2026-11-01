# Corlex — Death Bringer

## Run with Streamlit

```sh
python -m pip install -r requirements.txt
python -m streamlit run streamlit_app.py
```

Deploy to Streamlit Community Cloud using branch `main` and entrypoint `streamlit_app.py`. Python 3.12 is a suitable deployment choice. The app needs no secrets or external services. See [DEPLOY.md](DEPLOY.md) for the upload checklist.

The Streamlit wrapper uses `st.iframe` and bundles the artwork, styles, and JavaScript into a self-contained document. The browser version remains available below. Progress remains in each player's browser; it is not synced between devices.

The game opens on the book cover with instructions and a Begin investigation button. Returning players see Continue investigation. The Title screen link returns to the cover without clearing progress.

## Play without Streamlit

Open `index.html` in a modern desktop browser. No installation or server is needed. Keep the scene PNG and the HTML, CSS, and JavaScript files together. Reload an already open tab to load the rebuilt version.

The original concept painting remains the room background. This is a single-room investigation with interactive close-ups, equipment collection, a radio-tuning puzzle, archive search filters, an evidence timeline, candidate elimination, and a case board. Corlex remains part of the painting; character walking and further rooms are not implemented.

## Controls

- Click room objects to open their close-ups. Important objects offer actions directly, without requiring a verb change.
- Collect items by clicking them in close-ups. Select an inventory item, then a room object to use it. Click the item again or press Escape to cancel.
- Click Mike for conversation, contextual hints, or an explicit solution.
- Press H to reveal hotspots, J for the notebook, or 1 / 2 / 3 for Look / Use / Talk.
- The objective at the top tracks the next task. Evidence and collected items save automatically. Start over through the notebook.
- The lamp toggles the room lighting. The coffee and cap have optional interactions.

## Walkthrough (spoilers)

1. Open the duffel and collect both the earpiece and field notebook.
2. Use the earpiece on the porthole. Tune the receiver to 407.3 MHz (92% signal or better), then lock the signal.
3. Open Military archives. Search Community Special Forces / after the war, before the first kill / precision weapons. Pin the result to the notebook.
4. Open Timeline. Select Asteroid Wars end, specialist commendation, first Reaper killing. Verify the sequence.
5. Open Image matches. Select Amanda, whose training and service window fit the clues.
6. Open the dossier. Link the hydropolymer shot to precision training, the first kill to the post-war record, and the bounty portrait to Amanda's photograph.
7. Examine the bunk, lift the pillow, and collect the transit pass. This can also be done earlier.
8. Optionally collect the cap. Use the transit pass on the door, then press the release to finish.

The puzzle adapts Chapter 4. The receiver tuning, pass, candidate distractors, and puzzle framing are gameplay additions. The original manuscript is unchanged.

## Files and verification

`game-v2.js` is the active game. `game.js` is the earlier implementation and is not loaded. `interactions.css` extends the original scene styling.

`tests/game.test.mjs` exercises the investigation using a small DOM fixture: item collection, prerequisites, wrong answers and retries, signal tuning, archive filters, timeline ordering, case links, optional interactions, exit, reload, and reset. It can be run with Node using `node tests/game.test.mjs`. These checks validate interaction logic, not browser rendering. The in-app preview browser was unavailable during this revision.
