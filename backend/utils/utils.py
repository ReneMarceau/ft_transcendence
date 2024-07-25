import re
import html

from datetime import datetime, timezone


def timestamp_to_iso(timestamp):
    """
    Convert a UNIX timestamp to an ISO formatted string in UTC.
    """
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def sanitize_input(text):
    """
    Sanitizes the input text by escaping HTML characters and removing potentially dangerous tags.
    """
    if not isinstance(text, str):
        return text

    # Define patterns for dangerous tags
    patterns = [
        re.compile(r"<script.*?>.*?</script>", re.IGNORECASE | re.DOTALL),
        re.compile(r"<iframe.*?>.*?</iframe>", re.IGNORECASE | re.DOTALL),
        re.compile(r"<object.*?>.*?</object>", re.IGNORECASE | re.DOTALL),
        re.compile(r"<embed.*?>.*?</embed>", re.IGNORECASE | re.DOTALL),
        re.compile(r"<link.*?>.*?</link>", re.IGNORECASE | re.DOTALL),
        re.compile(r"<style.*?>.*?</style>", re.IGNORECASE | re.DOTALL),
        re.compile(r'on\w+=".*?"', re.IGNORECASE),  # Inline event handlers like onclick
        re.compile(r"javascript:", re.IGNORECASE),  # JavaScript URI scheme
        re.compile(r"vbscript:", re.IGNORECASE),  # VBScript URI scheme
        re.compile(r"data:text/html", re.IGNORECASE),  # Data URIs
    ]

    # Remove dangerous patterns
    for pattern in patterns:
        text = pattern.sub("", text)

    # Escape HTML characters
    text = html.escape(text)

    return text
