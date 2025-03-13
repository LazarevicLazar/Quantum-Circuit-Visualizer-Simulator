import React, { useState, useEffect } from "react";
import { QuantumState } from "../../types/quantum";

interface SampleDisplayProps {
  state: QuantumState;
  numQubits: number;
}

const SampleDisplay: React.FC<SampleDisplayProps> = ({ state, numQubits }) => {
  const [samples, setSamples] = useState<number[]>([]);
  const [numSamples, setNumSamples] = useState<number>(5);

  // Generate samples based on the probability distribution
  useEffect(() => {
    if (!state || !state.probabilities || state.probabilities.length === 0)
      return;

    const generateSamples = () => {
      const newSamples: number[] = [];

      for (let i = 0; i < numSamples; i++) {
        // Generate a random number between 0 and 1
        const rand = Math.random();

        // Find the corresponding state based on cumulative probability
        let cumulativeProb = 0;
        let selectedState = 0;

        for (let j = 0; j < state.probabilities.length; j++) {
          cumulativeProb += state.probabilities[j];
          if (rand < cumulativeProb) {
            selectedState = j;
            break;
          }
        }

        newSamples.push(selectedState);
      }

      setSamples(newSamples);
    };

    generateSamples();
  }, [state, numSamples]);

  // Handle number of samples change
  const handleNumSamplesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setNumSamples(value);
    }
  };

  // Generate new samples
  const handleGenerateNewSamples = () => {
    // This will trigger the useEffect
    setSamples([]);
  };

  // Count occurrences of each state
  const getStateCounts = () => {
    const counts: Record<number, number> = {};
    samples.forEach((sample) => {
      counts[sample] = (counts[sample] || 0) + 1;
    });
    return counts;
  };

  const stateCounts = getStateCounts();

  return (
    <div className="bg-gray-900 p-1 h-full flex flex-col text-green-400 font-mono text-xs">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <label htmlFor="numSamples" className="mr-1 text-green-500">
            Samples:
          </label>
          <input
            id="numSamples"
            type="number"
            min="1"
            max="20"
            value={numSamples}
            onChange={handleNumSamplesChange}
            className="w-8 bg-gray-800 border border-green-700 rounded px-1 text-green-400 text-center"
          />
        </div>
        <button
          onClick={handleGenerateNewSamples}
          className="bg-green-900 hover:bg-green-800 text-green-400 px-1 py-0.5 rounded text-xs border border-green-700"
        >
          Resample
        </button>
      </div>

      <div className="flex-grow overflow-auto border border-green-900 p-1 bg-black">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {Object.entries(stateCounts).map(([state, count]) => {
            const stateNum = parseInt(state);
            const percentage = (count / samples.length) * 100;
            const binary = stateNum.toString(2).padStart(numQubits, "0");

            return (
              <div key={state} className="flex items-center">
                <div className="w-12 mr-1 text-green-500">|{binary}⟩:</div>
                <div className="flex-1 h-4 bg-gray-800 rounded-sm overflow-hidden border border-green-900">
                  <div
                    className="h-full bg-green-700"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="ml-1 w-8 text-right text-green-400">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1 border border-green-900 bg-black overflow-auto h-12">
        <div className="grid grid-cols-5 gap-x-1 p-1">
          {samples.map((sample, index) => {
            const binary = sample.toString(2).padStart(numQubits, "0");
            return (
              <div key={index} className="text-center">
                <span className="text-green-600 text-[8px]">{index + 1}</span>
                <div className="text-green-400 bg-gray-800 border border-green-900 rounded-sm px-0.5">
                  {binary}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1 text-[8px] text-green-600 text-center">
        Random samples based on quantum probabilities
      </div>
    </div>
  );
};

export default SampleDisplay;
