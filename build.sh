#!/bin/bash
set -e

echo "Installing Python 3.11..."
export PYTHON_VERSION=3.11.9

pip install --upgrade pip setuptools wheel

echo "Installing dependencies (wheels only, NO compilation)..."
pip install --only-binary=:all: -r backend/requirements.txt || \
pip install --no-build-isolation -r backend/requirements.txt

echo "Build completed successfully!"
