import React, { useEffect, useRef } from "react";
import { Complex } from "../../types/quantum";

interface DensityMatrixDisplayProps {
  matrix: Complex[][];
  qubits: number[];
}

const DensityMatrixDisplay: React.FC<DensityMatrixDisplayProps> = ({
  matrix,
  qubits,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !matrix || matrix.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = matrix.length;
    const cellSize = Math.min(20, canvas.width / (size + 2));
    const padding = cellSize * 2;

    // Clear canvas with dark background
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "#004400";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, padding + i * cellSize);
      ctx.lineTo(padding + size * cellSize, padding + i * cellSize);
      ctx.stroke();

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(padding + i * cellSize, padding);
      ctx.lineTo(padding + i * cellSize, padding + size * cellSize);
      ctx.stroke();
    }

    // Draw matrix
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const value = matrix[i][j];
        const magnitude = Math.sqrt(
          value.real * value.real + value.imag * value.imag
        );
        const phase = Math.atan2(value.imag, value.real);

        // Color based on magnitude (green intensity for retro look)
        const intensity = Math.floor(magnitude * 255);

        // Draw cell
        ctx.fillStyle = `rgb(0, ${intensity}, 0)`;
        ctx.fillRect(
          padding + j * cellSize,
          padding + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw phase indicator (small line inside the cell)
        if (magnitude > 0.05) {
          const centerX = padding + j * cellSize + cellSize / 2;
          const centerY = padding + i * cellSize + cellSize / 2;
          const lineLength = cellSize * 0.4 * magnitude;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + lineLength * Math.cos(phase),
            centerY + lineLength * Math.sin(phase)
          );
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw row and column labels
    ctx.fillStyle = "#00ff00";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";

    for (let i = 0; i < size; i++) {
      // Binary representation of the index
      const binaryIndex = i.toString(2).padStart(qubits.length, "0");

      // Row labels
      ctx.fillText(
        `|${binaryIndex}⟩`,
        padding / 2,
        padding + i * cellSize + cellSize / 2 + 3
      );

      // Column labels
      ctx.fillText(
        `⟨${binaryIndex}|`,
        padding + i * cellSize + cellSize / 2,
        padding / 2 + 3
      );
    }

    // Draw title
    ctx.fillStyle = "#00ff00";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `Density Matrix for Qubit${qubits.length > 1 ? "s" : ""} ${qubits.join(
        ", "
      )}`,
      canvas.width / 2,
      canvas.height - 5
    );

    // Add scan line effect for retro look
    let scanLinePos = 0;
    const scanLineHeight = 2;

    const animateScanLine = () => {
      // Clear previous scan line by redrawing that portion of the background
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, scanLinePos, canvas.width, scanLineHeight);

      // Update scan line position
      scanLinePos = (scanLinePos + 1) % canvas.height;

      // Draw new scan line
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(0, scanLinePos, canvas.width, scanLineHeight);

      // Request next frame
      requestAnimationFrame(animateScanLine);
    };

    // Start animation
    const animationId = requestAnimationFrame(animateScanLine);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [matrix, qubits]);

  return (
    <div className="bg-gray-900 p-1 h-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="max-w-full max-h-full"
      />
      <div className="absolute bottom-0 left-0 right-0 text-xs text-green-600 text-center opacity-70">
        <p>Diagonal: Probabilities, Off-diagonal: Coherence</p>
      </div>
    </div>
  );
};

export default DensityMatrixDisplay;
