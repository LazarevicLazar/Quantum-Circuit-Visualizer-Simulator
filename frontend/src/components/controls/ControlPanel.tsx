import React, { useState } from "react";
import { useCircuit } from "../../context/CircuitContext";

interface ControlPanelProps {}

const ControlPanel: React.FC<ControlPanelProps> = () => {
  const {
    isSimulating,
    isStepMode,
    toggleStepMode,
    currentStep,
    nextStep,
    resetSimulation,
    noiseEnabled,
    toggleNoise,
    noiseLevel,
    setNoiseLevel,
    clearCircuit,
    toggleQasmEditor,
  } = useCircuit();

  const [showNoiseSettings, setShowNoiseSettings] = useState(false);

  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Step Mode Controls */}
      {isStepMode && (
        <>
          <button
            className="px-2 py-1 rounded text-xs bg-blue-800 hover:bg-blue-700 text-green-400 border border-green-700"
            onClick={nextStep}
          >
            Next Step
          </button>
          <span className="px-2 py-1 text-xs bg-gray-900 rounded text-green-400 border border-green-700">
            Step: {currentStep}
          </span>
        </>
      )}

      <button
        className={`px-2 py-1 rounded text-xs ${
          isStepMode ? "bg-blue-800" : "bg-gray-700 hover:bg-gray-600"
        } text-green-400 border border-green-700`}
        onClick={toggleStepMode}
        disabled={isSimulating}
      >
        {isStepMode ? "Exit Step" : "Step Mode"}
      </button>

      <button
        className="px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-green-400 border border-green-700"
        onClick={resetSimulation}
        disabled={isSimulating}
      >
        Reset
      </button>

      <button
        className="px-2 py-1 rounded text-xs bg-red-900 hover:bg-red-800 text-green-400 border border-green-700"
        onClick={clearCircuit}
        disabled={isSimulating}
      >
        Clear
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-green-800 mx-1"></div>

      {/* Noise Controls */}
      <div className="relative">
        <button
          className={`px-2 py-1 rounded text-xs ${
            noiseEnabled ? "bg-purple-900" : "bg-gray-700 hover:bg-gray-600"
          } text-green-400 border border-green-700`}
          onClick={() => setShowNoiseSettings(!showNoiseSettings)}
          disabled={isSimulating}
        >
          Noise {noiseEnabled ? "On" : "Off"}
        </button>

        {/* Noise Settings Dropdown */}
        {showNoiseSettings && (
          <div className="absolute top-full right-0 mt-1 bg-gray-800 p-3 rounded shadow-lg z-10 w-48 border border-green-700">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="noise-toggle"
                checked={noiseEnabled}
                onChange={toggleNoise}
                className="h-4 w-4 bg-gray-700 border-green-700"
                disabled={isSimulating}
              />
              <label htmlFor="noise-toggle" className="text-green-400 text-xs">
                Enable Noise
              </label>
            </div>

            <div>
              <label
                htmlFor="noise-level"
                className="block mb-1 text-green-400 text-xs"
              >
                Noise Level: {(noiseLevel * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                id="noise-level"
                min="0"
                max="0.1"
                step="0.001"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full"
                disabled={isSimulating || !noiseEnabled}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-green-800 mx-1"></div>

      {/* QASM Editor Button */}
      <button
        className="px-2 py-1 rounded text-xs bg-indigo-900 hover:bg-indigo-800 text-green-400 border border-green-700"
        onClick={toggleQasmEditor}
        disabled={isSimulating}
      >
        QASM Editor
      </button>

      {/* Simulation Status */}
      {isSimulating && (
        <div className="flex items-center ml-2">
          <div className="animate-pulse mr-1 h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-500">Simulating...</span>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
