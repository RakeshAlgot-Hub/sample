import logging
from logging.config import dictConfig
from datetime import datetime, timezone
from core.config import settings


class UtcFormatter(logging.Formatter):
    """
    Custom formatter to enforce UTC timestamps
    """

    def formatTime(self, record, datefmt=None):
        utcTime = datetime.fromtimestamp(record.created, tz=timezone.utc)
        if datefmt:
            return utcTime.strftime(datefmt)
        return utcTime.isoformat()


def setupLogger():
    """
    Configure application-wide logger
    """

    logLevel = settings.logLevel.upper()

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "()": UtcFormatter,
                    "format": (
                        "%(asctime)s | %(levelname)s | "
                        "%(name)s | %(message)s"
                    ),
                }
            },
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                }
            },
            "loggers": {
                "": {  # root logger
                    "handlers": ["default"],
                    "level": logLevel,
                }
            },
        }
    )
