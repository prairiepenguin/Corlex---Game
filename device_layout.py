"""Device hints from the Streamlit session; the browser refines these by viewport."""


def detect_device(headers) -> str:
    headers = {str(k).lower(): str(v) for k, v in headers.items()}
    agent = headers.get("user-agent", "").lower()
    if any(token in agent for token in ("ipad", "tablet", "kindle", "silk/")):
        return "tablet"
    if "android" in agent and "mobile" not in agent:
        return "tablet"
    if headers.get("sec-ch-ua-mobile") == "?1" or any(
        token in agent for token in ("iphone", "ipod", "android", "windows phone", "mobile")
    ):
        return "phone"
    if any(token in agent for token in ("windows", "macintosh", "x11", "cros")):
        return "desktop"
    return "unknown"
