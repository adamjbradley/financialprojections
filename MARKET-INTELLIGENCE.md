# Market Intelligence Agent - Quick Start Guide

## What is the Market Intelligence Agent?

An autonomous Python-based system that researches APAC markets and generates actionable intelligence about:
- 🎯 Use cases and revenue opportunities
- 📊 TAM/SAM/SOM market sizing
- 📈 Growth rates and trends (CAGR)
- 🏢 Competitive landscape
- 💡 Strategic recommendations

This intelligence feeds directly into your revenue projection models, auto-populating segments with market-validated assumptions.

## Quick Start (5 Minutes)

### Step 1: Set Up Python Environment

```bash
# Navigate to agents directory
cd agents

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure API Key

```bash
# Copy environment template
cp ../.env.example ../.env

# Edit .env file and add your Anthropic API key
# ANTHROPIC_API_KEY=your_actual_api_key_here
```

Get your API key from: https://console.anthropic.com/

### Step 3: Run Your First Research

```bash
# Research India (standard depth, ~15 minutes)
python main.py india
```

**Expected output**:
```
================================================================================
APAC Market Research Agent - v1.0
Researching: INDIA
Depth: standard
================================================================================

Phase 1: Collecting market data...
Phase 2: Identifying use cases...
Phase 3: Calculating market sizes for 12 use cases...
Phase 4: Analyzing growth trends...
Phase 5: Mapping competitive landscape...
Phase 6: Generating recommendations...

================================================================================
✅ Research completed successfully for INDIA
================================================================================
📊 Data Quality Score: 8.7/10
🎯 Use Cases Identified: 12
💡 Recommendations: 8
📁 Output: market-intelligence/india_market_intel.json
================================================================================
```

### Step 4: View the Results

```bash
# View generated intelligence file
cat ../market-intelligence/india_market_intel.json | head -50
```

## Usage Examples

### Research Different Countries

```bash
# Singapore
python main.py singapore

# Australia (quick research, ~5 min)
python main.py australia quick

# Japan (deep research, ~45 min)
python main.py japan deep
```

### Research All Countries

```bash
# Batch research all 8 countries
python scheduler/run_all.py
```

This will research:
- India
- Singapore
- Australia
- Japan
- South Korea
- Thailand
- Indonesia
- Philippines

### Start the API Server

For frontend integration:

```bash
# Start Flask API server
python api_server.py
```

Server runs on `http://localhost:5000`

### Using with Frontend

From project root:

```bash
# Start both Vite and Agent API
npm run dev:with-agent
```

This opens:
- Frontend: `http://localhost:3000`
- Agent API: `http://localhost:5000`

## Output Files

Research generates JSON files in `market-intelligence/`:

```
market-intelligence/
├── india_market_intel.json          # Latest India research
├── singapore_market_intel.json      # Latest Singapore research
├── australia_market_intel.json      # Latest Australia research
├── index.json                        # Catalog of all intelligence
└── research_history/                 # Historical snapshots
    ├── 2025-10-21_02-00-00_india.json
    └── ...
```

## Understanding the Output

Each market intelligence file contains:

### 1. Use Cases
Revenue opportunities with TAM/SAM/SOM:

```json
{
  "name": "Digital Identity Authentication",
  "tam": 450000000000,          // Total Addressable Market
  "sam": 180000000000,          // Serviceable Addressable Market
  "som": 45000000000,           // Serviceable Obtainable Market
  "cagr": 23.5,                 // Compound Annual Growth Rate
  "adoptionRate": 34.2,         // Current adoption %
  "competitiveIntensity": "high"
}
```

### 2. Market Overview
High-level market metrics:

```json
{
  "totalDigitalPaymentsTAM": 1200000000000,
  "fintechGrowthRate": 27.3,
  "regulatoryScore": 7.8,
  "technologyReadiness": 6.5
}
```

### 3. Recommendations
Actionable insights:

```json
{
  "type": "segment",
  "priority": "high",
  "action": "Add 'Digital Lending KYC' segment",
  "rationale": "High growth (30% CAGR), large TAM",
  "expectedImpact": "15-20% revenue increase"
}
```

## Automated Scheduling

Run research automatically every day at 2 AM:

```bash
# Start the scheduler (runs in foreground)
python scheduler/cron.py
```

For production, use a process manager like `systemd`, `supervisord`, or `pm2`.

## Integration with Main App

The intelligence files can be loaded by your main application to:

1. **Auto-populate segments**: Import use cases as revenue segments
2. **Validate growth rates**: Compare your assumptions vs market data
3. **Suggest new opportunities**: Identify untapped revenue streams
4. **Optimize pricing**: Align pricing with market benchmarks

## Troubleshooting

### Agent won't start

**Check Python version**:
```bash
python --version  # Should be 3.8 or higher
```

**Verify API key**:
```bash
# In agents directory with venv activated
python -c "import os; from dotenv import load_dotenv; load_dotenv('../.env'); print('API Key:', 'SET' if os.getenv('ANTHROPIC_API_KEY') else 'MISSING')"
```

**Reinstall dependencies**:
```bash
pip install -r requirements.txt --force-reinstall
```

### Low quality scores

- Increase research depth: `python main.py india deep`
- Check internet connection
- Verify API key has sufficient credits
- Review logs: `cat logs/research.log`

### API server errors

**Port already in use**:
```bash
# Use different port
FLASK_PORT=5001 python api_server.py
```

**Check if server is running**:
```bash
curl http://localhost:5000/api/health
```

## Advanced Usage

### Custom Configuration

Edit `config.yaml` to customize:
- Research areas
- Data sources
- Update schedule
- Quality thresholds

### Environment Variables

Available in `.env`:
```bash
ANTHROPIC_API_KEY=your_key_here
FLASK_PORT=5000
FLASK_DEBUG=True
LOG_LEVEL=INFO
```

### Logging

Logs are written to:
- Console: Progress and results
- `logs/research.log`: Detailed debug info

**View logs**:
```bash
tail -f logs/research.log
```

## NPM Shortcuts

From project root (not in agents/):

```bash
# Research
npm run agent:research                # India (default)
npm run agent:research:india          # India explicitly
npm run agent:research:singapore      # Singapore
npm run agent:research:all            # All 8 countries

# Services
npm run agent:api                     # Start API server
npm run agent:schedule                # Start daily scheduler
npm run dev:with-agent                # Vite + API together
```

## Next Steps

1. ✅ **Run initial research**: `python main.py india`
2. ✅ **Review output**: Check `../market-intelligence/india_market_intel.json`
3. ✅ **Test API**: Start `python api_server.py`
4. ✅ **Integrate with frontend**: (Coming in next phase)
5. ✅ **Set up automation**: Start daily scheduler

## Support

- **Detailed docs**: See `agents/README.md`
- **Project structure**: See `PROJECT-STRUCTURE.md`
- **Development guide**: See `CLAUDE.md`

---

**Ready to generate market intelligence!**

Run this now:
```bash
cd agents
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py india
```

Your first market intelligence report will be ready in ~15 minutes! 🚀
