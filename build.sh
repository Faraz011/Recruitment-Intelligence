#!/bin/bash
set -e

echo "=== Build Step ==="
echo "Python version:"
python3 --version

echo "Installing dependencies (wheels only, no compilation)..."
pip install --no-cache-dir -r backend/requirements.txt

echo "✅ Build completed successfully!"
