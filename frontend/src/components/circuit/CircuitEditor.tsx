import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import GateItem from "./GateItem";
import GatePalette from "./GatePalette";
import { Gate, GateType } from "../../types/quantum";
import { useCircuit } from "../../context/CircuitContext";

interface CircuitEditorProps {}

const CircuitEditor: React.FC<CircuitEditorProps> = () => {
  const { circuit, addGate, removeGate, addQubit, removeQubit } = useCircuit();

  const circuitRef = useRef<HTMLDivElement | null>(null);
  const qubitRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up the drop target for the circuit
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "gate",
    drop: (item: { type: GateType; qubit: number }, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !circuitRef.current) return;

      // Find the closest qubit line
      let targetQubit = 0;
      let minDistance = Number.MAX_VALUE;

      qubitRefs.current.forEach((ref, index) => {
        if (ref) {
          const refRect = ref.getBoundingClientRect();
          const distance = Math.abs(
            refRect.top + refRect.height / 2 - offset.y
          );
          if (distance < minDistance) {
            minDistance = distance;
            targetQubit = index;
          }
        }
      });

      // Find the next available column position
      const nextColumn = getNextAvailableColumn();

      // Create the gate
      const newGate: Gate = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        targets: [targetQubit],
        controls: [],
        position: nextColumn,
      };

      // Special handling for multi-qubit gates
      if (item.type === GateType.CNOT && targetQubit < circuit.numQubits - 1) {
        newGate.controls = [targetQubit];
        newGate.targets = [targetQubit + 1];
      } else if (
        item.type === GateType.SWAP &&
        targetQubit < circuit.numQubits - 1
      ) {
        newGate.targets = [targetQubit, targetQubit + 1];
      } else if (
        item.type === GateType.TOFFOLI &&
        targetQubit < circuit.numQubits - 2
      ) {
        newGate.controls = [targetQubit, targetQubit + 1];
        newGate.targets = [targetQubit + 2];
      }

      // Add the gate to the circuit
      addGate(newGate);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Function to set a ref for a qubit line
  const setQubitRef = (index: number) => (node: HTMLDivElement | null) => {
    if (index < qubitRefs.current.length) {
      qubitRefs.current[index] = node;
    }
  };

  // Function to get the next available column for a new gate
  const getNextAvailableColumn = (): number => {
    if (circuit.gates.length === 0) return 0;

    // Find the maximum position and add 1
    const maxPosition = Math.max(...circuit.gates.map((gate) => gate.position));
    return maxPosition + 1;
  };

  // Function to get gates for a specific qubit, sorted by position
  const getGatesForQubit = (qubitIndex: number) => {
    return circuit.gates
      .filter(
        (gate) =>
          gate.targets.includes(qubitIndex) ||
          gate.controls.includes(qubitIndex)
      )
      .sort((a, b) => a.position - b.position);
  };

  // Function to render connection lines for multi-qubit gates
  const renderConnectionLines = () => {
    // Filter for multi-qubit gates (gates with controls or multiple targets)
    const multiQubitGates = circuit.gates.filter(
      (gate) => gate.controls.length > 0 || gate.targets.length > 1
    );

    return multiQubitGates.map((gate) => {
      const position = 10 + gate.position * 60 + 20; // Center of the gate (40px width / 2)
      const allQubits = [...gate.controls, ...gate.targets];
      const minQubit = Math.min(...allQubits);
      const maxQubit = Math.max(...allQubits);

      // Calculate the top and height of the connection line
      const top = minQubit * 60 + 30; // 60px per qubit, 30px to center
      const height = (maxQubit - minQubit) * 60;

      return (
        <div
          key={`connection-${gate.id}`}
          className="absolute w-[2px] bg-black"
          style={{
            left: `${position}px`,
            top: `${top}px`,
            height: `${height}px`,
          }}
        />
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Circuit Editor</h2>
        <div className="space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={addQubit}
          >
            Add Qubit
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={removeQubit}
          >
            Remove Qubit
          </button>
        </div>
      </div>

      <GatePalette />

      <div
        ref={(el) => {
          // Store a reference to the element
          circuitRef.current = el;
          // Apply the drop ref
          drop(el);
        }}
        className={`mt-4 border-2 ${
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        } rounded-lg p-4 min-h-[300px] transition-colors duration-200 relative`}
      >
        {/* Connection lines for multi-qubit gates */}
        {renderConnectionLines()}

        {Array.from({ length: circuit.numQubits }).map((_, qubitIndex) => (
          <div
            key={qubitIndex}
            ref={setQubitRef(qubitIndex)}
            className="flex items-center h-[60px] border-b border-gray-200 relative"
          >
            <div className="w-[80px] font-mono">|0⟩ q{qubitIndex}</div>
            <div className="flex-1 h-[2px] bg-gray-400"></div>

            {/* Render gates for this qubit */}
            <div className="absolute left-[80px] right-0 top-0 bottom-0 flex items-center">
              {circuit.gates.map((gate) => {
                // Skip gates that don't affect this qubit
                if (
                  !gate.targets.includes(qubitIndex) &&
                  !gate.controls.includes(qubitIndex)
                ) {
                  return null;
                }

                // Calculate position based on gate position
                const position = `${10 + gate.position * 60}px`;

                // Determine if this is a control point or a target
                const isControl = gate.controls.includes(qubitIndex);
                const isTarget = gate.targets.includes(qubitIndex);

                if (isControl) {
                  // Render control point
                  return (
                    <div
                      key={`${gate.id}-control-${qubitIndex}`}
                      className="absolute w-3 h-3 bg-black rounded-full z-10"
                      style={{ left: position }}
                    />
                  );
                } else if (isTarget) {
                  // For SWAP gates, render a special symbol if this is not the primary target
                  if (
                    gate.type === GateType.SWAP &&
                    gate.targets[0] !== qubitIndex
                  ) {
                    return (
                      <div
                        key={`${gate.id}-swap-${qubitIndex}`}
                        className="absolute w-6 h-6 flex items-center justify-center z-10"
                        style={{ left: position }}
                      >
                        <div className="w-3 h-3 bg-black rounded-full" />
                      </div>
                    );
                  }

                  // Render gate
                  return (
                    <div
                      key={`${gate.id}-target-${qubitIndex}`}
                      className="absolute"
                      style={{ left: position }}
                    >
                      <GateItem
                        gate={gate}
                        onRemove={() =>
                          removeGate(
                            circuit.gates.findIndex((g) => g.id === gate.id)
                          )
                        }
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitEditor;
