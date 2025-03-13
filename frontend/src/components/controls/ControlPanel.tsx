import React, { useState } from "react";
import { useCircuit } from "../../context/CircuitContext";

interface ControlPanelProps {}

const ControlPanel: React.FC<ControlPanelProps> = () => {
  const {
    runSimulation,
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
    exportCircuit,
    importCircuit,
    clearCircuit,
  } = useCircuit();

  const [importQasm, setImportQasm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  const handleRun = () => {
    runSimulation();
  };

  const handleExport = async () => {
    try {
      const qasm = await exportCircuit();
      alert(`Circuit exported to QASM:\n\n${qasm}`);
    } catch (error) {
      alert("Failed to export circuit");
    }
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleImportSubmit = async () => {
    try {
      await importCircuit(importQasm);
      setShowImportModal(false);
      setImportQasm("");
      alert("Circuit imported successfully");
    } catch (error) {
      alert("Failed to import circuit");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Control Panel</h2>

      <div className="space-y-4">
        {/* Simulation Controls */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Simulation</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded ${
                isSimulating
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
              onClick={handleRun}
              disabled={isStepMode || isSimulating}
            >
              {isSimulating ? "Simulating..." : "Run"}
            </button>

            <button
              className={`px-3 py-1 rounded ${
                isStepMode ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
              onClick={toggleStepMode}
              disabled={isSimulating}
            >
              {isStepMode ? "Exit Step Mode" : "Step Mode"}
            </button>

            {isStepMode && (
              <>
                <button
                  className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={nextStep}
                >
                  Next Step
                </button>
                <span className="px-2 py-1 bg-gray-200 rounded">
                  Step: {currentStep}
                </span>
              </>
            )}

            <button
              className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
              onClick={resetSimulation}
              disabled={isSimulating}
            >
              Reset
            </button>

            <button
              className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={clearCircuit}
              disabled={isSimulating}
            >
              Clear Circuit
            </button>
          </div>
        </div>

        {/* Noise Controls */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quantum Noise</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="noise-toggle"
              checked={noiseEnabled}
              onChange={toggleNoise}
              className="h-4 w-4"
              disabled={isSimulating}
            />
            <label htmlFor="noise-toggle">Enable Noise</label>
          </div>

          {noiseEnabled && (
            <div className="mt-2">
              <label htmlFor="noise-level" className="block mb-1">
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
                disabled={isSimulating}
              />
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Circuit I/O</h3>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleExport}
              disabled={isSimulating}
            >
              Export QASM
            </button>
            <button
              className="px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleImport}
              disabled={isSimulating}
            >
              Import QASM
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Import QASM</h3>
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded mb-4"
              value={importQasm}
              onChange={(e) => setImportQasm(e.target.value)}
              placeholder="Paste QASM code here..."
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleImportSubmit}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
