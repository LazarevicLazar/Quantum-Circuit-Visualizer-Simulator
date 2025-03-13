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
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(probabilities.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

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
          .axisLeft(yScale)
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
        probabilities.length <= 8 ||
        i % Math.ceil(probabilities.length / 8) === 0
      ) {
        return i.toString();
      }
      return "";
    });

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%"));

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

    // Add bars with retro terminal look
    g.selectAll(".bar")
      .data(probabilities)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => xScale(i.toString()) || 0)
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d))
      .attr("fill", "#00ff00")
      .attr("opacity", 0.7)
      .attr("stroke", "#00ff00")
      .attr("stroke-width", 1);

    // Add probability labels
    g.selectAll(".probability-label")
      .data(probabilities)
      .enter()
      .append("text")
      .attr("class", "probability-label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d) - 5)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "8px")
      .attr("fill", "#00ff00")
      .text((d) => (d > 0.05 ? `${(d * 100).toFixed(0)}%` : ""));

    // Add basis state labels
    g.selectAll(".basis-label")
      .data(probabilities)
      .enter()
      .append("text")
      .attr("class", "basis-label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 15)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "8px")
      .attr("fill", "#00ff00")
      .text((_, i) => {
        // Only show a few labels to avoid overcrowding
        if (
          probabilities.length <= 8 ||
          i % Math.ceil(probabilities.length / 8) === 0
        ) {
          // Convert index to binary representation
          const binaryString = i
            .toString(2)
            .padStart(Math.log2(probabilities.length), "0");
          return `|${binaryString}⟩`;
        }
        return "";
      });

    // Add scan line animation for retro effect
    const scanLine = g
      .append("rect")
      .attr("class", "scan-line")
      .attr("x", 0)
      .attr("width", innerWidth)
      .attr("height", 2)
      .attr("fill", "#00ff00")
      .attr("opacity", 0.3);

    // Animate the scan line
    function animateScanLine() {
      scanLine
        .attr("y", innerHeight)
        .transition()
        .duration(2000)
        .attr("y", 0)
        .transition()
        .duration(2000)
        .attr("y", innerHeight)
        .on("end", animateScanLine);
    }

    animateScanLine();
  }, [probabilities]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      style={{ minHeight: "100%" }}
    />
  );
};

export default ProbabilityChart;
