import React from "react";
import { cn } from "../lib/utils";
import { AgentIcon } from "./AgentIconPicker";
import type { Agent } from "@paperclipai/shared";

interface IsometricAgentRoomProps {
  agent: Agent;
  x: number; // grid position
  y: number; // grid position
  isLive?: boolean;
  onClick?: () => void;
}

export function IsometricAgentRoom({ agent, x, y, isLive, onClick }: IsometricAgentRoomProps) {
  // Map grid coordinates to px
  const spacing = 120;
  const isCEO = agent.role?.toLowerCase() === "ceo" || agent.name?.toLowerCase().includes("ceo");
  
  return (
    <div 
      className="absolute w-[100px] h-[100px] cursor-pointer group"
      style={{ 
        transform: `translate3d(${x * spacing}px, ${y * spacing}px, 0)`,
        transformStyle: 'preserve-3d'
      }}
      onClick={onClick}
    >
      {/* Shadow */}
      <div className="absolute inset-2 bg-black/40 blur-md pointer-events-none" style={{ transform: 'translateZ(-1px)' }} />

      {/* Floor */}
      <div className={cn(
        "absolute inset-0 border-2 transition-all duration-300",
        isCEO ? "border-amber-500/50 bg-amber-500/5" : "border-primary/30 bg-card/60",
        "group-hover:border-primary group-hover:bg-primary/5",
        isLive && (isCEO ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-amber-500/10" : "border-primary shadow-[0_0_20px_var(--primary)] bg-primary/10")
      )}>
        {/* Floor Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', 
            backgroundSize: '10px 10px' 
        }} />
      </div>
      
      {/* Walls (Pseudo-isometric) */}
      <div className="absolute top-0 left-0 w-full h-[40px] bg-primary/5 border-l border-r border-primary/20 origin-top" 
           style={{ transform: 'rotateX(-90deg) translateY(-40px)' }} />
      <div className="absolute top-0 left-0 w-[40px] h-full bg-primary/5 border-t border-b border-primary/20 origin-left" 
           style={{ transform: 'rotateY(90deg) translateX(-40px)' }} />

      {/* Desk Accessories (Vertical Planes) */}
      <div className="absolute bottom-2 right-2 w-8 h-8 bg-zinc-900 border border-primary/40 flex items-center justify-center"
           style={{ transform: 'rotateX(-90deg) rotateY(-45deg)', transformStyle: 'preserve-3d' }}>
          {/* Monitor Screen */}
          <div className="w-6 h-4 bg-black border border-primary/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/20 animate-pulse" />
             <div className="absolute top-1 left-1 w-2 h-0.5 bg-primary/40" />
             <div className="absolute top-2 left-1 w-4 h-0.5 bg-primary/40" />
          </div>
      </div>

      {/* Blinking Status LED on Floor */}
      <div className={cn(
        "absolute top-2 right-2 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_var(--primary)]",
        isLive ? "bg-primary animate-ping" : "bg-primary/20"
      )} />

      {/* Agent Avatar (Vertical Plane) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 origin-bottom transition-all duration-300 group-hover:-translate-y-2"
           style={{ transform: 'rotateX(-90deg) rotateY(-45deg)', transformStyle: 'preserve-3d' }}>
        <div className="relative">
             <div className={cn(
               "h-12 w-12 flex items-center justify-center bg-background border-2 border-primary/40 p-2 shadow-lg",
               isLive && "animate-bounce border-primary"
             )}>
                <AgentIcon icon={agent.icon} name={agent.name} className="h-full w-full text-primary" />
             </div>
             
             {/* Name Tag */}
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-0.5 border border-primary/40 whitespace-nowrap shadow-xl">
                <span className="text-[8px] font-bold text-primary uppercase tracking-tight">{agent.name}</span>
             </div>

             {/* Live Pulse */}
             {isLive && (
               <div className="absolute -right-2 -top-2 flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </div>
             )}
        </div>
      </div>

      {/* Role Label (Floor text) */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary/40 uppercase tracking-tighter whitespace-nowrap">
        {agent.role || "operative"}
      </div>
    </div>
  );
}
