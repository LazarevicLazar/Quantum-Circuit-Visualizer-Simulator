import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.quantum_info import Operator
from qiskit.extensions import UnitaryGate
from typing import List, Dict, Optional, Union, Tuple
import math

from models import GateType

# Helper functions for implementing gates
def create_qft_circuit(num_qubits: int, inverse: bool = False) -> QuantumCircuit:
    """Create a Quantum Fourier Transform circuit"""
    qc = QuantumCircuit(num_qubits)
    
    for i in range(num_qubits):
        qc.h(i)
        for j in range(i + 1, num_qubits):
            qc.cp(math.pi / 2**(j - i), i, j)
    
    # Swap qubits
    for i in range(num_qubits // 2):
        qc.swap(i, num_qubits - i - 1)
    
    if inverse:
        return qc.inverse()
    return qc

def create_phase_gradient_circuit(num_qubits: int, inverse: bool = False) -> QuantumCircuit:
    """Create a Phase Gradient circuit"""
    qc = QuantumCircuit(num_qubits)
    
    for i in range(num_qubits):
        angle = 2 * math.pi / (2**(i+1))
        if inverse:
            angle = -angle
        qc.p(angle, i)
    
    return qc

def create_increment_circuit(num_qubits: int, decrement: bool = False) -> QuantumCircuit:
    """Create an increment/decrement circuit"""
    qc = QuantumCircuit(num_qubits)
    
    # QFT
    qft = create_qft_circuit(num_qubits)
    qc.append(qft, range(num_qubits))
    
    # Phase rotations
    for i in range(num_qubits):
        angle = 2 * math.pi / (2**(num_qubits - i))
        if decrement:
            angle = -angle
        qc.p(angle, i)
    
    # Inverse QFT
    iqft = create_qft_circuit(num_qubits, inverse=True)
    qc.append(iqft, range(num_qubits))
    
    return qc

def create_add_circuit(num_qubits: int, subtract: bool = False) -> QuantumCircuit:
    """Create an addition/subtraction circuit with a parameter"""
    qc = QuantumCircuit(num_qubits * 2)  # Target + Control registers
    param = Parameter('a')
    
    # QFT on target register
    qft = create_qft_circuit(num_qubits)
    qc.append(qft, range(num_qubits))
    
    # Controlled phase rotations
    for i in range(num_qubits):
        for j in range(num_qubits):
            angle = 2 * math.pi * (2**j) / (2**num_qubits)
            if subtract:
                angle = -angle
            qc.cp(angle * param, num_qubits + j, i)
    
    # Inverse QFT
    iqft = create_qft_circuit(num_qubits, inverse=True)
    qc.append(iqft, range(num_qubits))
    
    return qc

def create_modular_add_circuit(num_qubits: int, subtract: bool = False) -> QuantumCircuit:
    """Create a modular addition/subtraction circuit"""
    qc = QuantumCircuit(num_qubits * 3)  # Target + Control + Modulus registers
    param_a = Parameter('a')
    param_r = Parameter('r')
    
    # Regular addition
    add_circuit = create_add_circuit(num_qubits, subtract)
    qc.append(add_circuit, range(num_qubits * 2))
    
    # Subtract modulus
    sub_mod_circuit = create_add_circuit(num_qubits, True)
    qc.append(sub_mod_circuit.bind_parameters({param_a: param_r}), range(num_qubits * 2))
    
    # Compare and conditionally add back modulus
    # This is a simplified implementation
    add_mod_circuit = create_add_circuit(num_qubits, False)
    qc.append(add_mod_circuit.bind_parameters({param_a: param_r}), range(num_qubits * 2))
    
    return qc

def create_reverse_bits_circuit(num_qubits: int) -> QuantumCircuit:
    """Create a circuit that reverses the order of bits"""
    qc = QuantumCircuit(num_qubits)
    
    for i in range(num_qubits // 2):
        qc.swap(i, num_qubits - i - 1)
    
    return qc

def create_cycle_bits_circuit(num_qubits: int, reverse: bool = False) -> QuantumCircuit:
    """Create a circuit that cycles the bits"""
    qc = QuantumCircuit(num_qubits)
    
    if reverse:
        # Cycle right
        for i in range(num_qubits - 1, 0, -1):
            qc.swap(i, i - 1)
    else:
        # Cycle left
        for i in range(num_qubits - 1):
            qc.swap(i, i + 1)
    
    return qc

def create_interleave_bits_circuit(num_qubits: int, deinterleave: bool = False) -> QuantumCircuit:
    """Create a circuit that interleaves/deinterleaves bits"""
    if num_qubits % 2 != 0:
        raise ValueError("Number of qubits must be even for interleaving")
    
    half = num_qubits // 2
    qc = QuantumCircuit(num_qubits)
    
    if deinterleave:
        # Deinterleave: move even bits to first half, odd bits to second half
        for i in range(half):
            qc.swap(i * 2, i)
            qc.swap(i * 2 + 1, half + i)
    else:
        # Interleave: first half to even positions, second half to odd positions
        for i in range(half):
            qc.swap(i, i * 2)
            qc.swap(half + i, i * 2 + 1)
    
    return qc

def create_comparison_circuit(num_qubits: int, comparison_type: str) -> QuantumCircuit:
    """Create a comparison circuit (A<B, A>B, A=B, etc.)"""
    qc = QuantumCircuit(num_qubits * 2 + 1)  # A + B + output qubit
    
    # This is a simplified implementation
    # In a real implementation, we would use arithmetic to compute A-B
    # and then check the sign bit or if the result is zero
    
    if comparison_type == "equal":
        # Check if A = B
        for i in range(num_qubits):
            qc.cx(i, num_qubits + i)  # XOR A and B
        
        # If all XORs are 0, then A = B
        qc.x(range(num_qubits, num_qubits * 2))
        qc.mcx(range(num_qubits, num_qubits * 2), num_qubits * 2)  # Set output to 1 if all equal
        qc.x(range(num_qubits, num_qubits * 2))
    
    elif comparison_type == "not_equal":
        # Check if A ≠ B
        for i in range(num_qubits):
            qc.cx(i, num_qubits + i)  # XOR A and B
        
        # If any XOR is 1, then A ≠ B
        qc.mcx(range(num_qubits, num_qubits * 2), num_qubits * 2)  # Set output to 1 if any not equal
        qc.x(num_qubits * 2)
    
    # Other comparison types would be implemented similarly
    # but require more complex arithmetic circuits
    
    return qc

# Dictionary mapping gate types to their implementation functions
GATE_IMPLEMENTATIONS = {
    # Single-qubit gates
    GateType.HADAMARD: lambda qc, targets, controls=None, params=None: [qc.h(t) for t in targets],
    GateType.PAULI_X: lambda qc, targets, controls=None, params=None: [qc.x(t) for t in targets],
    GateType.PAULI_Y: lambda qc, targets, controls=None, params=None: [qc.y(t) for t in targets],
    GateType.PAULI_Z: lambda qc, targets, controls=None, params=None: [qc.z(t) for t in targets],
    GateType.PHASE: lambda qc, targets, controls=None, params=None: [qc.s(t) for t in targets],
    GateType.PI_8: lambda qc, targets, controls=None, params=None: [qc.t(t) for t in targets],
    
    # Quarter turns
    GateType.SQRT_X: lambda qc, targets, controls=None, params=None: [qc.sx(t) for t in targets],
    GateType.SQRT_X_DAG: lambda qc, targets, controls=None, params=None: [qc.sxdg(t) for t in targets],
    GateType.SQRT_Y: lambda qc, targets, controls=None, params=None: 
        [qc.unitary(Operator([[0.5+0.5j, -0.5-0.5j], [0.5+0.5j, 0.5+0.5j]]), [t], f"√Y_{t}") for t in targets],
    GateType.SQRT_Y_DAG: lambda qc, targets, controls=None, params=None: 
        [qc.unitary(Operator([[0.5-0.5j, 0.5-0.5j], [-0.5+0.5j, 0.5-0.5j]]), [t], f"√Y†_{t}") for t in targets],
    GateType.SQRT_Z: lambda qc, targets, controls=None, params=None: [qc.s(t) for t in targets],
    GateType.SQRT_Z_DAG: lambda qc, targets, controls=None, params=None: [qc.sdg(t) for t in targets],
    
    # Eighth turns
    GateType.X_4: lambda qc, targets, controls=None, params=None: 
        [qc.rx(math.pi/4, t) for t in targets],
    GateType.X_4_DAG: lambda qc, targets, controls=None, params=None: 
        [qc.rx(-math.pi/4, t) for t in targets],
    GateType.Y_4: lambda qc, targets, controls=None, params=None: 
        [qc.ry(math.pi/4, t) for t in targets],
    GateType.Y_4_DAG: lambda qc, targets, controls=None, params=None: 
        [qc.ry(-math.pi/4, t) for t in targets],
    GateType.Z_4: lambda qc, targets, controls=None, params=None: 
        [qc.rz(math.pi/4, t) for t in targets],
    GateType.Z_4_DAG: lambda qc, targets, controls=None, params=None: 
        [qc.rz(-math.pi/4, t) for t in targets],
    
    # Parameterized rotation gates
    GateType.RX: lambda qc, targets, controls=None, params=None: 
        [qc.rx(params[0] if params else math.pi/2, t) for t in targets],
    GateType.RY: lambda qc, targets, controls=None, params=None: 
        [qc.ry(params[0] if params else math.pi/2, t) for t in targets],
    GateType.RZ: lambda qc, targets, controls=None, params=None: 
        [qc.rz(params[0] if params else math.pi/2, t) for t in targets],
    GateType.PHASE_BY_A: lambda qc, targets, controls=None, params=None: 
        [qc.p(params[0] if params else math.pi/2, t) for t in targets],
    GateType.PHASE_BY_MINUS_A: lambda qc, targets, controls=None, params=None: 
        [qc.p(-params[0] if params else -math.pi/2, t) for t in targets],
    GateType.X_BY_A: lambda qc, targets, controls=None, params=None: 
        [qc.rx(params[0] if params else math.pi/2, t) for t in targets],
    GateType.X_BY_MINUS_A: lambda qc, targets, controls=None, params=None: 
        [qc.rx(-params[0] if params else -math.pi/2, t) for t in targets],
    GateType.Y_BY_A: lambda qc, targets, controls=None, params=None: 
        [qc.ry(params[0] if params else math.pi/2, t) for t in targets],
    GateType.Y_BY_MINUS_A: lambda qc, targets, controls=None, params=None: 
        [qc.ry(-params[0] if params else -math.pi/2, t) for t in targets],
    
    # Multi-qubit gates
    GateType.CNOT: lambda qc, targets, controls=None, params=None: 
        [qc.cx(controls[0], targets[0]) if controls else None],
    GateType.SWAP: lambda qc, targets, controls=None, params=None: 
        [qc.swap(targets[0], targets[1]) if len(targets) > 1 else None],
    GateType.TOFFOLI: lambda qc, targets, controls=None, params=None: 
        [qc.ccx(controls[0], controls[1], targets[0]) if controls and len(controls) > 1 else None],
    
    # Arithmetic gates
    GateType.INCREMENT: lambda qc, targets, controls=None, params=None: 
        qc.append(create_increment_circuit(len(targets)), targets),
    GateType.DECREMENT: lambda qc, targets, controls=None, params=None: 
        qc.append(create_increment_circuit(len(targets), decrement=True), targets),
    
    # Fourier transform gates
    GateType.QFT: lambda qc, targets, controls=None, params=None: 
        qc.append(create_qft_circuit(len(targets)), targets),
    GateType.QFT_INVERSE: lambda qc, targets, controls=None, params=None: 
        qc.append(create_qft_circuit(len(targets), inverse=True), targets),
    
    # Phase gradient gates
    GateType.PHASE_GRADIENT: lambda qc, targets, controls=None, params=None: 
        qc.append(create_phase_gradient_circuit(len(targets)), targets),
    GateType.PHASE_DEGRADIENT: lambda qc, targets, controls=None, params=None: 
        qc.append(create_phase_gradient_circuit(len(targets), inverse=True), targets),
    
    # Bit manipulation gates
    GateType.REVERSE_BITS: lambda qc, targets, controls=None, params=None: 
        qc.append(create_reverse_bits_circuit(len(targets)), targets),
    GateType.CYCLE_BITS: lambda qc, targets, controls=None, params=None: 
        qc.append(create_cycle_bits_circuit(len(targets)), targets),
    GateType.REVERSE_CYCLE_BITS: lambda qc, targets, controls=None, params=None: 
        qc.append(create_cycle_bits_circuit(len(targets), reverse=True), targets),
    
    # Measurement
    GateType.MEASURE: lambda qc, targets, controls=None, params=None: 
        [qc.measure(t, t) for t in targets],
}

def apply_gate(qc: QuantumCircuit, gate_type: GateType, targets: List[int], 
               controls: Optional[List[int]] = None, params: Optional[List[float]] = None) -> None:
    """Apply a gate to the quantum circuit"""
    if gate_type in GATE_IMPLEMENTATIONS:
        GATE_IMPLEMENTATIONS[gate_type](qc, targets, controls, params)
    else:
        raise ValueError(f"Gate type {gate_type} not implemented")