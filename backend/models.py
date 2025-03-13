from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Tuple
from enum import Enum

class GateType(str, Enum):
    # Single-qubit gates
    HADAMARD = "H"
    PAULI_X = "X"
    PAULI_Y = "Y"
    PAULI_Z = "Z"
    PHASE = "S"
    PI_8 = "T"
    
    # Quarter turns
    SQRT_X = "√X"
    SQRT_X_DAG = "√X†"
    SQRT_Y = "√Y"
    SQRT_Y_DAG = "√Y†"
    SQRT_Z = "√Z"
    SQRT_Z_DAG = "√Z†"
    
    # Eighth turns
    X_4 = "X^¼"
    X_4_DAG = "X^-¼"
    Y_4 = "Y^¼"
    Y_4_DAG = "Y^-¼"
    Z_4 = "Z^¼"
    Z_4_DAG = "Z^-¼"
    
    # Parameterized rotation gates
    RX = "Rx"
    RY = "Ry"
    RZ = "Rz"
    PHASE_BY_A = "Z^A"
    PHASE_BY_MINUS_A = "Z^-A"
    X_BY_A = "X^A"
    X_BY_MINUS_A = "X^-A"
    Y_BY_A = "Y^A"
    Y_BY_MINUS_A = "Y^-A"
    
    # Multi-qubit gates
    CNOT = "CNOT"
    SWAP = "SWAP"
    TOFFOLI = "TOFFOLI"
    
    # Arithmetic gates
    INCREMENT = "INC"
    DECREMENT = "DEC"
    ADD_A = "+A"
    SUBTRACT_A = "-A"
    MULTIPLY_A = "×A"
    MULTIPLY_A_INVERSE = "×A⁻¹"
    
    # Modular arithmetic gates
    INCREMENT_MOD_R = "INC mod R"
    DECREMENT_MOD_R = "DEC mod R"
    ADD_A_MOD_R = "+A mod R"
    SUBTRACT_A_MOD_R = "-A mod R"
    MULTIPLY_A_MOD_R = "×A mod R"
    MULTIPLY_A_MOD_R_INVERSE = "×A⁻¹ mod R"
    
    # Bit manipulation gates
    REVERSE_BITS = "REV"
    INTERLEAVE_BITS = "INTLV"
    DEINTERLEAVE_BITS = "DEINTLV"
    CYCLE_BITS = "CYCLE"
    REVERSE_CYCLE_BITS = "REV CYCLE"
    
    # Fourier transform gates
    QFT = "QFT"
    QFT_INVERSE = "QFT⁻¹"
    
    # Phase gradient gates
    PHASE_GRADIENT = "PhGrad"
    PHASE_DEGRADIENT = "PhDegrad"
    
    # Comparison gates
    LESS_THAN = "A<B"
    GREATER_THAN = "A>B"
    LESS_EQUAL = "A≤B"
    GREATER_EQUAL = "A≥B"
    EQUAL = "A=B"
    NOT_EQUAL = "A≠B"
    
    # Control gates
    CONTROL = "•"
    ANTI_CONTROL = "○"
    X_CONTROL = "⊕"
    X_ANTI_CONTROL = "⊖"
    Y_CONTROL = "⊙"
    Y_ANTI_CONTROL = "⊘"
    Z_PARITY_CONTROL = "⨁"
    Y_PARITY_CONTROL = "⨂"
    X_PARITY_CONTROL = "⨀"
    
    # Post-selection gates
    POST_SELECT_ON = "!0"
    POST_SELECT_OFF = "!1"
    POST_SELECT_X = "!+"
    POST_SELECT_ANTI_X = "!-"
    POST_SELECT_Y = "!i"
    POST_SELECT_ANTI_Y = "!-i"
    
    # Detector gates
    Z_DETECTOR = "Z?"
    X_DETECTOR = "X?"
    Y_DETECTOR = "Y?"
    Z_DETECT_CONTROL_CLEAR = "Z?•"
    X_DETECT_CONTROL_CLEAR = "X?•"
    Y_DETECT_CONTROL_CLEAR = "Y?•"
    
    # Input gates
    INPUT_A = "A"
    INPUT_B = "B"
    INPUT_R = "R"
    SET_A = "SetA"
    SET_B = "SetB"
    SET_R = "SetR"
    
    # Measurement
    MEASURE = "MEASURE"
    
    # Display gates
    AMPLITUDE_DISPLAY = "Amps"
    PROBABILITY_DISPLAY = "Chance"
    SAMPLE_DISPLAY = "Sample"
    DENSITY_MATRIX_DISPLAY = "Density"
    BLOCH_DISPLAY = "Bloch"
    
    # Special gates
    SPACER = "Spacer"
    ZERO = "0"
    IMAGINARY = "i"
    ANTI_IMAGINARY = "-i"
    SQRT_IMAGINARY = "√i"
    ANTI_SQRT_IMAGINARY = "√-i"

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

class DensityMatrix(BaseModel):
    matrix: List[List[Complex]]

class SimulationResult(BaseModel):
    initial_state: QuantumState
    final_state: QuantumState
    intermediate_states: Optional[List[QuantumState]] = None
    measurements: Optional[Dict[str, int]] = None
    qubit_states: Optional[List[QubitState]] = None
    density_matrices: Optional[List[DensityMatrix]] = None

class GateCategory(str, Enum):
    SINGLE_QUBIT = "Single-Qubit Gates"
    MULTI_QUBIT = "Multi-Qubit Gates"
    ROTATION = "Rotation Gates"
    ARITHMETIC = "Arithmetic Gates"
    MODULAR = "Modular Arithmetic"
    BIT_MANIPULATION = "Bit Manipulation"
    FOURIER = "Fourier Transform"
    COMPARISON = "Comparison Gates"
    CONTROL = "Control Gates"
    POST_SELECTION = "Post-Selection"
    DETECTOR = "Detector Gates"
    INPUT = "Input Gates"
    MEASUREMENT = "Measurement"
    DISPLAY = "Display Gates"
    SPECIAL = "Special Gates"

class GateInfo(BaseModel):
    type: GateType
    name: str
    symbol: str
    description: str
    category: GateCategory
    qubits: int
    is_parameterized: bool
    is_display: bool
    is_control: bool