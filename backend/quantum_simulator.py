import numpy as np
from typing import List, Dict, Optional, Union, Tuple
import uuid

# Import Qiskit
from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector
from qiskit.result import Result

# Import our models
from models import CircuitModel, GateModel, GateType, SimulationResult, QuantumState, Complex, QubitState, BlochCoordinates

class QuantumSimulator:
    def __init__(self):
        self.simulator = Aer.get_backend('statevector_simulator')
    
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
        qubit_states = []
        for i in range(qc.num_qubits):
            # This is a simplified calculation - in a real implementation,
            # we would use Qiskit's functions to calculate the Bloch coordinates
            # For now, we'll use placeholder values
            coords = BlochCoordinates(
                x=0.0,
                y=0.0,
                z=1.0 if i < len(probabilities) and probabilities[i] > 0.5 else -1.0
            )
            qubit_states.append(QubitState(qubit_index=i, coordinates=coords))
        
        # Create the simulation result
        sim_result = SimulationResult(
            initial_state=QuantumState(
                statevector=[Complex(real=1.0, imag=0.0)] + [Complex(real=0.0, imag=0.0)] * (2**qc.num_qubits - 1),
                probabilities=[1.0] + [0.0] * (2**qc.num_qubits - 1)
            ),
            final_state=state,
            qubit_states=qubit_states
        )
        
        return sim_result
    
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
            'measure': GateType.MEASURE
        }
        return gate_map.get(qiskit_gate_name)