"""Web research module using Claude for market intelligence"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import anthropic
from typing import Dict, List
import json
from utils.logger import setup_logger
from utils.helpers import extract_json_from_text

logger = setup_logger(__name__)


class WebResearcher:
    """Web-based research using Claude and search capabilities"""

    def __init__(self, anthropic_client: anthropic.Anthropic):
        self.client = anthropic_client

    async def search_market_reports(self, country: str) -> Dict:
        """
        Search for market reports and analysis for a country

        Args:
            country: Country code

        Returns:
            Dictionary with market research findings
        """
        logger.info(f"Searching market reports for {country}")

        prompt = self._build_market_research_prompt(country)

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=16000,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = message.content[0].text
            logger.info(f"Received market research response ({len(response_text)} chars)")

            # Extract structured data from response
            market_data = self._parse_market_research(response_text)

            return market_data

        except Exception as e:
            logger.error(f"Market research failed: {e}")
            return {
                'error': str(e),
                'sources': [],
                'data_points': []
            }

    def _build_market_research_prompt(self, country: str) -> str:
        """Build comprehensive market research prompt"""

        country_names = {
            'india': 'India',
            'singapore': 'Singapore',
            'australia': 'Australia',
            'japan': 'Japan',
            'south_korea': 'South Korea',
            'thailand': 'Thailand',
            'indonesia': 'Indonesia',
            'philippines': 'Philippines'
        }

        country_name = country_names.get(country, country.title())

        return f"""
Conduct comprehensive market research for {country_name}'s digital authentication and identity verification market.

Research Areas:
1. **Market Overview**
   - Total digital identity/authentication market size (in local currency)
   - Fintech market size and growth rate
   - Digital payments TAM
   - E-commerce authentication needs
   - Government digital services market

2. **Technology Landscape**
   - Digital penetration rate (%)
   - Smartphone penetration (%)
   - Internet penetration (%)
   - 5G rollout status (%)
   - Cloud adoption rate (%)
   - AI/ML adoption in identity verification

3. **Economic Factors**
   - GDP and GDP growth rate
   - Digital economy as % of GDP
   - Per capita income
   - Middle class population size

4. **Regulatory Environment**
   - Key regulations (e.g., data protection, digital identity)
   - Government digital transformation initiatives
   - Regulatory favorability score (1-10)
   - Recent policy changes affecting authentication

5. **Competitive Landscape**
   - Major players in digital identity/authentication
   - Market share distribution
   - Barriers to entry
   - Competitive intensity (low/medium/high)

Provide data as JSON with this structure:
{{
  "country": {{
    "name": "{country_name}",
    "code": "{country}",
    "currency": "XXX"
  }},
  "demographics": {{
    "population": 100.0,
    "urbanization": 75.0,
    "median_age": 35
  }},
  "economy": {{
    "gdp": 1000000000000,
    "gdp_growth": 5.5,
    "gdp_per_capita": 10000,
    "digital_economy_share": 8.0
  }},
  "technology": {{
    "digital_penetration": 60.0,
    "smartphone_penetration": 65.0,
    "internet_penetration": 70.0,
    "5g_rollout": 25.0,
    "cloud_adoption": 35.0,
    "ai_adoption": 20.0,
    "readiness": 7.0
  }},
  "regulatory": {{
    "score": 7.5,
    "favorability": "positive",
    "key_regulations": ["regulation1", "regulation2"],
    "recent_changes": ["change1", "change2"]
  }},
  "market_overview": {{
    "digital_identity_market_size": 500000000000,
    "authentication_market_size": 200000000000,
    "fintech_growth_rate": 25.0,
    "digital_payments_tam": 1000000000000
  }},
  "competitive": {{
    "market_leaders": [
      {{"name": "Company", "market_share": 35.0}}
    ],
    "barriers_to_entry": "medium",
    "intensity": "high"
  }},
  "sources": ["source1", "source2"]
}}

Base your response on knowledge of {country_name}'s current market conditions, recent data, and industry trends.
Provide realistic, data-driven estimates with conservative assumptions.
"""

    def _parse_market_research(self, response_text: str) -> Dict:
        """Parse market research response into structured data"""

        try:
            # Try to extract JSON
            data = extract_json_from_text(response_text)

            # Validate structure
            if not isinstance(data, dict):
                raise ValueError("Response is not a dictionary")

            # Add metadata
            data['metadata'] = {
                'response_length': len(response_text),
                'num_sources': len(data.get('sources', [])),
                'has_demographics': 'demographics' in data,
                'has_economy': 'economy' in data,
                'has_technology': 'technology' in data
            }

            logger.info(f"Parsed market data: {len(data)} top-level keys")

            return data

        except Exception as e:
            logger.error(f"Failed to parse market research: {e}")
            return {
                'error': f"Parse error: {e}",
                'raw_response': response_text[:500],  # First 500 chars for debugging
                'sources': []
            }

    async def identify_use_cases(self, country: str, market_data: Dict) -> List[Dict]:
        """
        Identify digital authentication use cases for a country

        Args:
            country: Country code
            market_data: Market data from previous research

        Returns:
            List of use case dictionaries
        """
        logger.info(f"Identifying use cases for {country}")

        prompt = self._build_use_case_prompt(country, market_data)

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=16000,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = message.content[0].text
            use_cases = extract_json_from_text(response_text)

            if not isinstance(use_cases, list):
                use_cases = [use_cases]

            logger.info(f"Identified {len(use_cases)} use cases")

            return use_cases

        except Exception as e:
            logger.error(f"Use case identification failed: {e}")
            return []

    def _build_use_case_prompt(self, country: str, market_data: Dict) -> str:
        """Build use case identification prompt"""

        country_name = market_data.get('country', {}).get('name', country.title())
        currency = market_data.get('country', {}).get('currency', 'USD')

        return f"""
Based on this market data for {country_name}, identify the top 10-15 digital authentication
and identity verification use cases with the highest revenue potential.

Market Data Summary:
- Digital Penetration: {market_data.get('technology', {}).get('digital_penetration', 'N/A')}%
- Fintech Growth: {market_data.get('market_overview', {}).get('fintech_growth_rate', 'N/A')}%
- Population: {market_data.get('demographics', {}).get('population', 'N/A')}M
- GDP per Capita: {market_data.get('economy', {}).get('gdp_per_capita', 'N/A')}

Focus on these sectors:
1. Financial Services (banking, fintech, lending)
2. E-commerce & Digital Payments
3. Government Services (digital ID, e-governance)
4. Healthcare (patient authentication, telemedicine)
5. Telecom (SIM verification, mobile authentication)
6. Travel & Hospitality
7. Education
8. Insurance
9. Real Estate
10. Emerging sectors specific to {country_name}

For each use case, provide JSON object with:
{{
  "id": "unique-use-case-id",
  "name": "Use Case Name",
  "description": "Detailed description",
  "category": "authentication|kyc|biometric|tokenization",
  "target_market": "Market segment",
  "adoptionRate": 35.0,
  "cagr": 25.0,
  "maturity": "emerging|growth|mature",
  "competitiveIntensity": "low|medium|high|very_high",
  "competitive_intensity_factor": 0.3,
  "keyDrivers": ["driver1", "driver2"],
  "barriers": ["barrier1", "barrier2"],
  "pricing": {{
    "min": 0.10,
    "max": 5.00,
    "average": 2.00
  }},
  "transaction_frequency": 12,
  "annual_transactions_per_user": 24,
  "target_segment_percentage": 0.25,
  "market_penetration": 0.30,
  "volumeEstimates": {{
    "currentMonthly": 10000000,
    "projectedYearly": 150000000
  }},
  "suggestedSegments": [
    {{
      "name": "Segment Name",
      "price": 2.50,
      "cost": 0.75,
      "monthlyVolume": 5000000,
      "growthRate": 25.0,
      "category": "kyc"
    }}
  ]
}}

Return as JSON array of use cases, ordered by revenue potential (highest first).
Base estimates on {country_name}'s specific market dynamics and regulatory environment.
"""

    async def generate_recommendations(
        self,
        country: str,
        use_cases: List[Dict],
        market_data: Dict,
        competitive: Dict
    ) -> List[Dict]:
        """
        Generate actionable recommendations

        Args:
            country: Country code
            use_cases: Identified use cases
            market_data: Market research data
            competitive: Competitive landscape data

        Returns:
            List of recommendation dictionaries
        """
        logger.info(f"Generating recommendations for {country}")

        prompt = f"""
Based on this market intelligence for {country}, generate 5-10 high-priority
actionable recommendations for revenue optimization in digital authentication services.

Market Overview:
{json.dumps(market_data.get('market_overview', {}), indent=2)}

Top 3 Use Cases:
{json.dumps(use_cases[:3] if use_cases else [], indent=2)}

Competitive Landscape:
{json.dumps(competitive, indent=2)}

Generate recommendations in these categories:
1. **New Segments**: Untapped market segments to add
2. **Pricing Strategy**: Pricing adjustments based on market data
3. **Growth Opportunities**: High-growth areas to prioritize
4. **Market Entry**: Timing and approach for market entry
5. **Risk Mitigation**: Regulatory or competitive risks to address

For each recommendation provide JSON:
{{
  "type": "segment|pricing|growth|entry|risk",
  "priority": "high|medium|low",
  "action": "Specific actionable step",
  "rationale": "Data-driven reasoning with citations",
  "expectedImpact": "Quantified impact estimate",
  "implementation": "How to implement",
  "timeline": "Timeframe for implementation"
}}

Return as JSON array ordered by priority and expected impact.
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=8000,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = message.content[0].text
            recommendations = extract_json_from_text(response_text)

            if not isinstance(recommendations, list):
                recommendations = [recommendations]

            logger.info(f"Generated {len(recommendations)} recommendations")

            return recommendations

        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return []
