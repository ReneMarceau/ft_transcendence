from datetime import datetime, timezone

def timestamp_to_iso(timestamp):
    """
    Convert a UNIX timestamp to an ISO formatted string in UTC.
    """
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()