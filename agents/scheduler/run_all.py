"""Run research for all countries manually"""

import asyncio
from datetime import datetime
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from main import MarketResearchAgent


async def research_all_countries():
    """Research all configured countries"""
    print(f"\n{'=' * 80}")
    print(f"APAC Market Research Agent - Batch Research")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"{'=' * 80}\n")

    agent = MarketResearchAgent()
    countries = agent.config['countries']

    print(f"Countries to research: {', '.join(countries)}")
    print(f"Total: {len(countries)}\n")

    results = {
        'success': [],
        'failed': []
    }

    for i, country in enumerate(countries, 1):
        try:
            print(f"\n[{i}/{len(countries)}] Researching {country.upper()}...")
            print(f"{'-' * 80}")

            intelligence = await agent.research_country(country, depth='standard')
            agent.save_intelligence(country, intelligence)

            results['success'].append(country)

            print(f"✅ {country.upper()} completed")
            print(f"   Quality Score: {intelligence['dataQualityScore']}/10")
            print(f"   Use Cases: {len(intelligence['useCases'])}")
            print(f"   Recommendations: {len(intelligence['recommendations'])}")

        except Exception as e:
            print(f"❌ {country.upper()} failed: {e}")
            results['failed'].append(country)

    print(f"\n{'=' * 80}")
    print(f"Batch Research Complete")
    print(f"{'=' * 80}")
    print(f"✅ Successful: {len(results['success'])}/{len(countries)}")
    print(f"❌ Failed: {len(results['failed'])}/{len(countries)}")

    if results['success']:
        print(f"\nSuccessful: {', '.join(results['success'])}")

    if results['failed']:
        print(f"\nFailed: {', '.join(results['failed'])}")

    print(f"{'=' * 80}\n")


if __name__ == '__main__':
    asyncio.run(research_all_countries())
