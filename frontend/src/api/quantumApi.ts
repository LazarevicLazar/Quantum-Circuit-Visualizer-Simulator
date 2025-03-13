import axios from "axios";
import { Circuit, Gate, GateType, SimulationResult } from "../types/quantum";

const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiGate {
  type: string;
  name: string;
  description: string;
}

export const fetchAvailableGates = async (): Promise<ApiGate[]> => {
  try {
    const response = await api.get("/gates");
    return response.data.gates;
  } catch (error) {
    console.error("Error fetching gates:", error);
    throw error;
  }
};

export const simulateCircuit = async (
  circuit: Circuit
): Promise<SimulationResult> => {
  try {
    const payload = {
      gates: circuit.gates.map((gate) => ({
        id: gate.id,
        type: gate.type,
        targets: gate.targets,
        controls: gate.controls,
        position: gate.position,
        params: gate.params,
      })),
      num_qubits: circuit.numQubits,
    };

    const response = await api.post("/simulate", payload);
    const data = response.data;

    // Convert the API response to our frontend types
    return {
      initialState: {
        statevector: data.initial_state.statevector.map((c: any) => ({
          real: c.real,
          imag: c.imag,
        })),
        probabilities: data.initial_state.probabilities,
      },
      finalState: {
        statevector: data.final_state.statevector.map((c: any) => ({
          real: c.real,
          imag: c.imag,
        })),
        probabilities: data.final_state.probabilities,
      },
      intermediateStates: data.intermediate_states?.map((state: any) => ({
        statevector: state.statevector.map((c: any) => ({
          real: c.real,
          imag: c.imag,
        })),
        probabilities: state.probabilities,
      })),
      measurements: data.measurements,
    };
  } catch (error) {
    console.error("Error simulating circuit:", error);
    throw error;
  }
};

export const exportToQASM = async (circuit: Circuit): Promise<string> => {
  try {
    const payload = {
      gates: circuit.gates.map((gate) => ({
        id: gate.id,
        type: gate.type,
        targets: gate.targets,
        controls: gate.controls,
        position: gate.position,
        params: gate.params,
      })),
      num_qubits: circuit.numQubits,
    };

    const response = await api.post("/export/qasm", payload);
    return response.data.qasm;
  } catch (error) {
    console.error("Error exporting to QASM:", error);
    throw error;
  }
};

export const importFromQASM = async (qasm: string): Promise<Circuit> => {
  try {
    const response = await api.post("/import/qasm", { qasm });
    const data = response.data;

    // Convert the API response to our frontend types
    return {
      gates: data.gates.map((gate: any) => ({
        id: gate.id,
        type: gate.type as GateType,
        targets: gate.targets,
        controls: gate.controls,
        position: gate.position,
        params: gate.params,
      })),
      numQubits: data.num_qubits,
    };
  } catch (error) {
    console.error("Error importing from QASM:", error);
    throw error;
  }
};
