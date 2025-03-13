import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import CircuitEditor from "./components/circuit/CircuitEditor";
import ControlPanel from "./components/controls/ControlPanel";
import VisualizationPanel from "./components/visualization/VisualizationPanel";
import GatePalette from "./components/circuit/GatePalette";
import QasmEditor from "./components/qasm/QasmEditor";
import { CircuitProvider, useCircuit } from "./context/CircuitContext";

// Main App Component
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CircuitProvider>
        <AppContent />
      </CircuitProvider>
    </DndProvider>
  );
}

// App Content Component (to use the circuit context)
function AppContent() {
  const { showQasmEditor } = useCircuit();

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col crt-effect">
      <div className="scanline"></div>

      {/* Navigation Bar with Control Panel */}
      <header className="bg-gray-800 text-green-400 shadow-md border-b border-green-800">
        <div className="container mx-auto p-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold glow">
              Quantum Circuit Visualizer
            </h1>
            <ControlPanel />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-2 flex-grow flex flex-col h-[calc(100vh-8rem)]">
        {/* Main Content Area */}
        <div className="flex h-full gap-2">
          {/* Circuit Editor on the left */}
          <div className="flex-grow h-full overflow-auto">
            <CircuitEditor />
          </div>

          {/* Gate Palette on the right */}
          <div className="w-64 shrink-0 h-full overflow-auto">
            <div className="bg-gray-800 p-3 rounded-lg shadow-md border border-green-800 h-full">
              <h2 className="text-lg font-bold mb-2">Gate Palette</h2>
              <GatePalette />
            </div>
          </div>
        </div>

        {/* Visualizations below the circuit */}
        <div className="mt-2 h-1/3 min-h-[200px] overflow-auto">
          <VisualizationPanel />
        </div>
      </main>

      <footer className="bg-gray-800 p-2 text-center text-green-600 border-t border-green-800">
        <p>Quantum Circuit Visualizer - Built with React & Qiskit</p>
      </footer>

      {/* QASM Editor Modal */}
      {showQasmEditor && <QasmEditor />}

      {/* Terminal flicker effect */}
      <div className="fixed inset-0 pointer-events-none bg-green-500 opacity-0 z-50 flicker"></div>
    </div>
  );
}

export default App;
