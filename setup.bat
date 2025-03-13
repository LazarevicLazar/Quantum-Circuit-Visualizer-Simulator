@echo off
echo Setting up Quantum Circuit Visualizer & Simulator...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is required but not installed. Please install Python and try again.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is required but not installed. Please install Node.js and try again.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is required but not installed. Please install npm and try again.
    exit /b 1
)

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Create Python virtual environment
echo Creating Python virtual environment...
cd backend
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install backend dependencies
echo Installing backend dependencies...
pip install numpy==1.23.5
pip install -r requirements.txt

REM Return to root directory
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install

REM Return to root directory
cd ..

echo Setup complete! You can now run the application with:
echo npm start