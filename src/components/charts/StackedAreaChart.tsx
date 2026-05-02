"use client";

import React from "react";
import { scaleLinear, scalePoint, stack, area, curveBasis, max } from "d3";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

interface DataPoint {
  day: string;
  musculacion: number;
  cardio: number;
  clases: number;
}

const data: DataPoint[] = [
  { day: "Lun", musculacion: 120, cardio: 80, clases: 60 },
  { day: "Mar", musculacion: 100, cardio: 70, clases: 80 },
  { day: "Mie", musculacion: 110, cardio: 90, clases: 50 },
  { day: "Jue", musculacion: 90, cardio: 60, clases: 100 },
  { day: "Vie", musculacion: 130, cardio: 85, clases: 70 },
  { day: "Sab", musculacion: 70, cardio: 40, clases: 30 },
  { day: "Dom", musculacion: 40, cardio: 20, clases: 10 },
];

export function StackedAreaChart({ data }: { data?: { name: string, value: number }[] }) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!data) return <div className="h-[200px] flex items-center justify-center animate-pulse bg-white/5 rounded-lg" />;

  const width = 600;
  const height = 300;
  const margin = { 
    top: 20, 
    right: 20, 
    bottom: isMobile ? 30 : 40, 
    left: isMobile ? 30 : 40 
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scalePoint()
    .domain(data.map(d => d.name))
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain([0, max(data, (d) => d.value) || 10])
    .range([innerHeight, 0]);

  const areaGenerator = area<{ name: string, value: number }>()
    .x((d) => xScale(d.name)!)
    .y0(innerHeight)
    .y1((d) => yScale(d.value))
    .curve(curveBasis);

  return (
    <div className="w-full aspect-video md:aspect-2/1 min-h-[250px] md:min-h-[300px] relative">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {yScale.ticks(5).map((t) => (
            <g key={t} transform={`translate(0, ${yScale(t)})`}>
              <line x2={innerWidth} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
              <text x="-10" dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px]">
                {t}
              </text>
            </g>
          ))}

          {/* X-Axis labels */}
          {data.map((d) => (
            <text
              key={d.name}
              x={xScale(d.name)}
              y={innerHeight + 25}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              {d.name}
            </text>
          ))}

          {/* Area layer */}
          <path
            d={areaGenerator(data)!}
            fill="url(#area-gradient)"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeOpacity="0.8"
            className="transition-all duration-500 hover:fill-opacity-100"
          />

          {/* Interactive Points */}
          <TooltipProvider>
            {data.map((d, i) => (
              <Tooltip key={i} delayDuration={0}>
                <TooltipTrigger asChild>
                  <circle
                    cx={xScale(d.name)}
                    cy={yScale(d.value)}
                    r="4"
                    fill="var(--color-accent)"
                    className="stroke-background stroke-2 cursor-pointer hover:r-6 transition-all"
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-secondary/90 backdrop-blur-md border-white/10 text-foreground font-medium">
                  {d.name}: {d.value} Asistencias
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </g>
      </svg>
    </div>
  );
}
