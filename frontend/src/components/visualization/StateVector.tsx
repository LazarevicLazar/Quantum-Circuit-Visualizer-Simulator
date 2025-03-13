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
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(statevector.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScaleReal = d3.scaleLinear().domain([-1, 1]).range([innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScaleReal);

    // Create chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Basis State");

    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Amplitude");

    // Add real part bars
    g.selectAll(".bar-real")
      .data(statevector)
      .enter()
      .append("rect")
      .attr("class", "bar-real")
      .attr("x", (_, i) => xScale(i.toString()) || 0)
      .attr("y", (d) => yScaleReal(Math.max(0, d.real)))
      .attr("width", xScale.bandwidth() / 2)
      .attr("height", (d) => Math.abs(yScaleReal(d.real) - yScaleReal(0)))
      .attr("fill", "steelblue");

    // Add imaginary part bars
    g.selectAll(".bar-imag")
      .data(statevector)
      .enter()
      .append("rect")
      .attr("class", "bar-imag")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScaleReal(Math.max(0, d.imag)))
      .attr("width", xScale.bandwidth() / 2)
      .attr("height", (d) => Math.abs(yScaleReal(d.imag) - yScaleReal(0)))
      .attr("fill", "tomato");

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 100}, ${margin.top})`
      );

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "steelblue");

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12.5)
      .text("Real")
      .style("font-size", "12px");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "tomato");

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 32.5)
      .text("Imaginary")
      .style("font-size", "12px");

    // Add basis state labels
    g.selectAll(".basis-label")
      .data(statevector)
      .enter()
      .append("text")
      .attr("class", "basis-label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text((_, i) => {
        // Convert index to binary representation
        const binaryString = i
          .toString(2)
          .padStart(Math.log2(statevector.length), "0");
        return `|${binaryString}⟩`;
      });
  }, [statevector]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "200px" }}
    />
  );
};

export default StateVector;
