import React, { useRef, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import GateItem from "./GateItem";
import { Gate, GateType } from "../../types/quantum";
import { useCircuit } from "../../context/CircuitContext";
import { GATE_INFO } from "../../gates/GateDefinitions";

interface CircuitEditorProps {}

const CircuitEditor: React.FC<CircuitEditorProps> = () => {
  const { circuit, addGate, removeGate, addQubit, removeQubit } = useCircuit();

  const circuitRef = useRef<HTMLDivElement | null>(null);
  const qubitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dropIndicator, setDropIndicator] = useState<{
    qubit: number;
    position: number;
  } | null>(null);

  // Initialize qubitRefs array when the number of qubits changes
  useEffect(() => {
    qubitRefs.current = qubitRefs.current.slice(0, circuit.numQubits);
    while (qubitRefs.current.length < circuit.numQubits) {
      qubitRefs.current.push(null);
    }
  }, [circuit.numQubits]);

  // Set up the drop target for the circuit
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "gate",
      hover: (item: { type: GateType; qubit: number }, monitor) => {
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

        // Find the closest position (column)
        const circuitRect = circuitRef.current.getBoundingClientRect();
        const relativeX = offset.x - circuitRect.left - 80; // Adjust for the qubit label width
        const position = Math.max(0, Math.floor(relativeX / 60));

        // Update drop indicator
        setDropIndicator({ qubit: targetQubit, position });
      },
      drop: (item: { type: GateType; qubit: number }, monitor) => {
        const offset = monitor.getClientOffset();
        if (!offset || !circuitRef.current || !dropIndicator) return;

        const targetQubit = dropIndicator.qubit;
        const position = dropIndicator.position;

        // Create the gate
        const newGate: Gate = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          targets: [targetQubit],
          controls: [],
          position: position,
        };

        // Get gate info
        const gateInfo = GATE_INFO[item.type];

        // Special handling for multi-qubit gates
        if (gateInfo) {
          if (gateInfo.qubits > 1) {
            if (
              item.type === GateType.CNOT &&
              targetQubit < circuit.numQubits - 1
            ) {
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
          }
        }

        // Check if there's already a gate at this position and qubit
        const existingGate = circuit.gates.find(
          (g) =>
            g.position === position &&
            (g.targets.includes(targetQubit) ||
              g.controls.includes(targetQubit))
        );

        // Only add the gate if there isn't already one at this position
        if (!existingGate) {
          // Add the gate to the circuit
          addGate(newGate);
        }

        // Clear drop indicator
        setDropIndicator(null);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [circuit.gates, circuit.numQubits, addGate, dropIndicator]
  );

  // Function to set a ref for a qubit line
  const setQubitRef = (index: number) => (node: HTMLDivElement | null) => {
    qubitRefs.current[index] = node;
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
          className="absolute w-[2px] bg-green-500"
          style={{
            left: `${position}px`,
            top: `${top}px`,
            height: `${height}px`,
          }}
        />
      );
    });
  };

  // Function to render the drop indicator
  const renderDropIndicator = () => {
    if (!dropIndicator || !isOver) return null;

    const { qubit, position } = dropIndicator;
    const left = 80 + position * 60;
    const top = qubit * 60;

    return (
      <div
        className="absolute w-10 h-10 border-2 border-green-500 rounded-md bg-green-900 opacity-50"
        style={{
          left: `${left}px`,
          top: `${top + 10}px`,
        }}
      />
    );
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md border border-green-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-green-400">Circuit Editor</h2>
        <div className="space-x-2">
          <button
            className="bg-blue-900 hover:bg-blue-800 text-green-400 px-2 py-1 rounded text-xs border border-green-700"
            onClick={addQubit}
          >
            Add Qubit
          </button>
          <button
            className="bg-red-900 hover:bg-red-800 text-green-400 px-2 py-1 rounded text-xs border border-green-700"
            onClick={removeQubit}
          >
            Remove Qubit
          </button>
        </div>
      </div>

      <div
        ref={(el) => {
          // Store a reference to the element
          circuitRef.current = el;
          // Apply the drop ref
          drop(el);
        }}
        className={`flex-grow border-2 ${
          isOver ? "border-green-500 bg-gray-900" : "border-green-800"
        } rounded-lg p-2 min-h-[200px] transition-colors duration-200 relative overflow-auto`}
        onMouseLeave={() => setDropIndicator(null)}
      >
        {/* Connection lines for multi-qubit gates */}
        {renderConnectionLines()}

        {/* Drop indicator */}
        {renderDropIndicator()}

        {Array.from({ length: circuit.numQubits }).map((_, qubitIndex) => (
          <div
            key={qubitIndex}
            ref={setQubitRef(qubitIndex)}
            className="flex items-center h-[60px] border-b border-green-800 relative"
          >
            <div className="w-[80px] font-mono text-green-400">
              |0⟩ q{qubitIndex}
            </div>
            <div className="flex-1 h-[2px] bg-green-800"></div>

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
                      className="absolute w-3 h-3 bg-green-500 rounded-full z-10"
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
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
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
