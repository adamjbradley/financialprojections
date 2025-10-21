#!/usr/bin/env python3
"""Test script to verify agent setup"""

import sys
import os
from pathlib import Path

print("=" * 80)
print("Market Research Agent - Setup Verification")
print("=" * 80)
print()

# Test 1: Python version
print("✓ Checking Python version...")
if sys.version_info < (3, 8):
    print(f"  ❌ Python 3.8+ required, found {sys.version}")
    sys.exit(1)
else:
    print(f"  ✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
print()

# Test 2: Dependencies
print("✓ Checking dependencies...")
required_packages = [
    'anthropic',
    'flask',
    'yaml',
    'schedule',
    'dotenv'
]

missing = []
for package in required_packages:
    try:
        if package == 'yaml':
            __import__('yaml')
        elif package == 'dotenv':
            __import__('dotenv')
        else:
            __import__(package)
        print(f"  ✅ {package}")
    except ImportError:
        print(f"  ❌ {package} - Not installed")
        missing.append(package)

if missing:
    print()
    print(f"  Missing packages: {', '.join(missing)}")
    print(f"  Run: pip install -r requirements.txt")
    sys.exit(1)
print()

# Test 3: Environment file
print("✓ Checking .env file...")
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    print(f"  ✅ .env file found at {env_path}")

    # Check API key
    from dotenv import load_dotenv
    load_dotenv(env_path)
    api_key = os.getenv('ANTHROPIC_API_KEY')

    if not api_key:
        print(f"  ⚠️  ANTHROPIC_API_KEY not set in .env")
        print(f"  Edit {env_path} and add:")
        print(f"  ANTHROPIC_API_KEY=your_key_here")
    elif api_key == 'your_api_key_here':
        print(f"  ⚠️  ANTHROPIC_API_KEY still has placeholder value")
        print(f"  Edit {env_path} and replace with your actual API key")
    else:
        print(f"  ✅ ANTHROPIC_API_KEY configured (starts with '{api_key[:7]}...')")
else:
    print(f"  ❌ .env file not found")
    print(f"  Run: cp ../.env.example ../.env")
    print(f"  Then edit and add your API key")
print()

# Test 4: Output directories
print("✓ Checking output directories...")
output_dir = Path(__file__).parent.parent / 'market-intelligence'
if output_dir.exists():
    print(f"  ✅ Output directory: {output_dir}")
else:
    print(f"  ⚠️  Creating output directory: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / 'research_history').mkdir(exist_ok=True)

logs_dir = Path(__file__).parent / 'logs'
if not logs_dir.exists():
    logs_dir.mkdir(exist_ok=True)
    print(f"  ✅ Created logs directory: {logs_dir}")
else:
    print(f"  ✅ Logs directory: {logs_dir}")
print()

# Test 5: Module imports
print("✓ Testing module imports...")
try:
    from research.web_researcher import WebResearcher
    print("  ✅ research.web_researcher")
except ImportError as e:
    print(f"  ❌ research.web_researcher - {e}")

try:
    from research.tam_calculator import TAMCalculator
    print("  ✅ research.tam_calculator")
except ImportError as e:
    print(f"  ❌ research.tam_calculator - {e}")

try:
    from research.growth_analyzer import GrowthAnalyzer
    print("  ✅ research.growth_analyzer")
except ImportError as e:
    print(f"  ❌ research.growth_analyzer - {e}")

try:
    from utils.logger import setup_logger
    print("  ✅ utils.logger")
except ImportError as e:
    print(f"  ❌ utils.logger - {e}")
print()

# Test 6: Configuration
print("✓ Checking configuration...")
config_path = Path(__file__).parent / 'config.yaml'
if config_path.exists():
    print(f"  ✅ config.yaml found")
    import yaml
    with open(config_path) as f:
        config = yaml.safe_load(f)
    print(f"  ✅ Countries configured: {len(config.get('countries', []))}")
else:
    print(f"  ❌ config.yaml not found")
print()

# Summary
print("=" * 80)
print("Setup Verification Complete")
print("=" * 80)

# Check if ready to run
api_key = os.getenv('ANTHROPIC_API_KEY')
if api_key and api_key != 'your_api_key_here':
    print()
    print("✅ System is ready!")
    print()
    print("Run your first research:")
    print("  python main.py india")
    print()
else:
    print()
    print("⚠️  Setup incomplete - API key needed")
    print()
    print("Next steps:")
    print(f"1. Edit {env_path}")
    print("2. Add: ANTHROPIC_API_KEY=your_actual_key_here")
    print("3. Get your key from: https://console.anthropic.com/")
    print("4. Run: python main.py india")
    print()
