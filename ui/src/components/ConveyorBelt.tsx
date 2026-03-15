import React from "react";
import { cn } from "../lib/utils";
import { StatusIcon } from "./StatusIcon";
import { PriorityIcon } from "./PriorityIcon";
import type { Issue } from "@paperclipai/shared";

interface ConveyorBeltProps {
  tasks: Issue[];
  className?: string;
}

export function ConveyorBelt({ tasks, className }: ConveyorBeltProps) {
  // We double the tasks to create a seamless loop effect if needed
  // But for now, we'll just animate a sliding window
  
  return (
    <div className={cn("relative w-full h-24 bg-background/40 rounded-lg border border-border overflow-hidden group", className)}>
      {/* Belt Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(90deg, var(--primary) 0, var(--primary) 2px, transparent 2px, transparent 40px)',
             animation: 'belt-slide 2s linear infinite'
           }} 
      />

      {/* Roller Decoration */}
      <div className="absolute bottom-1 inset-x-0 h-1 bg-primary/20" />

      {/* Task Crates Container */}
      <div className="absolute inset-0 flex items-center gap-8 px-4 animate-conveyor-slide">
        {[...tasks, ...tasks].map((task, idx) => (
          <div 
            key={`${task.id}-${idx}`} 
            className="shrink-0 w-16 h-16 bg-card border-2 border-primary/40 relative flex flex-col items-center justify-center shadow-lg hover:border-primary transition-colors cursor-pointer"
          >
            {/* Crate Straps */}
            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-primary/20" />
            <div className="absolute inset-y-0 right-1/4 w-0.5 bg-primary/20" />
            
            <div className="relative z-10 flex flex-col items-center gap-1">
              <PriorityIcon priority={task.priority} className="h-3 w-3" />
              <StatusIcon status={task.status} className="h-3 w-3" />
              <span className="text-[7px] font-bold text-primary/60 uppercase tracking-tighter">
                {task.identifier ?? task.id.slice(0, 4)}
              </span>
            </div>

            {/* Glowing tape for 'in_progress' tasks */}
            {task.status === "in_progress" && (
              <div className="absolute inset-0 border border-primary animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Scanner Overlay */}
      <div className="absolute right-12 inset-y-0 w-16 bg-primary/5 border-x border-primary/20 backdrop-blur-[1px] flex flex-col items-center justify-between py-2 z-20 pointer-events-none">
        <div className="w-full h-0.5 bg-primary animate-scanner-line shadow-[0_0_10px_var(--primary)]" />
        <div className="text-[7px] font-bold text-primary/40 uppercase tracking-widest">Scanning...</div>
      </div>

      {/* Label */}
      <div className="absolute top-1 left-2 text-[8px] font-bold text-primary/40 uppercase tracking-tight">
        Bot Factory // Task Queue
      </div>
    </div>
  );
}
