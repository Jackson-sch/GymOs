"use client";

import React from "react";
import { pie, arc } from "d3";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataItem {
  label: string;
  value: number;
  color: string;
}

const defaultData: DataItem[] = [
  { label: "Premium", value: 45, color: "oklch(70% 0.15 280)" },
  { label: "Estándar", value: 30, color: "oklch(60% 0.12 250)" },
  { label: "Básico", value: 25, color: "oklch(50% 0.1 220)" },
];

export function RadialDonutChart({ data = defaultData }: { data?: DataItem[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  const size = 300; // Increased base size for better scaling
  const thickness = isMobile ? 25 : 35;
  const radius = size / 2;
  
  const pieGenerator = pie<DataItem>()
    .value((d) => d.value)
    .padAngle(0.06);

  const arcGenerator = arc<any>()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .cornerRadius(isMobile ? 12 : 16);

  const arcs = pieGenerator(data);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="@container flex flex-col items-center justify-center gap-4 p-2 w-full h-full my-auto min-h-[240px]">
      <div className="flex flex-col @[360px]:flex-row items-center justify-center gap-5 @[360px]:gap-7 w-full max-w-full mx-auto my-auto">
        <div className="relative w-36 sm:w-44 max-w-[180px] aspect-square flex items-center justify-center shrink-0">
          {/* Enhanced Radial Glow - Fades out naturally */}
          <div 
            className="absolute inset-0 rounded-full scale-125 opacity-40 blur-[100px]" 
            /* style={{ 
              background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)` 
            }}  */
          />
          
          <svg 
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full relative select-none"
            preserveAspectRatio="xMidYMid meet"
          >
          <defs>
            {data.map((item, i) => (
              <linearGradient key={`grad-${i}`} id={`donut-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.color} stopOpacity="1" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0.5" />
              </linearGradient>
            ))}
            <radialGradient id="inner-glow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          <g transform={`translate(${radius}, ${radius})`}>
            {/* Background Track for better depth */}
            <circle r={radius - thickness / 2} fill="none" stroke="white" strokeOpacity="0.03" strokeWidth={thickness} />
            
            {arcs.map((d, i) => (
              <Tooltip key={(d.data as any)?.label || (d.data as any)?.name || (d.data as any)?.id || `arc-${(d.data as any)?.label}`} delayDuration={0}>
                <TooltipTrigger asChild>
                  <path
                    d={arcGenerator(d)!}
                    fill={`url(#donut-grad-${i})`}
                    className="opacity-90 hover:opacity-100 transition-opacity transition-transform duration-500 hover:scale-[1.03] cursor-pointer drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-secondary/90 backdrop-blur-md border-white/10 text-foreground font-medium">
                  {data[i].label}: {data[i].value} ({total > 0 ? Math.round((data[i].value / total) * 100) : 0}%)
                </TooltipContent>
              </Tooltip>
            ))}
            
            {/* Inner background decoration */}
            <circle r={radius - thickness - 5} fill="url(#inner-glow)" />
            <circle r={radius - thickness - 15} fill="white" fillOpacity="0.01" />
            
            <text
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-foreground text-3xl sm:text-5xl font-serif tracking-tighter"
            >
              {total}
            </text>
            <text
              y={32}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-muted-foreground text-[9px] uppercase tracking-[0.5em] font-bold"
            >
              Total
            </text>
          </g>
        </svg>
        </div>
        
        <div className="grid grid-cols-3 @[360px]:grid-cols-1 gap-3 @[360px]:gap-4 w-full @[360px]:w-auto">
          {data.map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.label || i} className="flex flex-col gap-1 group min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-6 rounded-full transition-colors duration-500 group-hover:h-7 shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] @[360px]:text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">
                      {item.label}
                    </p>
                    <p className="text-sm @[360px]:text-lg font-sans font-semibold tabular-nums text-foreground">
                      {item.value}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({pct}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
