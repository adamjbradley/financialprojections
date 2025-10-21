# Getting Started with Market Research Agent

## Installation (One-Time Setup)

### Option 1: Automated Setup (Recommended)

```bash
cd agents
./setup.sh
```

This script will:
- Check Python version
- Create virtual environment
- Install all dependencies
- Create .env file from template
- Set up log and output directories

### Option 2: Manual Setup

```bash
cd agents

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example ../.env
# Edit .env and add: ANTHROPIC_API_KEY=your_key_here
```

## First Run (5 Minutes)

```bash
# Make sure you're in agents/ directory
cd agents

# Activate virtual environment (if not already active)
source venv/bin/activate

# Run your first research
python main.py india
```

**What happens**:
1. Agent connects to Claude API
2. Researches India's digital authentication market
3. Identifies 10-15 use cases with TAM/SAM/SOM
4. Analyzes growth trends and competitive landscape
5. Generates recommendations
6. Saves JSON output to `../market-intelligence/india_market_intel.json`

**Duration**: ~15 minutes

**Expected output**:
```
================================================================================
APAC Market Research Agent - v1.0
Researching: INDIA
Depth: standard
================================================================================

Phase 1: Collecting market data...
Phase 2: Identifying use cases...
  Found digital identity authentication market
  Analyzing fintech opportunities
  Mapping e-commerce authentication needs...

Phase 3: Calculating market sizes for 12 use cases...
  TAM: ₹450B, SAM: ₹180B, SOM: ₹45B for Digital Identity Auth
  TAM: ₹200B, SAM: ₹100B, SOM: ₹25B for eKYC Services
  ...

Phase 4: Analyzing growth trends...
  Fintech CAGR: 27.3%
  Digital payments growth: 35.2%
  ...

Phase 5: Mapping competitive landscape...
  Market leaders: UIDAI (65% share)
  Barriers to entry: High
  ...

Phase 6: Generating recommendations...
  Recommendation 1: Add Digital Lending KYC segment
  Recommendation 2: Increase biometric auth growth rate to 25%
  ...

================================================================================
✅ Research completed successfully for INDIA
================================================================================
📊 Data Quality Score: 8.7/10
🎯 Use Cases Identified: 12
💡 Recommendations: 8
📁 Output: market-intelligence/india_market_intel.json
================================================================================
```

## View the Results

```bash
# View summary
cat ../market-intelligence/india_market_intel.json | head -100

# View use cases
cat ../market-intelligence/india_market_intel.json | jq '.useCases[] | {name, tam, sam, som, cagr}'

# View recommendations
cat ../market-intelligence/india_market_intel.json | jq '.recommendations[] | {priority, action}'
```

## Common Commands

### Research Single Country

```bash
# India (standard, ~15 min)
python main.py india

# Singapore (quick, ~5 min)
python main.py singapore quick

# Australia (deep, ~45 min)
python main.py australia deep
```

### Research All Countries

```bash
# Batch research all 8 APAC countries
python scheduler/run_all.py
```

**Duration**: ~2-3 hours total
**Output**: 8 JSON files in `../market-intelligence/`

### Start API Server

```bash
# Start Flask API on port 5000
python api_server.py
```

**Test it**:
```bash
# Health check
curl http://localhost:5000/api/health

# List all intelligence
curl http://localhost:5000/api/research/list

# Get India status
curl http://localhost:5000/api/research/status/india

# Trigger new research
curl -X POST http://localhost:5000/api/research/run \
  -H "Content-Type: application/json" \
  -d '{"country": "singapore", "depth": "quick"}'
```

### Schedule Daily Updates

```bash
# Runs research for all countries daily at 2 AM UTC
python scheduler/cron.py
```

**Note**: This runs in foreground. For production, use a process manager.

## Using with Frontend

```bash
# From project root (not agents/)
npm run dev:with-agent
```

This starts:
- Vite dev server: `http://localhost:3000`
- Agent API server: `http://localhost:5000`

## Understanding the Output

Each market intelligence file contains:

### 1. Use Cases with Market Sizing

```json
{
  "id": "digital-identity-auth",
  "name": "Digital Identity Authentication",
  "description": "Aadhaar-based authentication for identity verification",

  "tam": 450000000000,          // Total Addressable Market (₹450B)
  "sam": 180000000000,          // Serviceable Market (₹180B)
  "som": 45000000000,           // Obtainable Market (₹45B)

  "cagr": 23.5,                 // Growth rate: 23.5% per year
  "adoptionRate": 34.2,         // Current adoption: 34.2%
  "competitiveIntensity": "high",

  "suggestedSegments": [
    {
      "name": "Aadhaar eKYC - Banking",
      "price": 2.50,            // ₹2.50 per transaction
      "cost": 0.75,             // ₹0.75 cost
      "monthlyVolume": 50000000,
      "growthRate": 25.0,
      "category": "kyc"
    }
  ]
}
```

### 2. Market Overview

```json
{
  "totalDigitalPaymentsTAM": 1200000000000,  // ₹1.2T total market
  "fintechGrowthRate": 27.3,                 // 27.3% CAGR
  "digitalIdentityMarketSize": 450000000000,
  "regulatoryScore": 7.8,                    // 7.8/10 favorability
  "technologyReadiness": 6.5,                // 6.5/10 readiness
  "marketMaturity": "growth"
}
```

### 3. Growth Factors

```json
{
  "macroeconomic": {
    "gdpGrowth": 6.5,
    "digitalEconomyShare": 8.2,
    "internetPenetration": 54.0
  },
  "regulatory": {
    "favorability": "positive",
    "recentChanges": ["Aadhaar commercial access (Jan 2025)"]
  },
  "technological": {
    "5gRollout": 35.0,
    "cloudAdoption": 42.0
  }
}
```

### 4. Recommendations

```json
{
  "type": "segment",
  "priority": "high",
  "action": "Add 'Digital Lending KYC' segment",
  "rationale": "High growth (30% CAGR), large TAM (₹180B)",
  "expectedImpact": "15-20% revenue increase",
  "implementation": "Create new segment with suggested pricing",
  "timeline": "Immediate"
}
```

## Quality Scores Explained

**Data Quality Score** (0-10):
- **9-10**: Excellent - High confidence, many sources, recent data
- **7-8**: Good - Solid data quality, multiple sources validated
- **5-6**: Fair - Adequate but may need manual review
- **<5**: Low - Use with caution, consider deeper research

**Factors**:
- Source diversity (30%): Number and variety of data sources
- Data points (30%): Quantity of extracted information
- Recency (20%): How recent the data is
- Validation (20%): Cross-checking across sources

## Troubleshooting

### "ModuleNotFoundError: No module named 'anthropic'"

**Solution**:
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "API key not found"

**Solution**:
```bash
# Check .env file exists
ls ../.env

# Edit and add your key
nano ../.env
# Set: ANTHROPIC_API_KEY=your_actual_key_here

# Verify it's set
python -c "import os; from dotenv import load_dotenv; load_dotenv('../.env'); print('Key:', 'SET' if os.getenv('ANTHROPIC_API_KEY') else 'MISSING')"
```

### "Research produces low quality scores"

**Solutions**:
1. Use deeper research: `python main.py india deep`
2. Check internet connection
3. Verify API key has credits
4. Review logs: `cat logs/research.log`

### "Port 5000 already in use" (API server)

**Solution**:
```bash
# Use different port
FLASK_PORT=5001 python api_server.py
```

## Tips for Best Results

1. **Start with standard depth**: Quick is good for testing, deep for production

2. **Check quality scores**: Aim for 7.0+ for reliable data

3. **Review recommendations**: High-priority items are most impactful

4. **Use suggested segments**: Pre-calculated with market data

5. **Monitor logs**: Check `logs/research.log` for details

6. **Update regularly**: Run weekly or use daily scheduler

## Next Steps

1. ✅ **Run your first research**: `python main.py india`

2. ✅ **Review the output**: Check `../market-intelligence/india_market_intel.json`

3. ✅ **Research more countries**: Try `python scheduler/run_all.py`

4. ✅ **Start API server**: `python api_server.py`

5. ✅ **Integrate with frontend**: (Coming in next phase)

## Need Help?

- **Detailed docs**: See `README.md` in this directory
- **Quick start**: See `../MARKET-INTELLIGENCE.md`
- **Implementation details**: See `../IMPLEMENTATION-SUMMARY.md`
- **Project structure**: See `../PROJECT-STRUCTURE.md`

## Quick Reference Card

```bash
# SETUP (one time)
./setup.sh
# Edit ../.env and add ANTHROPIC_API_KEY

# RESEARCH
source venv/bin/activate
python main.py india              # Single country
python main.py singapore quick    # Quick research
python scheduler/run_all.py       # All countries

# SERVICES
python api_server.py              # API server
python scheduler/cron.py          # Daily automation

# VIEW RESULTS
cat ../market-intelligence/india_market_intel.json
ls -la ../market-intelligence/

# FROM PROJECT ROOT
npm run agent:research            # India
npm run agent:research:all        # All countries
npm run agent:api                 # API server
npm run dev:with-agent            # Vite + API
```

---

**Ready to start!** Run `python main.py india` now! 🚀
