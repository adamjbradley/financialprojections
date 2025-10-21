# APAC Market Research Agent

Autonomous Python-based market research system that conducts deep intelligence gathering for Asia-Pacific markets, generating actionable metadata about use cases, TAM/SAM/SOM calculations, growth rates, and market opportunities.

## Overview

This agent system autonomously researches digital authentication and identity verification markets across 8 APAC countries, providing data-driven insights that feed directly into the revenue projections application.

### Key Features

✅ **Autonomous Research**: AI-powered market intelligence generation
✅ **Multi-Country Support**: India, Singapore, Australia, Japan, South Korea, Thailand, Indonesia, Philippines
✅ **TAM/SAM/SOM Calculations**: Bottom-up and top-down methodologies
✅ **Growth Analysis**: CAGR calculations and trend analysis
✅ **Use Case Identification**: Sector-specific revenue opportunities
✅ **Competitive Intelligence**: Market landscape mapping
✅ **Daily Updates**: Scheduled automatic research refreshes
✅ **REST API**: Frontend integration via Flask server
✅ **Quality Scoring**: Data confidence and quality metrics

## Architecture

```
agents/
├── main.py                      # Core orchestrator
├── config.yaml                  # Configuration
├── requirements.txt             # Python dependencies
├── api_server.py               # Flask REST API
├── research/
│   ├── web_researcher.py       # Claude-powered research
│   ├── tam_calculator.py       # Market sizing
│   └── growth_analyzer.py      # Trend analysis
├── scheduler/
│   ├── cron.py                 # Daily automation
│   └── run_all.py              # Batch processing
└── utils/
    ├── logger.py               # Logging
    └── helpers.py              # Utilities
```

## Installation

### Prerequisites

- Python 3.8+
- Anthropic API key
- Node.js 18+ (for frontend integration)

### Setup

1. **Create Python virtual environment**:
   ```bash
   cd agents
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   # Copy example environment file
   cp ../.env.example ../.env

   # Edit .env and add your Anthropic API key
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Verify installation**:
   ```bash
   python main.py --help
   ```

## Usage

### Manual Research

**Research a single country**:
```bash
# Standard depth (15 minutes)
python main.py india

# Quick research (5 minutes)
python main.py singapore quick

# Deep research (45 minutes)
python main.py australia deep
```

**Research all countries**:
```bash
python scheduler/run_all.py
```

### Automated Scheduling

**Start daily scheduler** (runs at 2 AM UTC):
```bash
python scheduler/cron.py
```

This will:
- Run research for all 8 countries daily
- Save results to `../market-intelligence/`
- Maintain research history
- Log all activities

### API Server

**Start the Flask API server**:
```bash
python api_server.py
```

Server runs on `http://localhost:5000` with endpoints:

- `POST /api/research/run` - Trigger research
- `GET /api/research/status/<country>` - Check research status
- `GET /api/research/list` - List all available intelligence
- `GET /api/health` - Health check

**Example API call**:
```bash
curl -X POST http://localhost:5000/api/research/run \
  -H "Content-Type: application/json" \
  -d '{"country": "india", "depth": "standard"}'
```

### Integration with Frontend

**Start both Vite dev server and API**:
```bash
cd ..
npm run dev:with-agent
```

This runs:
- Vite dev server on `http://localhost:3000`
- Agent API server on `http://localhost:5000`

## Output Format

Research generates JSON files in `../market-intelligence/`:

```
market-intelligence/
├── india_market_intel.json
├── singapore_market_intel.json
├── australia_market_intel.json
├── ...
├── index.json (catalog)
└── research_history/
    ├── 2025-10-21_02-00-00_india.json
    └── ...
```

### Data Schema

```json
{
  "country": "india",
  "lastUpdated": "2025-10-21T00:00:00Z",
  "dataQualityScore": 8.7,
  "sources": ["world-bank", "rbi", "nasscom"],

  "useCases": [
    {
      "id": "digital-identity-auth",
      "name": "Digital Identity Authentication",
      "tam": 450000000000,
      "sam": 180000000000,
      "som": 45000000000,
      "cagr": 23.5,
      "adoptionRate": 34.2,
      "competitiveIntensity": "high",
      "suggestedSegments": [...]
    }
  ],

  "marketOverview": {
    "totalDigitalPaymentsTAM": 1200000000000,
    "fintechGrowthRate": 27.3,
    "regulatoryScore": 7.8,
    "technologyReadiness": 6.5
  },

  "growthFactors": {...},
  "competitiveLandscape": {...},
  "recommendations": [...]
}
```

## Configuration

Edit `config.yaml` to customize:

```yaml
research_areas:
  - use-cases
  - tam-sam-som
  - growth-rates
  - competitive-landscape

countries:
  - india
  - singapore
  - australia
  - japan
  - south_korea
  - thailand
  - indonesia
  - philippines

research_depth:
  quick: 5      # minutes
  standard: 15  # default
  deep: 45
```

## Research Methodology

### 1. Market Data Collection
- Claude-powered web research
- Economic indicators (GDP, digital penetration)
- Technology metrics (5G, cloud, AI adoption)
- Regulatory environment analysis

### 2. Use Case Identification
- Sector-specific opportunities (fintech, e-commerce, gov)
- Adoption rates and barriers
- Competitive intensity assessment
- Pricing range analysis

### 3. TAM/SAM/SOM Calculation
**Top-Down Approach**:
- Total market × penetration rate

**Bottom-Up Approach**:
- Unit economics × addressable users

**Final TAM** = Average of both methods

### 4. Growth Analysis
- Historical CAGRs
- Macroeconomic factors
- Regulatory favorability
- Technology trends

### 5. Competitive Intelligence
- Market leaders and share
- Barriers to entry
- Competitive threat assessment

### 6. Recommendations
- New segments to pursue
- Pricing optimization
- Growth rate adjustments
- Risk mitigation

## Quality Metrics

**Data Quality Score (0-10)** based on:
- Source diversity (30%)
- Data point count (30%)
- Recency (20%)
- Cross-validation (20%)

**Minimum Thresholds**:
- Sources: 5+
- Data points: 50+
- Confidence: 0.7+

## Logging

Logs are written to:
- Console (INFO level)
- `agents/logs/research.log` (detailed)

**Log levels**:
- INFO: Progress and results
- WARNING: Missing data or low quality
- ERROR: Failures and exceptions

## Troubleshooting

**Agent fails to start**:
```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Verify Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Research produces low quality scores**:
- Check internet connection
- Verify API key has credits
- Try increasing research depth
- Review logs for specific errors

**API server won't start**:
```bash
# Check if port 5000 is available
lsof -i :5000

# Try different port
FLASK_PORT=5001 python api_server.py
```

## NPM Scripts

From project root:

```bash
# Install Python environment
npm run agent:install

# Run research
npm run agent:research              # India (default)
npm run agent:research:india        # India specifically
npm run agent:research:singapore    # Singapore
npm run agent:research:all          # All countries

# Start services
npm run agent:api                   # API server only
npm run agent:schedule              # Daily scheduler
npm run dev:with-agent              # Vite + API together
```

## Development

### Adding New Countries

1. Add to `config.yaml`:
   ```yaml
   countries:
     - new_country
   ```

2. Create demographic file:
   ```bash
   touch ../demographics/new_country_demographics.json
   ```

3. Run research:
   ```bash
   python main.py new_country
   ```

### Extending Research Areas

Edit `research/web_researcher.py` to add new prompt sections.

### Custom Data Sources

Create new modules in `sources/` directory:
```python
# sources/custom_api.py
class CustomAPI:
    async def get_data(self, country):
        # Your implementation
        pass
```

## Performance

**Typical Research Times**:
- Quick: 3-7 minutes
- Standard: 12-18 minutes
- Deep: 40-50 minutes

**Resource Usage**:
- Memory: ~200MB per research run
- API calls: ~15-30 per country (standard)
- Storage: ~50KB per intelligence file

## Security

- API keys stored in `.env` (gitignored)
- No sensitive data in output files
- Read-only market research (defensive only)
- CORS enabled for localhost only

## Support

**Issues**:
- Check `agents/logs/research.log`
- Review console output for errors
- Verify environment variables
- Ensure API key is valid

**Contact**:
- See main project README for support
- Review CLAUDE.md for architecture details

---

**Version**: 1.0.0
**License**: SEE LICENSE IN ../LICENSE
**Author**: Mastercard Product Management
