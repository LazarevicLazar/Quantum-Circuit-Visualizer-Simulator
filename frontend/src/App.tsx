import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import CircuitEditor from "./components/circuit/CircuitEditor";
import ControlPanel from "./components/controls/ControlPanel";
import VisualizationPanel from "./components/visualization/VisualizationPanel";
import { CircuitProvider } from "./context/CircuitContext";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CircuitProvider>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <h1 className="text-2xl font-bold">
              Quantum Circuit Visualizer & Simulator
            </h1>
          </header>
          <main className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CircuitEditor />
              </div>
              <div className="lg:col-span-1">
                <ControlPanel />
                <div className="mt-4">
                  <VisualizationPanel />
                </div>
              </div>
            </div>
          </main>
          <footer className="bg-gray-200 p-4 text-center text-gray-600">
            <p>
              Quantum Circuit Visualizer & Simulator - Built with React,
              TypeScript, and Qiskit
            </p>
          </footer>
        </div>
      </CircuitProvider>
    </DndProvider>
  );
}

export default App;
