#!/bin/bash

# Quantum Circuit Visualizer & Simulator Setup Script

echo "Setting up Quantum Circuit Visualizer & Simulator..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is required but not installed. Please install npm and try again."
    exit 1
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Create Python virtual environment
echo "Creating Python virtual environment..."
cd backend
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install numpy==1.23.5  # Install numpy first to avoid conflicts
pip install -r requirements.txt

# Return to root directory
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Return to root directory
cd ..

echo "Setup complete! You can now run the application with:"
echo "npm start"