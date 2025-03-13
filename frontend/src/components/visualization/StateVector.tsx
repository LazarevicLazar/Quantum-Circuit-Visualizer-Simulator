import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Complex } from "../../types/quantum";

interface StateVectorProps {
  statevector: Complex[];
}

const StateVector: React.FC<StateVectorProps> = ({ statevector }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !statevector.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(statevector.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScaleReal = d3.scaleLinear().domain([-1, 1]).range([innerHeight, 0]);

    // Create chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add background
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "#111111");

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#004400");

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScaleReal)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#004400");

    // Create axes
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
      const i = parseInt(d.toString());
      // Only show a few labels to avoid overcrowding
      if (
        statevector.length <= 8 ||
        i % Math.ceil(statevector.length / 8) === 0
      ) {
        return i.toString();
      }
      return "";
    });

    const yAxis = d3.axisLeft(yScaleReal).ticks(5);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr("color", "#00ff00")
      .selectAll("text")
      .attr("fill", "#00ff00")
      .style("font-family", "monospace")
      .style("font-size", "8px");

    g.append("g")
      .call(yAxis)
      .attr("color", "#00ff00")
      .selectAll("text")
      .attr("fill", "#00ff00")
      .style("font-family", "monospace")
      .style("font-size", "8px");

    // Calculate magnitude and phase for each amplitude
    const amplitudeData = statevector.map((complex, i) => {
      const magnitude = Math.sqrt(
        complex.real * complex.real + complex.imag * complex.imag
      );
      const phase = Math.atan2(complex.imag, complex.real);
      return { index: i, magnitude, phase };
    });

    // Add magnitude bars with phase-based coloring
    g.selectAll(".bar-magnitude")
      .data(amplitudeData)
      .enter()
      .append("rect")
      .attr("class", "bar-magnitude")
      .attr("x", (d) => xScale(d.index.toString()) || 0)
      .attr("y", (d) => yScaleReal(d.magnitude))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => Math.abs(yScaleReal(d.magnitude) - yScaleReal(0)))
      .attr("fill", (d) => {
        // Color based on phase (hue rotation)
        const hue = ((d.phase + Math.PI) / (2 * Math.PI)) * 120; // Map phase to green spectrum (120° is green in HSL)
        return `hsl(${hue}, 100%, 50%)`;
      })
      .attr("stroke", "#00ff00")
      .attr("stroke-width", 1);

    // Add phase indicators
    g.selectAll(".phase-indicator")
      .data(amplitudeData)
      .enter()
      .append("line")
      .attr("class", "phase-indicator")
      .attr(
        "x1",
        (d) => (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2
      )
      .attr("y1", (d) => yScaleReal(0))
      .attr("x2", (d) => {
        const centerX =
          (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2;
        const length = (Math.min(d.magnitude, 0.5) * xScale.bandwidth()) / 2;
        return centerX + length * Math.cos(d.phase);
      })
      .attr("y2", (d) => {
        const length = (Math.min(d.magnitude, 0.5) * xScale.bandwidth()) / 2;
        return yScaleReal(0) - length * Math.sin(d.phase);
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    // Add basis state labels
    g.selectAll(".basis-label")
      .data(amplitudeData)
      .enter()
      .append("text")
      .attr("class", "basis-label")
      .attr(
        "x",
        (d) => (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2
      )
      .attr("y", innerHeight + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#00ff00")
      .style("font-family", "monospace")
      .style("font-size", "8px")
      .text((d) => {
        // Only show a few labels to avoid overcrowding
        if (
          statevector.length <= 8 ||
          d.index % Math.ceil(statevector.length / 8) === 0
        ) {
          // Convert index to binary representation
          const binaryString = d.index
            .toString(2)
            .padStart(Math.log2(statevector.length), "0");
          return `|${binaryString}⟩`;
        }
        return "";
      });
  }, [statevector]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      style={{ minHeight: "100%" }}
    />
  );
};

export default StateVector;
