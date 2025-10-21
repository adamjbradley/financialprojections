"""TAM/SAM/SOM calculation module using multiple methodologies"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from utils.logger import setup_logger

logger = setup_logger(__name__)


class TAMCalculator:
    """Calculate Total/Serviceable/Obtainable Addressable Market"""

    def __init__(self):
        self.methodologies = ['topdown', 'bottomup', 'value_theory']

    async def calculate(self, country: str, use_case: dict, market_data: dict) -> dict:
        """
        Calculate TAM/SAM/SOM using multiple methodologies

        Methodologies:
        1. Top-down: Total market * penetration
        2. Bottom-up: Unit economics * addressable users
        3. Value theory: Value creation * capture rate

        Args:
            country: Country code
            use_case: Use case dictionary with market info
            market_data: Overall market data for country

        Returns:
            Dictionary with TAM, SAM, SOM values
        """
        try:
            # Get country demographic and economic data
            population = market_data.get('demographics', {}).get('population', 100) * 1_000_000
            digital_penetration = market_data.get('technology', {}).get('digital_penetration', 50) / 100
            gdp = market_data.get('economy', {}).get('gdp', 1_000_000_000_000)

            # Calculate TAM (Total Addressable Market)
            tam_topdown = self._calculate_tam_topdown(
                population, digital_penetration, use_case, market_data
            )
            tam_bottomup = self._calculate_tam_bottomup(
                population, digital_penetration, use_case, market_data
            )

            # Average both methods for robustness
            tam = (tam_topdown + tam_bottomup) / 2

            logger.info(f"TAM calculation: topdown={tam_topdown:,.0f}, bottomup={tam_bottomup:,.0f}, avg={tam:,.0f}")

            # Calculate SAM (Serviceable Addressable Market)
            regulatory_factor = market_data.get('regulatory', {}).get('score', 7.0) / 10.0
            competitive_factor = 1 - use_case.get('competitive_intensity_factor', 0.3)
            tech_readiness = market_data.get('technology', {}).get('readiness', 6.5) / 10.0

            sam_factor = (regulatory_factor * 0.4 + competitive_factor * 0.3 + tech_readiness * 0.3)
            sam = tam * sam_factor

            logger.info(f"SAM calculation: factor={sam_factor:.2f}, SAM={sam:,.0f}")

            # Calculate SOM (Serviceable Obtainable Market)
            market_share_estimate = self._estimate_market_share(use_case, market_data)
            adoption_rate = use_case.get('adoptionRate', 20) / 100
            som = sam * market_share_estimate * adoption_rate

            logger.info(f"SOM calculation: share={market_share_estimate:.2%}, adoption={adoption_rate:.2%}, SOM={som:,.0f}")

            return {
                'tam': int(tam),
                'sam': int(sam),
                'som': int(som),
                'currency': market_data.get('country', {}).get('currency', 'USD'),
                'methodology': 'hybrid_topdown_bottomup',
                'assumptions': {
                    'digital_penetration': digital_penetration,
                    'regulatory_factor': regulatory_factor,
                    'competitive_factor': competitive_factor,
                    'tech_readiness': tech_readiness,
                    'market_share': market_share_estimate,
                    'adoption_rate': adoption_rate
                }
            }

        except Exception as e:
            logger.error(f"TAM calculation failed: {e}")
            return {
                'tam': 0,
                'sam': 0,
                'som': 0,
                'currency': 'USD',
                'error': str(e)
            }

    def _calculate_tam_topdown(
        self,
        population: float,
        digital_penetration: float,
        use_case: dict,
        market_data: dict
    ) -> float:
        """
        Top-down TAM calculation: Market size * penetration rate

        Args:
            population: Total population
            digital_penetration: Digital service penetration (0-1)
            use_case: Use case details
            market_data: Market data

        Returns:
            TAM estimate
        """
        # Addressable population (digitally enabled)
        addressable_pop = population * digital_penetration

        # Transaction frequency per year
        transaction_freq = use_case.get('transaction_frequency', 12)

        # Average price per transaction
        avg_price = use_case.get('pricing', {}).get('average', 1.0)

        # Market penetration potential
        market_penetration = use_case.get('market_penetration', 0.30)

        # TAM = addressable users * frequency * price * penetration
        tam = addressable_pop * transaction_freq * avg_price * market_penetration

        return tam

    def _calculate_tam_bottomup(
        self,
        population: float,
        digital_penetration: float,
        use_case: dict,
        market_data: dict
    ) -> float:
        """
        Bottom-up TAM calculation: Unit economics scaled up

        Args:
            population: Total population
            digital_penetration: Digital service penetration (0-1)
            use_case: Use case details
            market_data: Market data

        Returns:
            TAM estimate
        """
        # Segment-specific factors
        target_segment_pct = use_case.get('target_segment_percentage', 0.25)
        addressable_pop = population * digital_penetration * target_segment_pct

        # Annual transaction volume per user
        transactions_per_user = use_case.get('annual_transactions_per_user', 24)

        # Revenue per transaction
        revenue_per_transaction = use_case.get('pricing', {}).get('average', 1.0)

        # TAM = users * transactions * revenue
        tam = addressable_pop * transactions_per_user * revenue_per_transaction

        return tam

    def _estimate_market_share(self, use_case: dict, market_data: dict) -> float:
        """
        Estimate realistic market share based on competitive dynamics

        Args:
            use_case: Use case details
            market_data: Market data

        Returns:
            Estimated market share (0-1)
        """
        # Base market share assumptions
        competitive_intensity = use_case.get('competitiveIntensity', 'medium')

        market_share_map = {
            'low': 0.35,      # Low competition = higher share potential
            'medium': 0.20,   # Medium competition = moderate share
            'high': 0.10,     # High competition = lower share
            'very_high': 0.05  # Very high competition = minimal share
        }

        base_share = market_share_map.get(competitive_intensity, 0.15)

        # Adjust for market maturity
        maturity = use_case.get('maturity', 'growth')
        maturity_multiplier = {
            'emerging': 1.3,   # Easier to gain share in emerging markets
            'growth': 1.0,     # Normal share in growth markets
            'mature': 0.7,     # Harder to gain share in mature markets
            'declining': 0.5   # Very difficult in declining markets
        }

        adjusted_share = base_share * maturity_multiplier.get(maturity, 1.0)

        return min(adjusted_share, 0.40)  # Cap at 40% max share
