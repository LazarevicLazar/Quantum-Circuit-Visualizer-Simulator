import numpy as np
from typing import List, Dict, Optional, Union, Tuple
import uuid

# Import Qiskit
from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector, DensityMatrix
from qiskit.result import Result

# Import our models
from models import CircuitModel, GateModel, GateType, SimulationResult, QuantumState, Complex, QubitState, BlochCoordinates, DensityMatrix as DensityMatrixModel
from gate_implementations import apply_gate

class QuantumSimulator:
    def __init__(self):
        self.simulator = Aer.get_backend('statevector_simulator')
        # We'll use the statevector simulator for all simulations
        # and calculate density matrices manually when needed
    
    def create_circuit(self, circuit_model: CircuitModel) -> QuantumCircuit:
        """Convert our circuit model to a Qiskit QuantumCircuit"""
        num_qubits = circuit_model.num_qubits
        qc = QuantumCircuit(num_qubits, num_qubits)  # qubits and classical bits
        
        # Sort gates by position
        sorted_gates = sorted(circuit_model.gates, key=lambda g: g.position)
        
        # Add gates to the circuit
        for gate in sorted_gates:
            self._add_gate_to_circuit(qc, gate)
        
        return qc
    
    def _add_gate_to_circuit(self, qc: QuantumCircuit, gate: GateModel):
        """Add a gate to the quantum circuit"""
        gate_type = gate.type
        targets = gate.targets
        controls = gate.controls
        params = gate.params
        
        # Use the gate implementations from gate_implementations.py
        try:
            apply_gate(qc, gate_type, targets, controls, params)
        except ValueError as e:
            # Fallback to basic gates for backward compatibility
            self._add_basic_gate_to_circuit(qc, gate)
    
    def _add_basic_gate_to_circuit(self, qc: QuantumCircuit, gate: GateModel):
        """Fallback method for basic gates (for backward compatibility)"""
        gate_type = gate.type
        targets = gate.targets
        controls = gate.controls
        
        if gate_type == GateType.HADAMARD:
            for target in targets:
                qc.h(target)
        
        elif gate_type == GateType.PAULI_X:
            for target in targets:
                qc.x(target)
        
        elif gate_type == GateType.PAULI_Y:
            for target in targets:
                qc.y(target)
        
        elif gate_type == GateType.PAULI_Z:
            for target in targets:
                qc.z(target)
        
        elif gate_type == GateType.PHASE:
            for target in targets:
                qc.s(target)
        
        elif gate_type == GateType.PI_8:
            for target in targets:
                qc.t(target)
        
        elif gate_type == GateType.CNOT:
            if len(controls) > 0 and len(targets) > 0:
                qc.cx(controls[0], targets[0])
        
        elif gate_type == GateType.SWAP:
            if len(targets) >= 2:
                qc.swap(targets[0], targets[1])
        
        elif gate_type == GateType.TOFFOLI:
            if len(controls) >= 2 and len(targets) > 0:
                qc.ccx(controls[0], controls[1], targets[0])
        
        elif gate_type == GateType.MEASURE:
            for i, target in enumerate(targets):
                qc.measure(target, target)
    
    def simulate(self, qc: QuantumCircuit) -> SimulationResult:
        """Simulate the quantum circuit and return the results"""
        # Create a copy of the circuit without measurements for statevector simulation
        qc_no_measure = QuantumCircuit(qc.num_qubits)
        for instruction, qargs, cargs in qc.data:
            if instruction.name != 'measure':
                qc_no_measure.append(instruction, qargs, cargs)
        
        # Get the statevector
        job = execute(qc_no_measure, self.simulator)
        result = job.result()
        statevector = result.get_statevector()
        
        # Calculate probabilities
        probabilities = np.abs(statevector) ** 2
        
        # Create the quantum state
        state = QuantumState(
            statevector=[
                Complex(real=float(sv.real), imag=float(sv.imag))
                for sv in statevector
            ],
            probabilities=[float(p) for p in probabilities]
        )
        
        # Calculate Bloch sphere coordinates for each qubit
        qubit_states = self._calculate_bloch_coordinates(statevector, qc.num_qubits)
        
        # Calculate density matrices for each qubit
        density_matrices = self._calculate_density_matrices(statevector, qc.num_qubits)
        
        # Create the simulation result
        sim_result = SimulationResult(
            initial_state=QuantumState(
                statevector=[Complex(real=1.0, imag=0.0)] + [Complex(real=0.0, imag=0.0)] * (2**qc.num_qubits - 1),
                probabilities=[1.0] + [0.0] * (2**qc.num_qubits - 1)
            ),
            final_state=state,
            qubit_states=qubit_states,
            density_matrices=density_matrices
        )
        
        return sim_result
    
    def _calculate_bloch_coordinates(self, statevector: np.ndarray, num_qubits: int) -> List[QubitState]:
        """Calculate Bloch sphere coordinates for each qubit"""
        qubit_states = []
        
        for i in range(num_qubits):
            # Create a reduced density matrix for this qubit
            reduced_dm = self._get_reduced_density_matrix(statevector, i, num_qubits)
            
            # Calculate Bloch coordinates
            x, y, z = self._density_matrix_to_bloch(reduced_dm)
            
            coords = BlochCoordinates(x=float(x), y=float(y), z=float(z))
            qubit_states.append(QubitState(qubit_index=i, coordinates=coords))
        
        return qubit_states
    
    def _calculate_density_matrices(self, statevector: np.ndarray, num_qubits: int) -> List[DensityMatrixModel]:
        """Calculate density matrices for each qubit and pairs of qubits"""
        density_matrices = []
        
        # Single qubit density matrices
        for i in range(num_qubits):
            dm = self._get_reduced_density_matrix(statevector, i, num_qubits)
            density_matrices.append(self._convert_density_matrix(dm, [i]))
        
        # Two-qubit density matrices (for entanglement visualization)
        if num_qubits >= 2:
            for i in range(num_qubits - 1):
                for j in range(i + 1, min(i + 2, num_qubits)):  # Only adjacent qubits to limit computation
                    dm = self._get_reduced_density_matrix(statevector, [i, j], num_qubits)
                    density_matrices.append(self._convert_density_matrix(dm, [i, j]))
        
        return density_matrices
    
    def _get_reduced_density_matrix(self, statevector: np.ndarray, qubits: Union[int, List[int]], num_qubits: int) -> np.ndarray:
        """Get the reduced density matrix for the specified qubits"""
        if isinstance(qubits, int):
            qubits = [qubits]
        
        # Create a Statevector object
        sv = Statevector(statevector)
        
        # Get the reduced density matrix
        try:
            # Use Qiskit's partial_trace if available
            reduced_dm = sv.partial_trace(qubits)
            return reduced_dm.data
        except (AttributeError, ImportError):
            # Fallback to manual calculation if partial_trace is not available
            return self._manual_partial_trace(statevector, qubits, num_qubits)
    
    def _manual_partial_trace(self, statevector: np.ndarray, qubits: List[int], num_qubits: int) -> np.ndarray:
        """Manually calculate the partial trace for the specified qubits"""
        # This is a simplified implementation for a single qubit
        if len(qubits) == 1:
            qubit = qubits[0]
            dim = 2 ** num_qubits
            reduced_dm = np.zeros((2, 2), dtype=complex)
            
            # Calculate the reduced density matrix
            for i in range(2):
                for j in range(2):
                    for k in range(2 ** (num_qubits - 1)):
                        # Calculate indices in the statevector
                        idx_i = k + (i << (num_qubits - 1 - qubit))
                        idx_j = k + (j << (num_qubits - 1 - qubit))
                        reduced_dm[i, j] += statevector[idx_i] * np.conj(statevector[idx_j])
            
            return reduced_dm
        
        # For multiple qubits, return a simple identity matrix (placeholder)
        dim = 2 ** len(qubits)
        return np.eye(dim, dtype=complex) / dim
    
    def _density_matrix_to_bloch(self, density_matrix: np.ndarray) -> Tuple[float, float, float]:
        """Convert a 2x2 density matrix to Bloch sphere coordinates"""
        # For a single qubit, the density matrix is 2x2
        # The Bloch sphere coordinates are:
        # x = 2*Re(rho_01)
        # y = 2*Im(rho_01)
        # z = rho_00 - rho_11
        
        x = 2 * np.real(density_matrix[0, 1])
        y = 2 * np.imag(density_matrix[0, 1])
        z = np.real(density_matrix[0, 0] - density_matrix[1, 1])
        
        return x, y, z
    
    def _convert_density_matrix(self, density_matrix: np.ndarray, qubits: List[int]) -> DensityMatrixModel:
        """Convert a numpy density matrix to our DensityMatrix model"""
        n = density_matrix.shape[0]
        matrix = []
        
        for i in range(n):
            row = []
            for j in range(n):
                value = density_matrix[i, j]
                row.append(Complex(real=float(value.real), imag=float(value.imag)))
            matrix.append(row)
        
        return DensityMatrixModel(
            matrix=matrix,
            qubits=qubits
        )
    
    def qiskit_to_model(self, qc: QuantumCircuit) -> CircuitModel:
        """Convert a Qiskit QuantumCircuit to our circuit model"""
        gates = []
        position = 0
        
        for instruction, qargs, cargs in qc.data:
            gate_type = self._get_gate_type(instruction.name)
            if gate_type:
                targets = [q.index for q in qargs]
                controls = []
                
                # For controlled gates, separate controls and targets
                if instruction.name in ['cx', 'ccx']:
                    if instruction.name == 'cx':  # CNOT
                        controls = [targets[0]]
                        targets = [targets[1]]
                    elif instruction.name == 'ccx':  # Toffoli
                        controls = [targets[0], targets[1]]
                        targets = [targets[2]]
                
                gate = GateModel(
                    id=str(uuid.uuid4()),
                    type=gate_type,
                    targets=targets,
                    controls=controls,
                    position=position
                )
                gates.append(gate)
                position += 1
        
        return CircuitModel(gates=gates, num_qubits=qc.num_qubits)
    
    def _get_gate_type(self, qiskit_gate_name: str) -> Optional[GateType]:
        """Map Qiskit gate names to our GateType enum"""
        gate_map = {
            'h': GateType.HADAMARD,
            'x': GateType.PAULI_X,
            'y': GateType.PAULI_Y,
            'z': GateType.PAULI_Z,
            's': GateType.PHASE,
            't': GateType.PI_8,
            'cx': GateType.CNOT,
            'swap': GateType.SWAP,
            'ccx': GateType.TOFFOLI,
            'measure': GateType.MEASURE,
            'sx': GateType.SQRT_X,
            'sxdg': GateType.SQRT_X_DAG,
            'sdg': GateType.SQRT_Z_DAG,
            'rx': GateType.RX,
            'ry': GateType.RY,
            'rz': GateType.RZ,
            'p': GateType.PHASE_BY_A,
        }
        return gate_map.get(qiskit_gate_name)