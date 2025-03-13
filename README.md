# Quantum Circuit Visualizer & Simulator

A drag-and-drop visual interface that allows users to build and simulate quantum circuits using standard quantum gates like Hadamard (H), Pauli (X, Y, Z), CNOT, Toffoli, etc. The tool provides a real-time visualization of the circuit's state and simulates quantum operations.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Quick Setup](#quick-setup)
  - [Manual Setup](#manual-setup)
- [Usage](#usage)
- [Contributing](#contributing)
  - [Adding New Gates](#adding-new-gates)
  - [Extending Visualizations](#extending-visualizations)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## Features

- **Drag-and-Drop Gate Builder** – Users can drag quantum gates onto a workspace to construct circuits.
- **Quantum State Visualization** – Show Bloch Sphere representation and statevector evolution in real time.
- **Simulate and Execute** – Run the circuit locally or on IBM Quantum hardware.
- **Circuit Export/Import** – Save and load circuits using QASM (Quantum Assembly).
- **Educational Mode** – Step through each gate operation with annotated explanations.
- **Noise Simulation** – Toggle realistic quantum noise to see how errors impact results.
- **Multi-Qubit Entanglement** – Visualize Bell states and GHZ states dynamically.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Quick Setup

For convenience, we've provided setup scripts for both Linux/macOS and Windows:

#### Linux/macOS:

```bash
chmod +x setup.sh
./setup.sh
```

#### Windows:

```
setup.bat
```

These scripts will:

1. Check for required dependencies (Python, Node.js, npm)
2. Create a Python virtual environment
3. Install backend dependencies with the correct versions
4. Install frontend dependencies
5. Set up everything needed to run the application

After setup is complete, you can start the application with:

```
npm start
```

### Manual Setup

If you prefer to set up manually, follow these steps:

#### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd quantum-circuit-visualizer/frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

   The frontend will be available at http://localhost:3000

#### Backend Setup

1. Navigate to the backend directory:

   ```
   cd quantum-circuit-visualizer/backend
   ```

2. Create a virtual environment (optional but recommended):

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Start the backend server:

   ```
   uvicorn main:app --reload
   ```

   The API will be available at http://localhost:8000

#### Running Both Frontend and Backend

For convenience, you can use the root package.json scripts to run both servers:

```
npm start
```

## Usage

1. Open the application in your browser at http://localhost:3000
2. Drag quantum gates from the palette onto the circuit editor
3. Add or remove qubits as needed
4. Run the simulation to see the quantum state visualization
5. Use the control panel to step through the simulation or toggle noise
6. Export your circuit to QASM or import existing circuits

### Project Structure

```
quantum-circuit-visualizer/
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   └── src/                  # Source code
│       ├── api/              # API client
│       ├── components/       # React components
│       │   ├── circuit/      # Circuit editor components
│       │   ├── controls/     # Control panel components
│       │   └── visualization/ # Visualization components
│       └── types/            # TypeScript type definitions
└── backend/                  # Python FastAPI backend
    ├── main.py               # Main application entry point
    ├── models.py             # Pydantic models
    ├── quantum_simulator.py  # Quantum simulation logic
    └── requirements.txt      # Python dependencies
```

### Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Python with FastAPI
- **Quantum Simulation**: Qiskit
- **Visualization**: D3.js and Three.js

### CORS Issues

If you encounter CORS issues when the frontend tries to communicate with the backend:

1. Make sure both servers are running
2. Check that the backend CORS settings in `main.py` include your frontend URL
3. Verify that the API base URL in the frontend matches your backend URL

### Frontend TypeScript Errors

The TypeScript errors shown during development are expected until you install the dependencies. After running `npm install` in the frontend directory, most of these errors should be resolved.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
