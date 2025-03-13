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
from models import CircuitModel, GateModel, SimulationResult, GateType, GateCategory, GateInfo
from quantum_simulator import QuantumSimulator
from gate_implementations import GATE_IMPLEMENTATIONS

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
    # Create a list of gate info objects
    gates = []
    
    # Add all implemented gates
    for gate_type in GateType:
        if gate_type in GATE_IMPLEMENTATIONS or gate_type in [
            GateType.HADAMARD, GateType.PAULI_X, GateType.PAULI_Y, GateType.PAULI_Z,
            GateType.PHASE, GateType.PI_8, GateType.CNOT, GateType.SWAP, GateType.TOFFOLI,
            GateType.MEASURE
        ]:
            gates.append({
                "type": gate_type,
                "name": gate_type.name,
                "symbol": gate_type.value,
                "description": f"Quantum gate: {gate_type.value}",
                "category": get_gate_category(gate_type).value,
                "is_parameterized": is_parameterized_gate(gate_type),
                "is_display": is_display_gate(gate_type),
                "is_control": is_control_gate(gate_type),
                "qubits": get_gate_qubits(gate_type)
            })
    
    return {"gates": gates}

@app.get("/api/gate_categories")
async def get_gate_categories():
    """Return a list of gate categories"""
    categories = []
    
    for category in GateCategory:
        categories.append({
            "id": category.value,
            "name": category.value,
            "description": f"Category: {category.value}"
        })
    
    return {"categories": categories}

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

@app.get("/api/bloch_sphere/{qubit_index}")
async def get_bloch_sphere(qubit_index: int, circuit_id: Optional[str] = None):
    """Get Bloch sphere representation for a qubit"""
    try:
        # In a real implementation, we would retrieve the circuit from a database
        # For now, we'll return a placeholder
        return {
            "qubit_index": qubit_index,
            "coordinates": {
                "x": 0.0,
                "y": 0.0,
                "z": 1.0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/density_matrix/{qubit_indices}")
async def get_density_matrix(qubit_indices: str, circuit_id: Optional[str] = None):
    """Get density matrix for specified qubits"""
    try:
        # Parse qubit indices (comma-separated)
        indices = [int(idx) for idx in qubit_indices.split(",")]
        
        # In a real implementation, we would retrieve the circuit from a database
        # For now, we'll return a placeholder
        n = 2 ** len(indices)
        matrix = []
        for i in range(n):
            row = []
            for j in range(n):
                if i == j:
                    row.append({"real": 1.0 / n, "imag": 0.0})
                else:
                    row.append({"real": 0.0, "imag": 0.0})
            matrix.append(row)
        
        return {
            "qubits": indices,
            "matrix": matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions for gate categorization
def get_gate_category(gate_type: GateType) -> GateCategory:
    """Get the category for a gate type"""
    # Map gate types to categories
    if gate_type in [GateType.HADAMARD, GateType.PAULI_X, GateType.PAULI_Y, GateType.PAULI_Z, GateType.PHASE, GateType.PI_8]:
        return GateCategory.SINGLE_QUBIT
    elif gate_type in [GateType.CNOT, GateType.SWAP, GateType.TOFFOLI]:
        return GateCategory.MULTI_QUBIT
    elif gate_type in [GateType.SQRT_X, GateType.SQRT_X_DAG, GateType.SQRT_Y, GateType.SQRT_Y_DAG, 
                      GateType.SQRT_Z, GateType.SQRT_Z_DAG, GateType.X_4, GateType.X_4_DAG, 
                      GateType.Y_4, GateType.Y_4_DAG, GateType.Z_4, GateType.Z_4_DAG,
                      GateType.RX, GateType.RY, GateType.RZ, GateType.PHASE_BY_A, 
                      GateType.PHASE_BY_MINUS_A, GateType.X_BY_A, GateType.X_BY_MINUS_A,
                      GateType.Y_BY_A, GateType.Y_BY_MINUS_A]:
        return GateCategory.ROTATION
    elif gate_type in [GateType.INCREMENT, GateType.DECREMENT, GateType.ADD_A, GateType.SUBTRACT_A,
                      GateType.MULTIPLY_A, GateType.MULTIPLY_A_INVERSE]:
        return GateCategory.ARITHMETIC
    elif gate_type in [GateType.INCREMENT_MOD_R, GateType.DECREMENT_MOD_R, GateType.ADD_A_MOD_R,
                      GateType.SUBTRACT_A_MOD_R, GateType.MULTIPLY_A_MOD_R, GateType.MULTIPLY_A_MOD_R_INVERSE]:
        return GateCategory.MODULAR
    elif gate_type in [GateType.REVERSE_BITS, GateType.INTERLEAVE_BITS, GateType.DEINTERLEAVE_BITS,
                      GateType.CYCLE_BITS, GateType.REVERSE_CYCLE_BITS]:
        return GateCategory.BIT_MANIPULATION
    elif gate_type in [GateType.QFT, GateType.QFT_INVERSE, GateType.PHASE_GRADIENT, GateType.PHASE_DEGRADIENT]:
        return GateCategory.FOURIER
    elif gate_type in [GateType.LESS_THAN, GateType.GREATER_THAN, GateType.LESS_EQUAL,
                      GateType.GREATER_EQUAL, GateType.EQUAL, GateType.NOT_EQUAL]:
        return GateCategory.COMPARISON
    elif gate_type in [GateType.CONTROL, GateType.ANTI_CONTROL, GateType.X_CONTROL, GateType.X_ANTI_CONTROL,
                      GateType.Y_CONTROL, GateType.Y_ANTI_CONTROL, GateType.Z_PARITY_CONTROL,
                      GateType.Y_PARITY_CONTROL, GateType.X_PARITY_CONTROL]:
        return GateCategory.CONTROL
    elif gate_type in [GateType.POST_SELECT_ON, GateType.POST_SELECT_OFF, GateType.POST_SELECT_X,
                      GateType.POST_SELECT_ANTI_X, GateType.POST_SELECT_Y, GateType.POST_SELECT_ANTI_Y]:
        return GateCategory.POST_SELECTION
    elif gate_type in [GateType.Z_DETECTOR, GateType.X_DETECTOR, GateType.Y_DETECTOR,
                      GateType.Z_DETECT_CONTROL_CLEAR, GateType.X_DETECT_CONTROL_CLEAR, GateType.Y_DETECT_CONTROL_CLEAR]:
        return GateCategory.DETECTOR
    elif gate_type in [GateType.INPUT_A, GateType.INPUT_B, GateType.INPUT_R, GateType.SET_A, GateType.SET_B, GateType.SET_R]:
        return GateCategory.INPUT
    elif gate_type in [GateType.MEASURE]:
        return GateCategory.MEASUREMENT
    elif gate_type in [GateType.AMPLITUDE_DISPLAY, GateType.PROBABILITY_DISPLAY, GateType.SAMPLE_DISPLAY,
                      GateType.DENSITY_MATRIX_DISPLAY, GateType.BLOCH_DISPLAY]:
        return GateCategory.DISPLAY
    else:
        return GateCategory.SPECIAL

def is_parameterized_gate(gate_type: GateType) -> bool:
    """Check if a gate is parameterized"""
    return gate_type in [
        GateType.RX, GateType.RY, GateType.RZ,
        GateType.PHASE_BY_A, GateType.PHASE_BY_MINUS_A,
        GateType.X_BY_A, GateType.X_BY_MINUS_A,
        GateType.Y_BY_A, GateType.Y_BY_MINUS_A,
        GateType.SET_A, GateType.SET_B, GateType.SET_R
    ]

def is_display_gate(gate_type: GateType) -> bool:
    """Check if a gate is a display gate"""
    return gate_type in [
        GateType.AMPLITUDE_DISPLAY, GateType.PROBABILITY_DISPLAY,
        GateType.SAMPLE_DISPLAY, GateType.DENSITY_MATRIX_DISPLAY,
        GateType.BLOCH_DISPLAY
    ]

def is_control_gate(gate_type: GateType) -> bool:
    """Check if a gate is a control gate"""
    return gate_type in [
        GateType.CONTROL, GateType.ANTI_CONTROL,
        GateType.X_CONTROL, GateType.X_ANTI_CONTROL,
        GateType.Y_CONTROL, GateType.Y_ANTI_CONTROL,
        GateType.Z_PARITY_CONTROL, GateType.Y_PARITY_CONTROL,
        GateType.X_PARITY_CONTROL
    ]

def get_gate_qubits(gate_type: GateType) -> int:
    """Get the number of qubits a gate operates on"""
    if gate_type in [GateType.CNOT, GateType.SWAP]:
        return 2
    elif gate_type in [GateType.TOFFOLI]:
        return 3
    elif gate_type in [GateType.INTERLEAVE_BITS, GateType.DEINTERLEAVE_BITS]:
        return 4
    else:
        return 1

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)