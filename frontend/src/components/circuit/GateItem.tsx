import React from "react";
import { useDrag } from "react-dnd";
import { Gate, GateType, GateCategory } from "../../types/quantum";
import { GATE_INFO } from "../../gates/GateDefinitions";

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

  // Get gate info
  const gateInfo = GATE_INFO[gate.type];

  // Gate color based on category
  const getGateColor = (): string => {
    const category = gateInfo?.category || GateCategory.SPECIAL;

    switch (category) {
      case GateCategory.SINGLE_QUBIT:
        return "bg-blue-900 border-blue-500";
      case GateCategory.MULTI_QUBIT:
        return "bg-indigo-900 border-indigo-500";
      case GateCategory.ROTATION:
        return "bg-purple-900 border-purple-500";
      case GateCategory.ARITHMETIC:
        return "bg-green-900 border-green-500";
      case GateCategory.MODULAR:
        return "bg-emerald-900 border-emerald-500";
      case GateCategory.BIT_MANIPULATION:
        return "bg-teal-900 border-teal-500";
      case GateCategory.FOURIER:
        return "bg-cyan-900 border-cyan-500";
      case GateCategory.COMPARISON:
        return "bg-sky-900 border-sky-500";
      case GateCategory.CONTROL:
        return "bg-blue-900 border-blue-700";
      case GateCategory.POST_SELECTION:
        return "bg-violet-900 border-violet-500";
      case GateCategory.DETECTOR:
        return "bg-fuchsia-900 border-fuchsia-500";
      case GateCategory.INPUT:
        return "bg-pink-900 border-pink-500";
      case GateCategory.MEASUREMENT:
        return "bg-gray-900 border-gray-500";
      case GateCategory.DISPLAY:
        return "bg-amber-900 border-amber-500";
      case GateCategory.SPECIAL:
        return "bg-rose-900 border-rose-500";
      default:
        return "bg-gray-900 border-gray-500";
    }
  };

  // Get gate symbol
  const getGateSymbol = (): string => {
    return gateInfo?.symbol || gate.type;
  };

  // Get gate description
  const getGateDescription = (): string => {
    return gateInfo?.description || "Unknown Gate";
  };

  // Determine if the gate symbol needs a smaller font
  const needsSmallerFont = (): boolean => {
    const symbol = getGateSymbol();
    return symbol.length > 2;
  };

  // Determine if the gate is a display gate
  const isDisplayGate = (): boolean => {
    return gateInfo?.isDisplay || false;
  };

  // Determine if the gate is a control gate
  const isControlGate = (): boolean => {
    return gateInfo?.isControl || false;
  };

  // Determine if the gate is parameterized
  const isParameterizedGate = (): boolean => {
    return gateInfo?.isParameterized || false;
  };

  // Get additional styling based on gate properties
  const getAdditionalStyling = (): string => {
    let styles = "";

    if (isDisplayGate()) {
      styles += " border-2 border-yellow-500";
    } else if (isControlGate()) {
      styles += " border-2 border-blue-500";
    } else if (isParameterizedGate()) {
      styles += " border-dashed border-2";
    } else {
      styles += " border border-opacity-80";
    }

    return styles;
  };

  return (
    <div
      ref={isDraggable ? drag : undefined}
      className={`
        ${getGateColor()}
        text-green-400 font-bold w-10 h-10 rounded-md flex items-center justify-center
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isDraggable ? "cursor-move" : "cursor-default"}
        relative
        transition-all duration-150 transform hover:scale-105
        shadow-md
        ${getAdditionalStyling()}
        ${needsSmallerFont() ? "text-xs" : "text-sm"}
      `}
      title={getGateDescription()}
    >
      {getGateSymbol()}

      {onRemove && (
        <button
          className="absolute -top-2 -right-2 bg-red-900 text-green-400 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-800 transition-colors border border-red-600"
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
