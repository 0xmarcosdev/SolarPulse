from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

SYSTEM_TIMEZONE = ZoneInfo("America/Havana")

def get_current_havana_time() -> datetime:
    """
    Devuelve siempre el datetime actual consciente de zona horaria para Cuba (America/Havana).
    Garantiza que la hora del sistema sea inalterable por desfases UTC o del host local.
    """
    return datetime.now(SYSTEM_TIMEZONE)


def get_current_havana_date() -> date:
    """Devuelve la fecha actual (YYYY-MM-DD) en zona horaria America/Havana."""
    return get_current_havana_time().date()


def get_today_start_end_utc_or_local() -> tuple[datetime, datetime]:
    """
    Devuelve el rango de inicio y fin del día actual (00:00 a 24:00) 
    en America/Havana, correctamente acotado.
    """
    now = get_current_havana_time()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end
