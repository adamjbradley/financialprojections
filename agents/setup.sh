#!/bin/bash

# Market Research Agent Setup Script
# Automates installation and initial configuration

set -e  # Exit on error

echo "================================================================================"
echo "APAC Market Research Agent - Setup"
echo "================================================================================"
echo ""

# Check Python version
echo "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python $PYTHON_VERSION"

if ! python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
    echo "❌ Error: Python 3.8 or higher required"
    echo "   Please install Python 3.8+ and try again"
    exit 1
fi

echo "✅ Python version OK"
echo ""

# Create virtual environment
echo "Creating Python virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Check for .env file
echo "Checking environment configuration..."
if [ -f "../.env" ]; then
    echo "✅ .env file found"

    # Check if API key is set
    if grep -q "ANTHROPIC_API_KEY=your_api_key_here" ../.env || ! grep -q "ANTHROPIC_API_KEY=" ../.env; then
        echo "⚠️  Warning: ANTHROPIC_API_KEY not configured in .env"
        echo ""
        echo "Please edit ../.env and add your Anthropic API key:"
        echo "  ANTHROPIC_API_KEY=your_actual_key_here"
        echo ""
        echo "Get your API key from: https://console.anthropic.com/"
        echo ""
    else
        echo "✅ API key configured"
    fi
else
    echo "⚠️  .env file not found"
    echo "Creating from template..."
    cp ../.env.example ../.env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  Please edit ../.env and add your Anthropic API key:"
    echo "  ANTHROPIC_API_KEY=your_actual_key_here"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/"
    echo ""
fi

# Create log directory
echo "Creating log directory..."
mkdir -p logs
echo "✅ Log directory created"
echo ""

# Create output directories
echo "Creating output directories..."
mkdir -p ../market-intelligence/research_history
echo "✅ Output directories created"
echo ""

echo "================================================================================"
echo "✅ Setup Complete!"
echo "================================================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your API key (if not done already):"
echo "   Edit ../.env and set ANTHROPIC_API_KEY=your_key_here"
echo ""
echo "2. Run your first research:"
echo "   source venv/bin/activate"
echo "   python main.py india"
echo ""
echo "3. Start the API server (for frontend integration):"
echo "   python api_server.py"
echo ""
echo "4. Schedule daily updates:"
echo "   python scheduler/cron.py"
echo ""
echo "For detailed documentation, see README.md"
echo "================================================================================"
