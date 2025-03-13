import React from "react";
import { useDrag } from "react-dnd";
import { Gate, GateType } from "../../types/quantum";

interface GateItemProps {
  gate: Gate;
  isDraggable?: boolean;
  onRemove?: () => void;
}

const GateItem: React.FC<GateItemProps> = ({
  gate,
  isDraggable = false,
  onRemove,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "gate",
    item: { type: gate.type, qubit: gate.targets[0] },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => isDraggable,
  }));

  // Gate color based on type
  const getGateColor = (type: GateType): string => {
    switch (type) {
      case GateType.HADAMARD:
        return "bg-blue-500";
      case GateType.PAULI_X:
        return "bg-red-500";
      case GateType.PAULI_Y:
        return "bg-green-500";
      case GateType.PAULI_Z:
        return "bg-purple-500";
      case GateType.PHASE:
        return "bg-yellow-500";
      case GateType.PI_8:
        return "bg-orange-500";
      case GateType.CNOT:
        return "bg-indigo-500";
      case GateType.SWAP:
        return "bg-pink-500";
      case GateType.TOFFOLI:
        return "bg-teal-500";
      case GateType.MEASURE:
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  // Get gate description
  const getGateDescription = (type: GateType): string => {
    switch (type) {
      case GateType.HADAMARD:
        return "Hadamard Gate: Creates superposition";
      case GateType.PAULI_X:
        return "Pauli-X Gate: Bit flip (NOT gate)";
      case GateType.PAULI_Y:
        return "Pauli-Y Gate: Bit and phase flip";
      case GateType.PAULI_Z:
        return "Pauli-Z Gate: Phase flip";
      case GateType.PHASE:
        return "Phase Gate (S): π/2 phase rotation";
      case GateType.PI_8:
        return "π/8 Gate (T): π/4 phase rotation";
      case GateType.CNOT:
        return "CNOT Gate: Controlled-NOT operation";
      case GateType.SWAP:
        return "SWAP Gate: Swaps two qubits";
      case GateType.TOFFOLI:
        return "Toffoli Gate: Controlled-controlled-NOT";
      case GateType.MEASURE:
        return "Measurement: Collapses quantum state";
      default:
        return "Unknown Gate";
    }
  };

  return (
    <div
      ref={isDraggable ? drag : undefined}
      className={`
        ${getGateColor(gate.type)}
        text-white font-bold w-10 h-10 rounded-md flex items-center justify-center
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isDraggable ? "cursor-move" : "cursor-default"}
        relative
        transition-all duration-150 transform hover:scale-105
        shadow-md
      `}
      title={getGateDescription(gate.type)}
    >
      {gate.type}

      {onRemove && (
        <button
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove gate"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default GateItem;
