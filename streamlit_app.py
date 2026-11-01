"""Run with: python -m streamlit run streamlit_app.py"""

import streamlit as st

from game_bundle import build_game_html


def main() -> None:
    st.set_page_config(
        page_title="Corlex · Death Bringer",
        page_icon="🪐",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    st.html("""<style>
        .stMainBlockContainer { max-width: 1720px; padding-top: 1rem; padding-bottom: 1rem; }
        </style>""")
    st.iframe(build_game_html(), height="content", width="stretch", tab_index=0)
    with st.expander("How to play"):
        st.markdown(
            "Start with the **duffel by the bunk**. Click objects to investigate, "
            "collect equipment, and solve the case. Select an inventory item, "
            "then an object to use it.\n\n"
            "**H** reveals hotspots · **J** opens your notebook · "
            "**Esc** closes a view. Click **Mike** for hints.\n\n"
            "Progress is stored in this browser when browser storage is available. "
            "Reset it through the in-game journal. Desktop or landscape mode is recommended."
        )


if __name__ == "__main__":
    main()
