import React, { createContext, useContext, useState } from "react";
import { Circuit, Gate, SimulationResult } from "../types/quantum";
import {
  simulateCircuit,
  exportToQASM,
  importFromQASM,
} from "../api/quantumApi";

interface CircuitContextType {
  // Circuit state
  circuit: Circuit;
  addGate: (gate: Gate) => void;
  removeGate: (index: number) => void;
  clearCircuit: () => void;

  // Qubit management
  addQubit: () => void;
  removeQubit: () => void;

  // Simulation state
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  simulationError: string | null;

  // Simulation controls
  runSimulation: () => Promise<void>;
  isStepMode: boolean;
  toggleStepMode: () => void;
  currentStep: number;
  nextStep: () => void;
  resetSimulation: () => void;

  // Noise settings
  noiseEnabled: boolean;
  toggleNoise: () => void;
  noiseLevel: number;
  setNoiseLevel: (level: number) => void;

  // Import/Export
  exportCircuit: () => Promise<string>;
  importCircuit: (qasm: string) => Promise<void>;
}

const defaultCircuit: Circuit = {
  gates: [],
  numQubits: 3,
};

// Sample simulation result for initial state
const defaultSimulationResult: SimulationResult = {
  initialState: {
    statevector: [{ real: 1, imag: 0 }, ...Array(7).fill({ real: 0, imag: 0 })],
    probabilities: [1, ...Array(7).fill(0)],
  },
  finalState: {
    statevector: [{ real: 1, imag: 0 }, ...Array(7).fill({ real: 0, imag: 0 })],
    probabilities: [1, ...Array(7).fill(0)],
  },
};

const CircuitContext = createContext<CircuitContextType | undefined>(undefined);

export const CircuitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Circuit state
  const [circuit, setCircuit] = useState<Circuit>(defaultCircuit);

  // Simulation state
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(defaultSimulationResult);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Simulation controls
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Noise settings
  const [noiseEnabled, setNoiseEnabled] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0.01);

  // Add a gate to the circuit
  const addGate = (gate: Gate) => {
    setCircuit((prev) => ({
      ...prev,
      gates: [...prev.gates, gate],
    }));
  };

  // Remove a gate from the circuit
  const removeGate = (index: number) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.filter((_, i) => i !== index),
    }));
  };

  // Clear all gates from the circuit
  const clearCircuit = () => {
    setCircuit((prev) => ({
      ...prev,
      gates: [],
    }));
  };

  // Add a qubit to the circuit
  const addQubit = () => {
    setCircuit((prev) => ({
      ...prev,
      numQubits: prev.numQubits + 1,
    }));
  };

  // Remove a qubit from the circuit
  const removeQubit = () => {
    if (circuit.numQubits <= 1) return;

    const newNumQubits = circuit.numQubits - 1;

    // Remove gates that target or control the removed qubit
    const filteredGates = circuit.gates.filter(
      (gate) =>
        gate.targets.every((target) => target < newNumQubits) &&
        gate.controls.every((control) => control < newNumQubits)
    );

    setCircuit({
      numQubits: newNumQubits,
      gates: filteredGates,
    });
  };

  // Run the simulation
  const runSimulation = async () => {
    try {
      setIsSimulating(true);
      setSimulationError(null);

      // Call the API to simulate the circuit
      const result = await simulateCircuit(circuit);
      setSimulationResult(result);

      // For demo purposes, if the API call fails, use a mock result
      // In a real implementation, you would handle the error properly
    } catch (error) {
      console.error("Simulation error:", error);
      setSimulationError("Failed to simulate circuit");

      // For demo purposes, generate a mock result
      const mockResult: SimulationResult = {
        initialState: {
          statevector: [
            { real: 1, imag: 0 },
            ...Array(Math.pow(2, circuit.numQubits) - 1).fill({
              real: 0,
              imag: 0,
            }),
          ],
          probabilities: [
            1,
            ...Array(Math.pow(2, circuit.numQubits) - 1).fill(0),
          ],
        },
        finalState: {
          statevector: generateMockStateVector(circuit.numQubits),
          probabilities: generateMockProbabilities(circuit.numQubits),
        },
      };
      setSimulationResult(mockResult);
    } finally {
      setIsSimulating(false);
    }
  };

  // Toggle step mode
  const toggleStepMode = () => {
    setIsStepMode(!isStepMode);
    setCurrentStep(0);
  };

  // Move to the next step in step mode
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Reset the simulation
  const resetSimulation = () => {
    setCurrentStep(0);
    setSimulationResult(defaultSimulationResult);
  };

  // Toggle noise
  const toggleNoise = () => {
    setNoiseEnabled(!noiseEnabled);
  };

  // Export circuit to QASM
  const exportCircuit = async (): Promise<string> => {
    try {
      const qasm = await exportToQASM(circuit);
      return qasm;
    } catch (error) {
      console.error("Export error:", error);
      return "";
    }
  };

  // Import circuit from QASM
  const importCircuit = async (qasm: string): Promise<void> => {
    try {
      const importedCircuit = await importFromQASM(qasm);
      setCircuit(importedCircuit);
    } catch (error) {
      console.error("Import error:", error);
    }
  };

  // Helper function to generate mock state vector for demo
  const generateMockStateVector = (numQubits: number) => {
    const size = Math.pow(2, numQubits);
    const statevector = Array(size).fill({ real: 0, imag: 0 });

    // Create a simple superposition state
    statevector[0] = { real: 1 / Math.sqrt(2), imag: 0 };
    statevector[size - 1] = { real: 1 / Math.sqrt(2), imag: 0 };

    return statevector;
  };

  // Helper function to generate mock probabilities for demo
  const generateMockProbabilities = (numQubits: number) => {
    const size = Math.pow(2, numQubits);
    const probabilities = Array(size).fill(0);

    // Create a simple probability distribution
    probabilities[0] = 0.5;
    probabilities[size - 1] = 0.5;

    return probabilities;
  };

  const value = {
    circuit,
    addGate,
    removeGate,
    clearCircuit,
    addQubit,
    removeQubit,
    simulationResult,
    isSimulating,
    simulationError,
    runSimulation,
    isStepMode,
    toggleStepMode,
    currentStep,
    nextStep,
    resetSimulation,
    noiseEnabled,
    toggleNoise,
    noiseLevel,
    setNoiseLevel,
    exportCircuit,
    importCircuit,
  };

  return (
    <CircuitContext.Provider value={value}>{children}</CircuitContext.Provider>
  );
};

export const useCircuit = (): CircuitContextType => {
  const context = useContext(CircuitContext);
  if (context === undefined) {
    throw new Error("useCircuit must be used within a CircuitProvider");
  }
  return context;
};
