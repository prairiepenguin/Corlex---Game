"""Run with: python -m streamlit run streamlit_app.py"""

import streamlit as st

from game_bundle import build_game_html
from device_layout import detect_device


def main() -> None:
    st.set_page_config(
        page_title="Corlex · Playable Demos",
        page_icon="🪐",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    st.html("""<style>
        .stMainBlockContainer { max-width: 1720px; padding-top: 1rem; padding-bottom: 1rem; }
        @media (max-width: 760px) {
            .stMainBlockContainer { padding-left: 8px; padding-right: 8px; }
        }
        </style>""")
    device = detect_device(st.context.headers)
    game_slot = st.container()
    with st.expander("Display & controls"):
        mode = st.selectbox(
            "Game layout",
            ("Automatic", "Touch / mobile", "Desktop"),
            help="Automatic uses the browser's device hints, screen width, and touch support.",
        )
        st.caption(
            f"Browser device hint: {device}. The game also checks its available width "
            "and touch support, including when you rotate the screen."
        )
        st.markdown(
            "Choose **Play the confrontation** on the cover screen for the Tengra "
            "demo. Inspect the emitter and clock, talk to Amanda, and find a distraction. "
            "There is no reflex timer. The optional Sound button enables quiet effects.\n\n"
            "For the cargo-room demo, choose **Begin investigation** and start with "
            "the **duffel by the bunk**. Click objects to investigate, "
            "collect equipment, and solve the case. Select an inventory item, "
            "then an object to use it.\n\n"
            "**H** reveals hotspots · **J** opens your notebook · "
            "**Esc** closes a view. Click **Mike** for hints.\n\n"
            "Progress is stored in this browser when browser storage is available. "
            "Reset it through the in-game journal. On phones, use the Room objects "
            "and Holographic files buttons below the artwork."
        )
    with game_slot:
        st.iframe(
            build_game_html(
                device_hint=device,
                layout_mode={"Automatic": "auto", "Touch / mobile": "mobile", "Desktop": "desktop"}[mode],
            ),
            height="content", width="stretch", tab_index=0,
        )


if __name__ == "__main__":
    main()
