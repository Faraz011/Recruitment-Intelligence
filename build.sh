#!/bin/bash
set -e

echo "Installing Python 3.11..."
export PYTHON_VERSION=3.11.9

pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

echo "Build completed successfully!"
