"""Daily scheduler for automated research updates"""

import schedule
import time
import asyncio
from datetime import datetime
from pathlib import Path
import sys
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from main import MarketResearchAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_daily_research():
    """Run research for all countries"""
    try:
        agent = MarketResearchAgent()
        countries = agent.config['countries']

        logger.info(f"{'=' * 80}")
        logger.info(f"Starting daily research for {len(countries)} countries")
        logger.info(f"Timestamp: {datetime.now().isoformat()}")
        logger.info(f"{'=' * 80}")

        results = {
            'success': [],
            'failed': []
        }

        for country in countries:
            try:
                logger.info(f"\nResearching {country}...")
                intelligence = asyncio.run(agent.research_country(country, depth='standard'))
                agent.save_intelligence(country, intelligence)

                results['success'].append({
                    'country': country,
                    'quality_score': intelligence['dataQualityScore'],
                    'use_cases': len(intelligence['useCases'])
                })

                logger.info(f"✅ {country} completed (Quality: {intelligence['dataQualityScore']}/10)")

                # Small delay between countries to avoid rate limiting
                time.sleep(5)

            except Exception as e:
                logger.error(f"❌ {country} failed: {e}")
                results['failed'].append({
                    'country': country,
                    'error': str(e)
                })

        logger.info(f"\n{'=' * 80}")
        logger.info(f"Daily research completed")
        logger.info(f"Success: {len(results['success'])}/{len(countries)}")
        logger.info(f"Failed: {len(results['failed'])}/{len(countries)}")
        logger.info(f"{'=' * 80}\n")

    except Exception as e:
        logger.error(f"Daily research job failed: {e}", exc_info=True)


def main():
    """Main scheduler loop"""
    # Get schedule time from config
    schedule_time = "02:00"  # 2 AM UTC by default

    # Schedule for daily run
    schedule.every().day.at(schedule_time).do(run_daily_research)

    logger.info(f"{'=' * 80}")
    logger.info(f"Market Research Agent Scheduler")
    logger.info(f"{'=' * 80}")
    logger.info(f"Scheduled daily at: {schedule_time} UTC")
    logger.info(f"Press Ctrl+C to stop")
    logger.info(f"{'=' * 80}\n")

    # Run immediately on startup for testing
    logger.info("Running initial research on startup...")
    run_daily_research()

    # Main loop
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\nScheduler stopped by user")
    except Exception as e:
        logger.error(f"Scheduler crashed: {e}", exc_info=True)
