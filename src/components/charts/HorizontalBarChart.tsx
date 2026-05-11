"use client";
import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max } from "d3";

interface DataItem {
  key: string;
  value: number;
  color: string;
}

const defaultData: DataItem[] = [
  { key: "Technology", value: 38.1, color: "#F5A5DB" },
  { key: "Financials", value: 25.3, color: "#B89DFB" },
  { key: "Energy", value: 23.1, color: "#758bcf" },
  { key: "Cyclical", value: 19.5, color: "#33C2EA" },
  { key: "Defensive", value: 14.7, color: "#FFC182" },
  { key: "Utilities", value: 5.8, color: "#87db72" },
].toSorted((a, b) => b.value - a.value);

export function HorizontalBarChart({
  data = defaultData,
  singleColor,
}: {
  data?: DataItem[];
  singleColor?: string;
}) {
  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  const radius = 2; // Adjust the radius for the rounded corners

  // Function to create a path for each bar with rounded right corners
  const roundedBarPath = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    return `M${x},${y}
            h${width - radius}
            a${radius},${radius} 0 0 1 ${radius},${radius}
            v${height - 2 * radius}
            a${radius},${radius} 0 0 1 -${radius},${radius}
            h${-width + radius}
            Z`;
  };

  const roundedInnerBarPath = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    strokeWidth: number,
  ) => {
    // Adjusted dimensions for inner stroke
    const innerWidth = width - strokeWidth;
    const innerHeight = height - strokeWidth;
    const innerX = x + strokeWidth / 2;
    const innerY = y + strokeWidth / 2;
    const innerRadius = radius - strokeWidth / 2;

    return `M ${innerX}, ${innerY}
            h ${innerWidth - innerRadius}
            a ${innerRadius},${innerRadius} 0 0 1 ${innerRadius},${innerRadius}
            v ${innerHeight - 2 * innerRadius}
            a ${innerRadius},${innerRadius} 0 0 1 -${innerRadius},${innerRadius}
            h ${-innerWidth + innerRadius}
            `;
  };

  const longestWord = max(data.map((d) => d.key.length)) || 1;

  return (
    <div
      className="relative w-full h-72"
      style={
        {
          "--marginTop": "20px",
          "--marginRight": "8px",
          "--marginBottom": "25px",
          "--marginLeft": `${longestWord > 16 ? 112 : Math.max(longestWord * 8, 70)}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <svg
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-(--marginLeft)
          translate-y-(--marginTop)
          overflow-visible
        "
      >
        <svg
          className="absolute overflow-hidden inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {xScale
            .ticks(8)
            .map(xScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(${xScale(+active)},0)`}
                className="text-gray-300/80 dark:text-gray-800/80"
                key={i}
              >
                <line
                  y1={0}
                  y2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

          {/* Bars with Rounded Right Corners */}
          {data.map((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const innerStrokeWidth = 0.25; // Adjust as needed

            const barPath = roundedBarPath(
              0,
              yScale(d.key)!,
              barWidth,
              barHeight,
              radius,
            );

            const innerBarPath = roundedInnerBarPath(
              0,
              yScale(d.key)!,
              barWidth,
              barHeight,
              radius,
              innerStrokeWidth,
            );
            return (
              <g key={index}>
                {/* Main Bar */}
                <path
                  d={barPath}
                  fill={`url(#bar0-gradient-line${index})`}
                  vectorEffect="non-scaling-stroke"
                />

                {/* Define the gradient */}
                <defs>
                  <linearGradient
                    id={`bar0-gradient-line${index}`}
                    x1="1"
                    x2="1"
                    y1="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={d.color} />
                    <stop offset="30%" stopColor={singleColor ?? d.color} />
                  </linearGradient>
                  <linearGradient
                    id={`overlay-gradient${index}`}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="10%" stopColor="rgba(255, 255, 255, 0.45)" />
                    <stop offset="80%" stopColor="rgba(255, 255, 255, 0.1)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                  </linearGradient>
                </defs>

                {/* Inner stroke path, positioned to align with the edge of the main bar */}
                <path
                  d={innerBarPath}
                  fill="none"
                  stroke="#ffffff33"
                  strokeWidth={innerStrokeWidth}
                />

                {/* Overlay gradient */}
                <path
                  d={barPath}
                  fill={`url(#overlay-gradient${index})`}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </svg>
      {/* Y Axis (Letters) */}
      <svg
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          translate-y-(--marginTop)
          overflow-visible"
      >
        <g style={{ transform: "translateX(calc(var(--marginLeft) - 8px))" }}>
          {data.map((entry, i) => (
            <text
              key={i}
              x="0"
              y={`${yScale(entry.key)! + yScale.bandwidth() / 2}%`}
              dy=".35em"
              textAnchor="end"
              fill="currentColor"
              className="text-xs text-zinc-400"
            >
              {entry.key.length > 16
                ? entry.key.slice(0, 15) + "..."
                : entry.key}
            </text>
          ))}
        </g>
      </svg>

      {/* X Axis (Values) */}
      <svg
        className="absolute inset-0
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-(--marginLeft)
          h-[calc(100%-var(--marginBottom))]
          translate-y-4
          overflow-visible
        "
      >
        <g className="overflow-visible">
          {xScale.ticks(4).map((value, i) => (
            <text
              key={i}
              x={`${xScale(value)}%`}
              y="100%"
              textAnchor="middle"
              fill="currentColor"
              className="text-xs tabular-nums text-gray-400"
            >
              {value}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
