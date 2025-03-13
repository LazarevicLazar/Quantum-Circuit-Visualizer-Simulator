import React from "react";
import BlochSphere from "./BlochSphere";
import StateVector from "./StateVector";
import ProbabilityChart from "./ProbabilityChart";
import DensityMatrixDisplay from "./DensityMatrixDisplay";
import SampleDisplay from "./SampleDisplay";
import { useCircuit } from "../../context/CircuitContext";

interface VisualizationPanelProps {}

const VisualizationPanel: React.FC<VisualizationPanelProps> = () => {
  const { simulationResult, isSimulating, circuit } = useCircuit();

  // If there's no simulation result, use a default state
  const state = simulationResult?.finalState || {
    statevector: [{ real: 1, imag: 0 }, ...Array(7).fill({ real: 0, imag: 0 })],
    probabilities: [1, ...Array(7).fill(0)],
  };

  // Generate Bloch sphere coordinates from the state vector
  const generateBlochCoordinates = () => {
    if (!simulationResult || !simulationResult.qubit_states) return [];

    // Use the qubit states from the simulation result if available
    if (simulationResult.qubit_states) {
      return simulationResult.qubit_states;
    }

    // Fallback to random values
    return Array(circuit.numQubits)
      .fill(0)
      .map((_, i) => ({
        qubitIndex: i,
        coordinates: {
          x: Math.random() * 2 - 1, // Random value between -1 and 1
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1,
        },
      }));
  };

  // Generate a density matrix for display
  const generateDensityMatrix = () => {
    if (!simulationResult || !simulationResult.density_matrices) {
      // Create a default density matrix for a single qubit in |0⟩ state
      return {
        matrix: [
          [
            { real: 1, imag: 0 },
            { real: 0, imag: 0 },
          ],
          [
            { real: 0, imag: 0 },
            { real: 0, imag: 0 },
          ],
        ],
        qubits: [0],
      };
    }

    // Return the first density matrix from the simulation result
    return simulationResult.density_matrices[0];
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md border border-green-800 h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-green-400">Quantum State</h2>

        {/* Simulation Status */}
        <div className="text-xs text-green-500">
          {isSimulating ? (
            <div className="flex items-center">
              <div className="animate-pulse mr-1 h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Simulating...</span>
            </div>
          ) : simulationResult ? (
            <div>Simulation complete</div>
          ) : (
            <div>No simulation run yet</div>
          )}
        </div>
      </div>

      {/* Visualization Content - All visualizations displayed side by side */}
      {simulationResult ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {/* Bloch Sphere */}
          <div className="bg-gray-900 p-2 rounded-lg border border-green-800">
            <h3 className="text-sm font-semibold mb-1 text-green-400">
              Bloch Sphere
            </h3>
            <div className="h-32 border border-green-900 rounded overflow-hidden">
              <BlochSphere qubitStates={generateBlochCoordinates()} />
            </div>
            <div className="mt-1 text-xs text-green-600">
              <p>|0⟩: North, |1⟩: South</p>
            </div>
          </div>

          {/* State Vector */}
          <div className="bg-gray-900 p-2 rounded-lg border border-green-800">
            <h3 className="text-sm font-semibold mb-1 text-green-400">
              State Vector
            </h3>
            <div className="h-32 border border-green-900 rounded overflow-hidden">
              <StateVector statevector={state.statevector} />
            </div>
            <div className="mt-1 text-xs text-green-600">
              <p>Height: Magnitude, Color: Phase</p>
            </div>
          </div>

          {/* Probability Chart */}
          <div className="bg-gray-900 p-2 rounded-lg border border-green-800">
            <h3 className="text-sm font-semibold mb-1 text-green-400">
              Probability
            </h3>
            <div className="h-32 border border-green-900 rounded overflow-hidden">
              <ProbabilityChart probabilities={state.probabilities} />
            </div>
            <div className="mt-1 text-xs text-green-600">
              <p>Probability = |Amplitude|²</p>
            </div>
          </div>

          {/* Density Matrix */}
          <div className="bg-gray-900 p-2 rounded-lg border border-green-800">
            <h3 className="text-sm font-semibold mb-1 text-green-400">
              Density Matrix
            </h3>
            <div className="h-32 border border-green-900 rounded overflow-auto">
              <DensityMatrixDisplay
                matrix={generateDensityMatrix().matrix}
                qubits={generateDensityMatrix().qubits}
              />
            </div>
            <div className="mt-1 text-xs text-green-600">
              <p>Diagonal: Probabilities</p>
            </div>
          </div>

          {/* Sample Display */}
          <div className="bg-gray-900 p-2 rounded-lg border border-green-800">
            <h3 className="text-sm font-semibold mb-1 text-green-400">
              Samples
            </h3>
            <div className="h-32 border border-green-900 rounded overflow-auto">
              <SampleDisplay state={state} numQubits={circuit.numQubits} />
            </div>
            <div className="mt-1 text-xs text-green-600">
              <p>Measurement outcomes</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 h-32 flex items-center justify-center rounded-lg border border-green-800">
          <p className="text-green-600">Run a simulation to see results</p>
        </div>
      )}
    </div>
  );
};

export default VisualizationPanel;
