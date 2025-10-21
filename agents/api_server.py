"""Simple Flask API for triggering research agent from frontend"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from pathlib import Path
import json
import logging
from main import MarketResearchAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize agent
try:
    agent = MarketResearchAgent()
    logger.info("Market Research Agent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agent: {e}")
    agent = None


@app.route('/api/research/run', methods=['POST'])
def run_research():
    """
    Trigger research for a country

    Request body:
    {
        "country": "india",
        "depth": "standard"
    }
    """
    if not agent:
        return jsonify({
            'status': 'error',
            'message': 'Agent not initialized. Check ANTHROPIC_API_KEY.'
        }), 500

    try:
        data = request.json
        country = data.get('country', 'india')
        depth = data.get('depth', 'standard')

        logger.info(f"Starting research for {country} (depth: {depth})")

        # Run async research in sync context
        intelligence = asyncio.run(agent.research_country(country, depth))
        agent.save_intelligence(country, intelligence)

        logger.info(f"Research completed for {country}")

        return jsonify({
            'status': 'success',
            'country': country,
            'quality_score': intelligence['dataQualityScore'],
            'use_cases': len(intelligence['useCases']),
            'recommendations': len(intelligence['recommendations']),
            'timestamp': intelligence['lastUpdated']
        })

    except Exception as e:
        logger.error(f"Research failed: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/research/status/<country>', methods=['GET'])
def get_status(country):
    """
    Get last research status for country

    Returns metadata about the most recent research
    """
    try:
        intel_path = Path(__file__).parent / f'../market-intelligence/{country}_market_intel.json'

        if intel_path.exists():
            with open(intel_path) as f:
                data = json.load(f)

            return jsonify({
                'exists': True,
                'country': country,
                'lastUpdated': data['lastUpdated'],
                'qualityScore': data['dataQualityScore'],
                'useCases': len(data['useCases']),
                'recommendations': len(data['recommendations']),
                'sources': len(data.get('sources', []))
            })
        else:
            return jsonify({
                'exists': False,
                'country': country,
                'message': 'No research data available'
            })

    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return jsonify({
            'exists': False,
            'error': str(e)
        }), 500


@app.route('/api/research/list', methods=['GET'])
def list_research():
    """List all available market intelligence files"""
    try:
        intel_dir = Path(__file__).parent / '../market-intelligence'

        if not intel_dir.exists():
            return jsonify({'countries': []})

        countries = []
        for file in intel_dir.glob('*_market_intel.json'):
            country = file.stem.replace('_market_intel', '')

            try:
                with open(file) as f:
                    data = json.load(f)

                countries.append({
                    'country': country,
                    'lastUpdated': data['lastUpdated'],
                    'qualityScore': data['dataQualityScore'],
                    'useCases': len(data['useCases'])
                })
            except Exception as e:
                logger.warning(f"Failed to read {file}: {e}")

        return jsonify({'countries': countries})

    except Exception as e:
        logger.error(f"List failed: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'agent_ready': agent is not None,
        'version': '1.0.0'
    })


if __name__ == '__main__':
    import os

    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"\n{'=' * 80}")
    print(f"Market Research Agent API Server")
    print(f"{'=' * 80}")
    print(f"Server running on http://localhost:{port}")
    print(f"Debug mode: {debug}")
    print(f"Agent initialized: {agent is not None}")
    print(f"{'=' * 80}\n")

    app.run(port=port, debug=debug, host='0.0.0.0')
