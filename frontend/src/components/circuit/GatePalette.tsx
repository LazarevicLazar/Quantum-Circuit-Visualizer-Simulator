import React, { useState } from "react";
import GateItem from "./GateItem";
import { Gate, GateType, GateCategory } from "../../types/quantum";
import {
  GATE_INFO,
  TOP_TOOLBOX_GROUPS,
  BOTTOM_TOOLBOX_GROUPS,
} from "../../gates/GateDefinitions";

interface GatePaletteProps {}

const GatePalette: React.FC<GatePaletteProps> = () => {
  const [activeTab, setActiveTab] = useState<"top" | "bottom">("top");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Create a gate object for the palette
  const createGate = (type: GateType): Gate => {
    const info = GATE_INFO[type];
    const targets: number[] = [];
    const controls: number[] = [];

    // Set up targets and controls based on gate type
    if (info.qubits === 1) {
      targets.push(0);
    } else if (info.qubits === 2) {
      if (type === GateType.CNOT) {
        controls.push(0);
        targets.push(1);
      } else if (type === GateType.SWAP) {
        targets.push(0, 1);
      } else {
        targets.push(0);
      }
    } else if (info.qubits === 3) {
      if (type === GateType.TOFFOLI) {
        controls.push(0, 1);
        targets.push(2);
      } else {
        targets.push(0, 1, 2);
      }
    } else {
      // Default for multi-qubit gates
      for (let i = 0; i < info.qubits; i++) {
        targets.push(i);
      }
    }

    return {
      id: `${type}-palette`,
      type,
      targets,
      controls,
      position: -1,
    };
  };

  // Get gates to display based on active category and tab
  const getDisplayGates = () => {
    const toolboxGroups =
      activeTab === "top" ? TOP_TOOLBOX_GROUPS : BOTTOM_TOOLBOX_GROUPS;

    if (activeCategory === "all") {
      // Return all gates from all groups
      return toolboxGroups.flatMap((group) =>
        group.gates
          .filter((gate) => gate !== undefined)
          .map((gate) => createGate(gate as GateType))
      );
    } else {
      // Return gates from the selected category
      const selectedGroup = toolboxGroups.find(
        (group) => group.hint === activeCategory
      );
      if (selectedGroup) {
        return selectedGroup.gates
          .filter((gate) => gate !== undefined)
          .map((gate) => createGate(gate as GateType));
      }
      return [];
    }
  };

  // Get all categories from the current tab
  const getCategories = () => {
    const toolboxGroups =
      activeTab === "top" ? TOP_TOOLBOX_GROUPS : BOTTOM_TOOLBOX_GROUPS;
    return toolboxGroups.map((group) => group.hint);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab selector */}
      <div className="flex mb-2">
        <button
          className={`flex-1 py-1 px-1 text-xs rounded-t-md ${
            activeTab === "top"
              ? "bg-blue-900 text-green-400 border-t border-l border-r border-green-700"
              : "bg-gray-900 text-green-400 border-b border-green-800"
          }`}
          onClick={() => {
            setActiveTab("top");
            setActiveCategory("all");
          }}
        >
          Basic Gates
        </button>
        <button
          className={`flex-1 py-1 px-1 text-xs rounded-t-md ${
            activeTab === "bottom"
              ? "bg-blue-900 text-green-400 border-t border-l border-r border-green-700"
              : "bg-gray-900 text-green-400 border-b border-green-800"
          }`}
          onClick={() => {
            setActiveTab("bottom");
            setActiveCategory("all");
          }}
        >
          Advanced Gates
        </button>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-1 mb-2 overflow-y-auto max-h-24 bg-gray-900 p-1 rounded border border-green-800">
        <button
          className={`px-2 py-1 text-xs rounded ${
            activeCategory === "all"
              ? "bg-blue-900 text-green-400 border border-green-700"
              : "bg-gray-800 text-green-400 border border-green-900"
          }`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {getCategories().map((category) => (
          <button
            key={category}
            className={`px-2 py-1 text-xs rounded ${
              activeCategory === category
                ? "bg-blue-900 text-green-400 border border-green-700"
                : "bg-gray-800 text-green-400 border border-green-900"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gates display */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-900 rounded-md border border-green-800 flex-grow overflow-y-auto">
        {getDisplayGates().map((gate) => (
          <div
            key={gate.id}
            className="tooltip"
            data-tip={GATE_INFO[gate.type].description}
          >
            <GateItem gate={gate} isDraggable={true} />
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-green-500">
        <p className="italic">Drag gates onto qubit lines</p>
      </div>
    </div>
  );
};

export default GatePalette;
