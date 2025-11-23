#!/bin/bash

# Quick Start Script for Better Monopoly Server
# This script helps new developers get started quickly

set -e

echo "🎮 Better Monopoly Server - Quick Start"
echo "======================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. You have: $(node -v)"
    exit 1
fi
echo "  Node.js version: $(node -v) ✓"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "  Dependencies installed ✓"
echo ""

# Copy environment file if not exists
if [ ! -f .env.local ]; then
    echo "⚙️  Setting up environment configuration..."
    cp .env.example .env.local
    echo "  .env.local created ✓"
    echo ""
fi

# Run tests
echo "🧪 Running tests..."
npm test
echo ""

# Build application
echo "🔨 Building application..."
npm run build
echo "  Build completed ✓"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review .env.local and adjust settings if needed"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:3000/health to verify"
echo "  4. Visit http://localhost:3000/api-docs for API documentation"
echo ""
echo "Available commands:"
echo "  npm run dev       - Start development server"
echo "  npm test          - Run tests"
echo "  npm run build     - Build for production"
echo "  npm start         - Start production server"
echo "  make help         - Show all available commands"
echo ""
echo "Happy coding! 🚀"
