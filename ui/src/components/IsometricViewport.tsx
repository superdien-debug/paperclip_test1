import React, { ReactNode } from "react";
import { cn } from "../lib/utils";

interface IsometricViewportProps {
  children: ReactNode;
  className?: string;
}

export function IsometricViewport({ children, className }: IsometricViewportProps) {
  return (
    <div className={cn("relative w-full h-[500px] overflow-hidden bg-background/50 rounded-lg border border-border shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]", className)}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Isometric Transformer */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%]" 
           style={{ 
             transform: 'rotateX(55deg) rotateZ(45deg)', 
             transformStyle: 'preserve-3d',
             perspective: '1000px'
           }}>
        {children}
      </div>

      {/* Viewport UI Overlays */}
      <div className="absolute top-4 left-4 text-[10px] font-bold text-primary/60 uppercase tracking-widest">
        <span className="animate-pulse mr-2">●</span>Sector-01 // Command Center
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-4 text-[10px] font-bold text-primary/40 uppercase tracking-tight">
        <div>Zoom: 1.0x</div>
        <div>Cam: Fixed</div>
        <div>Halt: <span className="text-secondary">False</span></div>
      </div>
    </div>
  );
}
