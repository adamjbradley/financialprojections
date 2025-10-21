"""Growth and trend analysis module"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from typing import Dict, List
from utils.logger import setup_logger

logger = setup_logger(__name__)


class GrowthAnalyzer:
    """Analyze growth trends and calculate CAGRs"""

    def __init__(self):
        pass

    async def analyze(
        self,
        country: str,
        use_cases: List[Dict],
        market_data: Dict
    ) -> Dict:
        """
        Analyze growth factors for a market

        Args:
            country: Country code
            use_cases: Identified use cases
            market_data: Market research data

        Returns:
            Growth factors dictionary
        """
        logger.info(f"Analyzing growth factors for {country}")

        growth_factors = {
            'macroeconomic': self._analyze_macroeconomic(market_data),
            'regulatory': self._analyze_regulatory(market_data),
            'technological': self._analyze_technological(market_data),
            'competitive': self._analyze_competitive(market_data),
            'use_case_growth': self._analyze_use_case_growth(use_cases)
        }

        # Calculate aggregate growth score
        growth_factors['aggregate_score'] = self._calculate_aggregate_score(growth_factors)

        logger.info(f"Growth analysis complete. Aggregate score: {growth_factors['aggregate_score']:.1f}/10")

        return growth_factors

    def _analyze_macroeconomic(self, market_data: Dict) -> Dict:
        """Analyze macroeconomic growth factors"""

        economy = market_data.get('economy', {})
        demographics = market_data.get('demographics', {})

        gdp_growth = economy.get('gdp_growth', 3.0)
        digital_economy_share = economy.get('digital_economy_share', 5.0)
        population = demographics.get('population', 100.0)

        # Calculate macroeconomic growth score
        score = 0.0
        score += min(gdp_growth, 10.0)  # GDP growth (max 10 points)
        score += min(digital_economy_share / 2, 5.0)  # Digital economy (max 5 points)

        return {
            'gdpGrowth': gdp_growth,
            'digitalEconomyShare': digital_economy_share,
            'population': population,
            'score': score / 1.5,  # Normalize to 0-10
            'outlook': 'positive' if score > 10 else 'moderate' if score > 5 else 'cautious'
        }

    def _analyze_regulatory(self, market_data: Dict) -> Dict:
        """Analyze regulatory environment"""

        regulatory = market_data.get('regulatory', {})

        score = regulatory.get('score', 5.0)
        favorability = regulatory.get('favorability', 'neutral')
        recent_changes = regulatory.get('recent_changes', [])

        return {
            'favorability': favorability,
            'score': score,
            'recentChanges': recent_changes,
            'upcomingPolicy': [],
            'risk_level': 'low' if score >= 7 else 'medium' if score >= 5 else 'high'
        }

    def _analyze_technological(self, market_data: Dict) -> Dict:
        """Analyze technological adoption and readiness"""

        technology = market_data.get('technology', {})

        return {
            '5gRollout': technology.get('5g_rollout', 20.0),
            'cloudAdoption': technology.get('cloud_adoption', 30.0),
            'aiAdoption': technology.get('ai_adoption', 15.0),
            'digitalPenetration': technology.get('digital_penetration', 50.0),
            'smartphonePenetration': technology.get('smartphone_penetration', 55.0),
            'readiness': technology.get('readiness', 6.0)
        }

    def _analyze_competitive(self, market_data: Dict) -> Dict:
        """Analyze competitive dynamics"""

        competitive = market_data.get('competitive', {})

        return {
            'intensity': competitive.get('intensity', 'medium'),
            'barriers_to_entry': competitive.get('barriers_to_entry', 'medium'),
            'market_concentration': self._calculate_market_concentration(competitive),
            'threat_level': self._assess_competitive_threat(competitive)
        }

    def _analyze_use_case_growth(self, use_cases: List[Dict]) -> Dict:
        """Analyze growth rates across use cases"""

        if not use_cases:
            return {
                'average_cagr': 0.0,
                'high_growth_count': 0,
                'emerging_count': 0
            }

        cagrs = [uc.get('cagr', 0.0) for uc in use_cases]
        maturities = [uc.get('maturity', 'growth') for uc in use_cases]

        average_cagr = sum(cagrs) / len(cagrs) if cagrs else 0.0
        high_growth_count = len([c for c in cagrs if c >= 20.0])
        emerging_count = len([m for m in maturities if m == 'emerging'])

        return {
            'average_cagr': round(average_cagr, 1),
            'high_growth_count': high_growth_count,
            'emerging_count': emerging_count,
            'median_cagr': round(sorted(cagrs)[len(cagrs)//2], 1) if cagrs else 0.0,
            'max_cagr': max(cagrs) if cagrs else 0.0
        }

    def _calculate_market_concentration(self, competitive: Dict) -> str:
        """Calculate market concentration level"""

        market_leaders = competitive.get('market_leaders', [])

        if not market_leaders:
            return 'unknown'

        # Calculate Herfindahl-Hirschman Index (HHI) approximation
        total_share = sum(leader.get('market_share', 0) for leader in market_leaders)

        if total_share >= 70:
            return 'high'  # Concentrated market
        elif total_share >= 40:
            return 'medium'  # Moderately concentrated
        else:
            return 'low'  # Fragmented market

    def _assess_competitive_threat(self, competitive: Dict) -> str:
        """Assess overall competitive threat level"""

        intensity = competitive.get('intensity', 'medium')
        barriers = competitive.get('barriers_to_entry', 'medium')

        threat_map = {
            ('high', 'low'): 'very_high',
            ('high', 'medium'): 'high',
            ('high', 'high'): 'medium',
            ('medium', 'low'): 'high',
            ('medium', 'medium'): 'medium',
            ('medium', 'high'): 'low',
            ('low', 'low'): 'medium',
            ('low', 'medium'): 'low',
            ('low', 'high'): 'very_low'
        }

        return threat_map.get((intensity, barriers), 'medium')

    def _calculate_aggregate_score(self, growth_factors: Dict) -> float:
        """Calculate aggregate growth score (0-10)"""

        macro_score = growth_factors['macroeconomic']['score']
        reg_score = growth_factors['regulatory']['score']
        tech_score = growth_factors['technological']['readiness']
        use_case_cagr = min(growth_factors['use_case_growth']['average_cagr'] / 3, 10.0)

        # Weighted average
        aggregate = (
            macro_score * 0.30 +
            reg_score * 0.25 +
            tech_score * 0.25 +
            use_case_cagr * 0.20
        )

        return round(aggregate, 1)
