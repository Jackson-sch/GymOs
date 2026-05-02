"use client";

import React from "react";
import { scaleBand, scaleLinear, max } from "d3";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataItem {
  key: string;
  value: number;
}

const defaultData: DataItem[] = [
  { key: "Membresías", value: 65 },
  { key: "Entrenamientos", value: 45 },
  { key: "Clases Grupales", value: 30 },
  { key: "Cafetería", value: 20 },
  { key: "Suplementos", value: 15 },
].toSorted((a, b) => b.value - a.value);

export function RosenChart({ data = defaultData }: { data?: DataItem[] }) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  const width = 600;
  const height = 300;
  const margin = { 
    top: 20, 
    right: 40, 
    bottom: 20, 
    left: isMobile ? 80 : 120 
  };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, innerHeight])
    .padding(0.4);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, innerWidth]);

  return (
    <div className="relative w-full aspect-video md:aspect-2/1 min-h-[250px] md:min-h-[300px]">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid Lines */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xScale.ticks(5).map((t, i) => (
            <line
              key={i}
              x1={xScale(t)}
              x2={xScale(t)}
              y1="0"
              y2={innerHeight}
              stroke="white"
              strokeOpacity="0.05"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => (
            <TooltipProvider key={i}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <g className="cursor-pointer group">
                    <rect
                      x="0"
                      y={yScale(d.key)}
                      width={xScale(d.value)}
                      height={yScale.bandwidth()}
                      fill="var(--color-primary)"
                      fillOpacity="0.1"
                      rx="4"
                      className="blur-sm group-hover:fill-opacity-20 transition-all"
                    />
                    <rect
                      x="0"
                      y={yScale(d.key)}
                      width={xScale(d.value)}
                      height={yScale.bandwidth()}
                      fill="url(#rosen-gradient)"
                      rx="4"
                      className="group-hover:brightness-125 transition-all"
                    />
                    <line
                      x1={xScale(d.value)}
                      x2={xScale(d.value)}
                      y1={yScale(d.key)}
                      y2={yScale(d.key)! + yScale.bandwidth()}
                      stroke="white"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent className="bg-secondary/90 backdrop-blur-md border-white/10 text-foreground font-medium">
                  {d.key}: S/. {d.value.toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </g>

        {/* Labels */}
        <g transform={`translate(${margin.left - 10}, ${margin.top})`}>
          {data.map((d, i) => (
            <text
              key={i}
              x="0"
              y={yScale(d.key)! + yScale.bandwidth() / 2}
              textAnchor="end"
              alignmentBaseline="middle"
              className={cn(
                "fill-muted-foreground uppercase tracking-widest font-sans font-medium",
                isMobile ? "text-[12px]" : "text-[10px]"
              )}
            >
              {isMobile ? d.key.substring(0, 8) + ".." : d.key}
            </text>
          ))}
        </g>

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="rosen-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(70% 0.15 280 / 0.8)" />
            <stop offset="100%" stopColor="oklch(70% 0.15 280 / 0.4)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
