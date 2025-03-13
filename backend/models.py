from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Tuple
from enum import Enum

class GateType(str, Enum):
    HADAMARD = "H"
    PAULI_X = "X"
    PAULI_Y = "Y"
    PAULI_Z = "Z"
    PHASE = "S"
    PI_8 = "T"
    CNOT = "CNOT"
    SWAP = "SWAP"
    TOFFOLI = "TOFFOLI"
    MEASURE = "MEASURE"

class GateModel(BaseModel):
    id: str
    type: GateType
    targets: List[int]
    controls: List[int]
    position: int
    params: Optional[List[float]] = None

class CircuitModel(BaseModel):
    gates: List[GateModel]
    num_qubits: int

class Complex(BaseModel):
    real: float
    imag: float

class QuantumState(BaseModel):
    statevector: List[Complex]
    probabilities: List[float]

class BlochCoordinates(BaseModel):
    x: float
    y: float
    z: float

class QubitState(BaseModel):
    qubit_index: int
    coordinates: BlochCoordinates

class SimulationResult(BaseModel):
    initial_state: QuantumState
    final_state: QuantumState
    intermediate_states: Optional[List[QuantumState]] = None
    measurements: Optional[Dict[str, int]] = None
    qubit_states: List[QubitState]