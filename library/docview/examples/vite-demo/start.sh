#!/bin/bash

echo "Starting LDesign DocView Demo..."
echo

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

echo "Starting development server..."
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop the server"
echo

npm run dev
