from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
import json
import numpy as np

# Import Qiskit
from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector

# Import our modules
from models import CircuitModel, GateModel, SimulationResult
from quantum_simulator import QuantumSimulator

app = FastAPI(title="Quantum Circuit Visualizer API")

# Add CORS middleware to allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the quantum simulator
simulator = QuantumSimulator()

@app.get("/")
async def root():
    return {"message": "Quantum Circuit Visualizer API"}

@app.post("/api/simulate")
async def simulate_circuit(circuit: CircuitModel):
    try:
        # Convert the circuit model to a Qiskit quantum circuit
        qc = simulator.create_circuit(circuit)
        
        # Run the simulation
        result = simulator.simulate(qc)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gates")
async def get_available_gates():
    """Return a list of available quantum gates"""
    gates = [
        {"type": "H", "name": "Hadamard", "description": "Creates superposition"},
        {"type": "X", "name": "Pauli-X", "description": "Bit-flip (NOT gate)"},
        {"type": "Y", "name": "Pauli-Y", "description": "Y-rotation"},
        {"type": "Z", "name": "Pauli-Z", "description": "Phase-flip"},
        {"type": "S", "name": "Phase", "description": "π/2 phase rotation"},
        {"type": "T", "name": "π/8", "description": "π/4 phase rotation"},
        {"type": "CNOT", "name": "Controlled-NOT", "description": "Two-qubit gate that flips the target qubit if the control qubit is |1⟩"},
        {"type": "SWAP", "name": "SWAP", "description": "Swaps the state of two qubits"},
        {"type": "TOFFOLI", "name": "Toffoli", "description": "Three-qubit gate, also known as CCNOT"},
        {"type": "MEASURE", "name": "Measure", "description": "Measures the qubit in the computational basis"}
    ]
    return {"gates": gates}

@app.post("/api/export/qasm")
async def export_to_qasm(circuit: CircuitModel):
    """Export a circuit to OpenQASM format"""
    try:
        qc = simulator.create_circuit(circuit)
        qasm_str = qc.qasm()
        return {"qasm": qasm_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/import/qasm")
async def import_from_qasm(qasm_data: Dict[str, str]):
    """Import a circuit from OpenQASM format"""
    try:
        qasm_str = qasm_data.get("qasm", "")
        if not qasm_str:
            raise ValueError("QASM string is empty")
        
        # Create a circuit from QASM
        qc = QuantumCircuit.from_qasm_str(qasm_str)
        
        # Convert to our circuit model
        circuit = simulator.qiskit_to_model(qc)
        
        return circuit
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)