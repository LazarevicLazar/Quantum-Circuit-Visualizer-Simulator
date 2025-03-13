// Quantum Gate Types
export enum GateType {
  // Single-qubit gates
  HADAMARD = "H",
  PAULI_X = "X",
  PAULI_Y = "Y",
  PAULI_Z = "Z",
  PHASE = "S",
  PI_8 = "T",

  // Multi-qubit gates
  CNOT = "CNOT",
  SWAP = "SWAP",
  TOFFOLI = "TOFFOLI",

  // Measurement
  MEASURE = "MEASURE",
}

// Gate representation
export interface Gate {
  id: string;
  type: GateType;
  targets: number[]; // Target qubit indices
  controls: number[]; // Control qubit indices (for multi-qubit gates)
  position: number; // Position in the circuit (column)
  params?: number[]; // Optional parameters for parameterized gates
}

// Quantum Circuit
export interface Circuit {
  gates: Gate[];
  numQubits: number;
}

// Quantum State
export interface QuantumState {
  statevector: Complex[];
  probabilities: number[];
}

// Complex number representation
export interface Complex {
  real: number;
  imag: number;
}

// Simulation Result
export interface SimulationResult {
  initialState: QuantumState;
  finalState: QuantumState;
  intermediateStates?: QuantumState[];
  measurements?: { [key: string]: number };
}

// Bloch Sphere Coordinates
export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
}

// Qubit State on Bloch Sphere
export interface QubitState {
  qubitIndex: number;
  coordinates: BlochCoordinates;
}
