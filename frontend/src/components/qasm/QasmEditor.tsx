import React, { useState } from "react";
import { useCircuit } from "../../context/CircuitContext";

interface QasmEditorProps {}

const QasmEditor: React.FC<QasmEditorProps> = () => {
  const { qasmCode, setQasmCode, importCircuit, toggleQasmEditor } =
    useCircuit();
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      setError(null);
      await importCircuit(qasmCode);
      toggleQasmEditor(); // Close the editor after successful import
    } catch (err) {
      setError("Failed to import QASM code. Please check the syntax.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-mono">QASM Editor</h2>
          <button
            onClick={toggleQasmEditor}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-900 text-white p-2 mb-4 rounded">{error}</div>
        )}

        <div className="mb-4">
          <textarea
            className="w-full h-80 bg-gray-900 text-green-400 p-4 font-mono text-sm rounded"
            value={qasmCode}
            onChange={(e) => setQasmCode(e.target.value)}
            placeholder="// Enter your QASM code here..."
            spellCheck={false}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={toggleQasmEditor}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            onClick={handleImport}
          >
            Import
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>Example QASM format:</p>
          <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
            {`OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
h q[0];
cx q[0],q[1];
measure q[0] -> c[0];`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QasmEditor;
