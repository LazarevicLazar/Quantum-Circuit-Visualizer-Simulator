import React, { useState } from "react";
import BlochSphere from "./BlochSphere";
import StateVector from "./StateVector";
import ProbabilityChart from "./ProbabilityChart";
import { useCircuit } from "../../context/CircuitContext";

interface VisualizationPanelProps {}

const VisualizationPanel: React.FC<VisualizationPanelProps> = () => {
  const [activeTab, setActiveTab] = useState<
    "bloch" | "statevector" | "probability"
  >("bloch");

  const { simulationResult, isSimulating } = useCircuit();

  // If there's no simulation result, use a default state
  const state = simulationResult?.finalState || {
    statevector: [{ real: 1, imag: 0 }, ...Array(7).fill({ real: 0, imag: 0 })],
    probabilities: [1, ...Array(7).fill(0)],
  };

  // Generate Bloch sphere coordinates from the state vector
  const generateBlochCoordinates = () => {
    if (!simulationResult) return [];

    // This is a simplified calculation - in a real implementation,
    // we would use proper quantum mechanics to calculate the Bloch coordinates
    return Array(3)
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Quantum State Visualization</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${
            activeTab === "bloch"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("bloch")}
        >
          Bloch Sphere
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "statevector"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("statevector")}
        >
          State Vector
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "probability"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("probability")}
        >
          Probability
        </button>
      </div>

      {/* Simulation Status */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          {isSimulating ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
              Simulating...
            </div>
          ) : simulationResult ? (
            <div className="text-green-600">Simulation complete</div>
          ) : (
            <div>No simulation run yet</div>
          )}
        </div>
      </div>

      {/* Visualization Content */}
      <div className="h-64 border border-gray-200 rounded">
        {activeTab === "bloch" && (
          <div className="h-full">
            {simulationResult ? (
              <BlochSphere qubitStates={generateBlochCoordinates()} />
            ) : (
              <div className="bg-gray-100 h-full flex items-center justify-center">
                <p className="text-gray-500">Run a simulation to see results</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "statevector" && (
          <div className="h-full">
            {simulationResult ? (
              <StateVector statevector={state.statevector} />
            ) : (
              <div className="bg-gray-100 h-full flex items-center justify-center">
                <p className="text-gray-500">Run a simulation to see results</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "probability" && (
          <div className="h-full">
            {simulationResult ? (
              <ProbabilityChart probabilities={state.probabilities} />
            ) : (
              <div className="bg-gray-100 h-full flex items-center justify-center">
                <p className="text-gray-500">Run a simulation to see results</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-sm">
        <h3 className="font-semibold mb-1">Legend:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>|0⟩: Ground state (North Pole)</li>
          <li>|1⟩: Excited state (South Pole)</li>
          <li>|+⟩: Superposition along X-axis</li>
          <li>|-⟩: Negative superposition along X-axis</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualizationPanel;
