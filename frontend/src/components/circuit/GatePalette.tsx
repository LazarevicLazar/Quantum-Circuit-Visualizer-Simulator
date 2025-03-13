import React, { useState } from "react";
import GateItem from "./GateItem";
import { Gate, GateType } from "../../types/quantum";

interface GatePaletteProps {}

const GatePalette: React.FC<GatePaletteProps> = () => {
  const [activeCategory, setActiveCategory] = useState<
    "single" | "multi" | "all"
  >("all");

  // Create sample gates for the palette
  const singleQubitGates: Gate[] = [
    {
      id: "h-palette",
      type: GateType.HADAMARD,
      targets: [0],
      controls: [],
      position: -1,
    },
    {
      id: "x-palette",
      type: GateType.PAULI_X,
      targets: [0],
      controls: [],
      position: -1,
    },
    {
      id: "y-palette",
      type: GateType.PAULI_Y,
      targets: [0],
      controls: [],
      position: -1,
    },
    {
      id: "z-palette",
      type: GateType.PAULI_Z,
      targets: [0],
      controls: [],
      position: -1,
    },
    {
      id: "s-palette",
      type: GateType.PHASE,
      targets: [0],
      controls: [],
      position: -1,
    },
    {
      id: "t-palette",
      type: GateType.PI_8,
      targets: [0],
      controls: [],
      position: -1,
    },
  ];

  const multiQubitGates: Gate[] = [
    {
      id: "cnot-palette",
      type: GateType.CNOT,
      targets: [1],
      controls: [0],
      position: -1,
    },
    {
      id: "swap-palette",
      type: GateType.SWAP,
      targets: [0, 1],
      controls: [],
      position: -1,
    },
    {
      id: "toffoli-palette",
      type: GateType.TOFFOLI,
      targets: [2],
      controls: [0, 1],
      position: -1,
    },
  ];

  const measurementGates: Gate[] = [
    {
      id: "measure-palette",
      type: GateType.MEASURE,
      targets: [0],
      controls: [],
      position: -1,
    },
  ];

  // Get gates to display based on active category
  const getDisplayGates = () => {
    switch (activeCategory) {
      case "single":
        return singleQubitGates;
      case "multi":
        return [...multiQubitGates, ...measurementGates];
      case "all":
      default:
        return [...singleQubitGates, ...multiQubitGates, ...measurementGates];
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Gate Palette</h3>
        <div className="flex space-x-1 text-sm">
          <button
            className={`px-2 py-1 rounded ${
              activeCategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeCategory === "single"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveCategory("single")}
          >
            Single-Qubit
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeCategory === "multi"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveCategory("multi")}
          >
            Multi-Qubit
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-md border border-gray-200">
        {getDisplayGates().map((gate) => (
          <div key={gate.id} className="tooltip" data-tip={gate.type}>
            <GateItem gate={gate} isDraggable={true} />
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <p>Drag gates onto the circuit</p>
        <p className="italic">Tip: Drop gates on qubit lines</p>
      </div>
    </div>
  );
};

export default GatePalette;
