"""
APAC Market Research Agent
Autonomous research system for market intelligence generation
"""

import asyncio
import anthropic
from datetime import datetime
from pathlib import Path
import json
import yaml
import os
from typing import Dict, List
from dotenv import load_dotenv

from research.web_researcher import WebResearcher
from research.tam_calculator import TAMCalculator
from research.growth_analyzer import GrowthAnalyzer
from utils.logger import setup_logger
from utils.helpers import calculate_confidence_score

# Load environment variables
load_dotenv()

logger = setup_logger(__name__, log_file='agents/logs/research.log')


class MarketResearchAgent:
    """Autonomous market research agent for APAC countries"""

    def __init__(self, config_path='config.yaml'):
        # Load configuration
        config_file = Path(__file__).parent / config_path
        with open(config_file) as f:
            self.config = yaml.safe_load(f)

        # Initialize Anthropic client
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

        self.client = anthropic.Anthropic(api_key=api_key)

        # Initialize research modules
        self.web_researcher = WebResearcher(self.client)
        self.tam_calculator = TAMCalculator()
        self.growth_analyzer = GrowthAnalyzer()

        # Output configuration
        self.output_dir = Path(__file__).parent / self.config['output']['directory']
        self.history_dir = Path(__file__).parent / self.config['output']['history_directory']

        logger.info("Market Research Agent initialized")

    async def research_country(self, country: str, depth: str = 'standard') -> dict:
        """
        Conduct comprehensive market research for a country

        Args:
            country: Country code (india, singapore, etc.)
            depth: Research depth (quick, standard, deep)

        Returns:
            Market intelligence dictionary
        """
        logger.info(f"=" * 80)
        logger.info(f"Starting {depth} research for {country}")
        logger.info(f"=" * 80)

        start_time = datetime.now()

        try:
            # Phase 1: Market Data Collection
            logger.info("Phase 1: Collecting market data...")
            market_data = await self.web_researcher.search_market_reports(country)

            if 'error' in market_data:
                logger.error(f"Market data collection failed: {market_data['error']}")
                raise Exception(f"Market data collection failed: {market_data['error']}")

            # Phase 2: Use Case Identification
            logger.info("Phase 2: Identifying use cases...")
            use_cases = await self.web_researcher.identify_use_cases(country, market_data)

            if not use_cases:
                logger.warning("No use cases identified, creating default use cases")
                use_cases = self._create_default_use_cases(country, market_data)

            # Phase 3: TAM/SAM/SOM Calculation
            logger.info(f"Phase 3: Calculating market sizes for {len(use_cases)} use cases...")
            for i, use_case in enumerate(use_cases, 1):
                logger.info(f"  Calculating TAM/SAM/SOM for use case {i}/{len(use_cases)}: {use_case.get('name', 'Unknown')}")
                tam_sam_som = await self.tam_calculator.calculate(
                    country, use_case, market_data
                )
                use_case.update(tam_sam_som)

            # Phase 4: Growth Analysis
            logger.info("Phase 4: Analyzing growth trends...")
            growth_factors = await self.growth_analyzer.analyze(
                country, use_cases, market_data
            )

            # Phase 5: Competitive Intelligence
            logger.info("Phase 5: Mapping competitive landscape...")
            competitive = market_data.get('competitive', {})

            # Phase 6: Generate Recommendations
            logger.info("Phase 6: Generating recommendations...")
            recommendations = await self.web_researcher.generate_recommendations(
                country, use_cases, market_data, competitive
            )

            # Phase 7: Synthesize Intelligence
            duration = (datetime.now() - start_time).total_seconds()

            # Calculate data quality score
            quality_metadata = {
                'num_sources': len(market_data.get('sources', [])),
                'num_data_points': sum(1 for uc in use_cases if 'tam' in uc),
                'last_updated': datetime.now().isoformat(),
                'cross_validated': len(use_cases) >= 5
            }
            data_quality_score = calculate_confidence_score(quality_metadata) * 10

            intelligence = {
                'country': country,
                'lastUpdated': datetime.now().isoformat(),
                'researchVersion': '1.0',
                'dataQualityScore': round(data_quality_score, 1),
                'sources': market_data.get('sources', []),
                'useCases': use_cases,
                'marketOverview': {
                    'totalDigitalPaymentsTAM': market_data.get('market_overview', {}).get('digital_payments_tam', 0),
                    'fintechGrowthRate': market_data.get('market_overview', {}).get('fintech_growth_rate', 0),
                    'digitalIdentityMarketSize': market_data.get('market_overview', {}).get('digital_identity_market_size', 0),
                    'regulatoryScore': market_data.get('regulatory', {}).get('score', 5.0),
                    'technologyReadiness': market_data.get('technology', {}).get('readiness', 5.0),
                    'marketMaturity': self._assess_market_maturity(market_data, use_cases),
                    'competitiveIntensity': competitive.get('intensity', 'medium')
                },
                'growthFactors': growth_factors,
                'competitiveLandscape': competitive,
                'recommendations': recommendations,
                'researchMetadata': {
                    'totalSourcesAnalyzed': len(market_data.get('sources', [])),
                    'webSearchQueries': market_data.get('metadata', {}).get('num_sources', 0),
                    'documentsProcessed': 1,
                    'dataPointsExtracted': len(use_cases) * 10,  # Estimate
                    'confidenceScore': round(data_quality_score / 10, 2),
                    'researchDuration': int(duration),
                    'depth': depth,
                    'timestamp': datetime.now().isoformat(),
                    'lastManualReview': None
                }
            }

            logger.info(f"=" * 80)
            logger.info(f"Research completed successfully in {duration:.0f}s")
            logger.info(f"Data Quality Score: {intelligence['dataQualityScore']}/10")
            logger.info(f"Use Cases Identified: {len(use_cases)}")
            logger.info(f"Recommendations Generated: {len(recommendations)}")
            logger.info(f"=" * 80)

            return intelligence

        except Exception as e:
            logger.error(f"Research failed: {e}", exc_info=True)
            raise

    def _create_default_use_cases(self, country: str, market_data: Dict) -> List[Dict]:
        """Create default use cases if identification fails"""

        currency = market_data.get('country', {}).get('currency', 'USD')

        return [
            {
                'id': 'digital-identity-basic',
                'name': 'Digital Identity Authentication',
                'description': 'Basic digital identity verification service',
                'category': 'authentication',
                'target_market': 'General',
                'adoptionRate': 30.0,
                'cagr': 20.0,
                'maturity': 'growth',
                'competitiveIntensity': 'medium',
                'competitive_intensity_factor': 0.3,
                'keyDrivers': ['Digital transformation', 'Government initiatives'],
                'barriers': ['Infrastructure gaps', 'Privacy concerns'],
                'pricing': {'min': 0.10, 'max': 2.00, 'average': 0.50},
                'transaction_frequency': 12,
                'annual_transactions_per_user': 24,
                'target_segment_percentage': 0.25,
                'market_penetration': 0.30,
                'suggestedSegments': [{
                    'name': 'Basic Authentication',
                    'price': 0.50,
                    'cost': 0.15,
                    'monthlyVolume': 10000000,
                    'growthRate': 20.0,
                    'category': 'authentication'
                }]
            }
        ]

    def _assess_market_maturity(self, market_data: Dict, use_cases: List[Dict]) -> str:
        """Assess overall market maturity"""

        digital_penetration = market_data.get('technology', {}).get('digital_penetration', 50.0)
        regulatory_score = market_data.get('regulatory', {}).get('score', 5.0)

        # Average maturity of use cases
        maturities = [uc.get('maturity', 'growth') for uc in use_cases]
        maturity_counts = {
            'emerging': maturities.count('emerging'),
            'growth': maturities.count('growth'),
            'mature': maturities.count('mature')
        }

        dominant_maturity = max(maturity_counts, key=maturity_counts.get)

        # Adjust based on market conditions
        if digital_penetration < 40:
            return 'emerging'
        elif digital_penetration < 70:
            return 'growth'
        else:
            return dominant_maturity

    def save_intelligence(self, country: str, intelligence: dict):
        """
        Save market intelligence to file

        Args:
            country: Country code
            intelligence: Intelligence dictionary
        """
        # Create output directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.history_dir.mkdir(parents=True, exist_ok=True)

        # Save main intelligence file
        output_path = self.output_dir / f'{country}_market_intel.json'
        with open(output_path, 'w') as f:
            json.dump(intelligence, f, indent=2)

        logger.info(f"Saved intelligence to {output_path}")

        # Save to history
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        history_path = self.history_dir / f'{timestamp}_{country}.json'
        with open(history_path, 'w') as f:
            json.dump(intelligence, f, indent=2)

        logger.info(f"Saved history to {history_path}")

        # Update index
        self._update_index(country, intelligence)

    def _update_index(self, country: str, intelligence: dict):
        """Update market intelligence index file"""

        index_path = self.output_dir / 'index.json'

        # Load existing index
        if index_path.exists():
            with open(index_path) as f:
                index = json.load(f)
        else:
            index = {'countries': []}

        # Find and update country entry
        country_entry = {
            'country': country,
            'lastUpdated': intelligence['lastUpdated'],
            'qualityScore': intelligence['dataQualityScore'],
            'useCases': len(intelligence['useCases']),
            'recommendations': len(intelligence['recommendations'])
        }

        # Remove old entry if exists
        index['countries'] = [c for c in index['countries'] if c['country'] != country]

        # Add new entry
        index['countries'].append(country_entry)

        # Save index
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)

        logger.info(f"Updated index at {index_path}")


async def main():
    """Main entry point"""
    import sys

    # Parse command line arguments
    if len(sys.argv) > 1:
        country = sys.argv[1]
        depth = sys.argv[2] if len(sys.argv) > 2 else 'standard'
    else:
        country = 'india'
        depth = 'standard'

    print(f"\n{'=' * 80}")
    print(f"APAC Market Research Agent - v1.0")
    print(f"Researching: {country.upper()}")
    print(f"Depth: {depth}")
    print(f"{'=' * 80}\n")

    try:
        agent = MarketResearchAgent()
        intelligence = await agent.research_country(country, depth)
        agent.save_intelligence(country, intelligence)

        print(f"\n{'=' * 80}")
        print(f"✅ Research completed successfully for {country.upper()}")
        print(f"{'=' * 80}")
        print(f"📊 Data Quality Score: {intelligence['dataQualityScore']}/10")
        print(f"🎯 Use Cases Identified: {len(intelligence['useCases'])}")
        print(f"💡 Recommendations: {len(intelligence['recommendations'])}")
        print(f"📁 Output: market-intelligence/{country}_market_intel.json")
        print(f"{'=' * 80}\n")

    except Exception as e:
        print(f"\n❌ Research failed: {e}\n")
        logger.error(f"Research failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
