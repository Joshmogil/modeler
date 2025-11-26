from datetime import datetime, timezone



class AppleDT:
    @staticmethod
    def now() -> str:
        return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    
    @staticmethod
    def convert(dt: datetime) -> str:
        return dt.astimezone(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
