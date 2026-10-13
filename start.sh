#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  Deepfake Video Forensics - Auto Launcher (Unix/macOS)"
echo "=========================================================="

# 1. Verify Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not found on your system PATH!"
    echo "Please download and install Node.js (v18+) from: https://nodejs.org/"
    exit 1
fi

# 2. Verify Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python 3 is not found on your system PATH!"
    echo "Please install Python 3.10+ from your package manager or https://www.python.org/"
    exit 1
fi

echo "[launcher] Starting Deepfake Forensics environment..."
node run.js
