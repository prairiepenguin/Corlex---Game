# A moment of silence — Tengra apartment demo

Refresh the Streamlit app at `http://localhost:8501`, or open `index.html`. From the cover screen, choose **Play the confrontation**. No progress in the cargo-room demo is required.

## Play

Explore by clicking the illustration or the labeled target buttons. Talk to Amanda through the dialogue options. Select the cup or stunner from Equipment, then choose its target. Ask Mike for a hint if needed. Press H to outline hotspots or Escape to cancel equipment or close an inspection.

Tension changes only when you make choices; there is no real-time countdown. Wrong tactics can return you to cover, preserving your observations and collected cup. Enable Sound for quiet synthesized effects; it starts off. Reduced-motion settings disable scene animations.

The confrontation saves independently under `corlex-tengra-v1`. Restart encounter affects only this demo. Use Title screen to switch demos.

## Walkthrough (spoilers)

1. Inspect the suppression emitter. Mark the field.
2. Inspect the wall clock. Keep the observation in mind.
3. Inspect the kitchen island and take the silver cup.
4. Talk to Amanda. Admit you are in over your head, then ask her to promise not to shoot. Other conciliatory responses can establish the same truce.
5. Select the cup, then the broken doorway. This prepares the distraction beyond the sound field.
6. Choose Make your move, then Wait for the clock glance.
7. Wait for her glance. Send the cup beyond the field.
8. Move left and use the stunner, or select the stunner and then Amanda.
9. Continue the final conversation for a cliffhanger, replay, or return to the cover screen.

## Adaptation and artwork

This adapts the Chapter 19 standoff: the island, suppressor, rifle, robotic arm, and glance at the clock come from the manuscript. The cup distraction, tension system, stunner outcome, and final dialogue are gameplay additions. The manuscript's ending with Annie is unchanged in the source book.

Both bitmap assets were made using the built-in image-generation tool, with the cover as the style reference. The aftermath was generated as an edit of the apartment frame. The source files are:

- `tengra-apartment.png` — initial confrontation artwork.
- `tengra-aftermath.png` — non-graphic ending artwork.
- `tengra-art-prompt.txt` — complete initial scene prompt.
- `tengra-aftermath-prompt.txt` — complete ending-frame edit prompt.

`tengra.js` supplies the interactions, `tengra.css` supplies desktop/touch layouts and the short cinematic effects, and `game_bundle.py` embeds all assets into Streamlit. No external image host or audio service is required.

## Verification

`node tests/tengra.test.mjs` checks launch, observations, collection, truce, prerequisites, wrong tactics, recovery, the final move, ending, resume, restart, and independence of the cargo-room save. Python tests check bundled assets and Streamlit startup. These are interaction and integration checks; visual and audio testing in a real browser remains necessary.
