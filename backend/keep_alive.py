import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)

def start_keep_alive_scheduler():
    """
    Start a background scheduler that logs periodic messages.
    This keeps the Render service warm and prevents cold starts.
    Logs every 14 minutes (840 seconds) to show the service is active.
    """
    scheduler = BackgroundScheduler()
    
    def log_heartbeat():
        logger.info("✓ Keep-alive heartbeat - Service is active")
    
    # Add job to run every 14 minutes (840 seconds)
    # Render free tier spins down after 15 minutes of inactivity
    scheduler.add_job(
        log_heartbeat,
        IntervalTrigger(seconds=840),
        id='keep_alive',
        name='Keep service warm',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("✓ Keep-alive scheduler started")
    return scheduler
