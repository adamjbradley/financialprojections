"""Helper utility functions"""

import json
import re
from typing import Any, Dict, List
from datetime import datetime


def extract_json_from_text(text: str) -> Any:
    """
    Extract JSON from text that may contain markdown code blocks

    Args:
        text: Text potentially containing JSON

    Returns:
        Parsed JSON object
    """
    # Try to extract from markdown code block
    json_match = re.search(r'```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try to find JSON object/array in text
        json_match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = text

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        # Try to clean up common issues
        json_str = json_str.strip()
        return json.loads(json_str)


def format_currency(value: float, currency: str = 'INR') -> str:
    """
    Format currency value with appropriate symbols

    Args:
        value: Numeric value
        currency: Currency code

    Returns:
        Formatted currency string
    """
    symbols = {
        'INR': '₹',
        'SGD': 'S$',
        'AUD': 'A$',
        'JPY': '¥',
        'KRW': '₩',
        'THB': '฿',
        'IDR': 'Rp',
        'PHP': '₱'
    }

    symbol = symbols.get(currency, currency + ' ')

    # Format with appropriate scale
    if value >= 1_000_000_000_000:  # Trillions
        return f"{symbol}{value/1_000_000_000_000:.2f}T"
    elif value >= 1_000_000_000:  # Billions
        return f"{symbol}{value/1_000_000_000:.2f}B"
    elif value >= 1_000_000:  # Millions
        return f"{symbol}{value/1_000_000:.2f}M"
    elif value >= 1_000:  # Thousands
        return f"{symbol}{value/1_000:.2f}K"
    else:
        return f"{symbol}{value:.2f}"


def calculate_confidence_score(data: Dict) -> float:
    """
    Calculate data quality/confidence score

    Args:
        data: Dictionary with research metadata

    Returns:
        Confidence score between 0-1
    """
    score = 0.0

    # Source diversity (max 0.3)
    num_sources = data.get('num_sources', 0)
    score += min(num_sources / 10, 0.3)

    # Data point count (max 0.3)
    num_data_points = data.get('num_data_points', 0)
    score += min(num_data_points / 100, 0.3)

    # Recency (max 0.2)
    last_updated = data.get('last_updated')
    if last_updated:
        days_old = (datetime.now() - datetime.fromisoformat(last_updated)).days
        recency_score = max(0, 1 - (days_old / 365))
        score += recency_score * 0.2

    # Cross-validation (max 0.2)
    if data.get('cross_validated', False):
        score += 0.2

    return min(score, 1.0)


def aggregate_data_sources(sources: List[Dict]) -> Dict:
    """
    Aggregate data from multiple sources

    Args:
        sources: List of data source dictionaries

    Returns:
        Aggregated and deduplicated data
    """
    aggregated = {
        'sources': [],
        'data_points': [],
        'metadata': {
            'num_sources': 0,
            'total_data_points': 0,
            'last_updated': datetime.now().isoformat()
        }
    }

    seen_sources = set()
    seen_data_points = set()

    for source in sources:
        if not isinstance(source, dict):
            continue

        # Add unique sources
        source_name = source.get('name', 'unknown')
        if source_name not in seen_sources:
            seen_sources.add(source_name)
            aggregated['sources'].append(source_name)

        # Add unique data points
        data_points = source.get('data_points', [])
        for dp in data_points:
            dp_hash = hash(str(dp))
            if dp_hash not in seen_data_points:
                seen_data_points.add(dp_hash)
                aggregated['data_points'].append(dp)

    aggregated['metadata']['num_sources'] = len(seen_sources)
    aggregated['metadata']['total_data_points'] = len(seen_data_points)

    return aggregated


def validate_market_data(data: Dict, required_fields: List[str]) -> bool:
    """
    Validate that market data contains required fields

    Args:
        data: Market data dictionary
        required_fields: List of required field names

    Returns:
        True if all required fields present
    """
    for field in required_fields:
        if field not in data or data[field] is None:
            return False
    return True
