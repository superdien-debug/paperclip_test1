import React from "react";
import { cn } from "../lib/utils";

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface IsometricConnectionBeamsProps {
  connections: Connection[];
  spacing?: number;
}

export function IsometricConnectionBeams({ connections, spacing = 120 }: IsometricConnectionBeamsProps) {
  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {connections.map((conn, i) => {
        const x1 = conn.from.x * spacing + 50; // Center of 100x100 room
        const y1 = conn.from.y * spacing + 50;
        const x2 = conn.to.x * spacing + 50;
        const y2 = conn.to.y * spacing + 50;

        return (
          <g key={i}>
            {/* The Beam Line */}
            <path
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="10,10"
              className="opacity-20 translate-z-[-1px]"
              style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }}
            >
              <animate 
                attributeName="stroke-dashoffset" 
                from="100" 
                to="0" 
                dur="5s" 
                repeatCount="indefinite" 
              />
            </path>
            
            {/* Pulsing Data Node */}
            <circle cx={x1} cy={y1} r="3" fill="var(--primary)" className="animate-ping opacity-40" />
          </g>
        );
      })}
    </svg>
  );
}
