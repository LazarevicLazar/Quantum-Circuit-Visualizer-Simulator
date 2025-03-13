import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ProbabilityChartProps {
  probabilities: number[];
}

const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !probabilities.length) return;

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
      .domain(probabilities.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%"));

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
      .text("Probability");

    // Add bars
    g.selectAll(".bar")
      .data(probabilities)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => xScale(i.toString()) || 0)
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d))
      .attr("fill", (d) => {
        // Color gradient based on probability
        const hue = 240 - d * 240; // Blue (240) to Red (0)
        return `hsl(${hue}, 70%, 60%)`;
      });

    // Add probability labels
    g.selectAll(".probability-label")
      .data(probabilities)
      .enter()
      .append("text")
      .attr("class", "probability-label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text((d) => (d > 0.05 ? `${(d * 100).toFixed(1)}%` : ""));

    // Add basis state labels
    g.selectAll(".basis-label")
      .data(probabilities)
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
          .padStart(Math.log2(probabilities.length), "0");
        return `|${binaryString}⟩`;
      });

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Measurement Probabilities");
  }, [probabilities]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "200px" }}
    />
  );
};

export default ProbabilityChart;
