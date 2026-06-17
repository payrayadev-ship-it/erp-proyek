/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, Clock, Play, AlertCircle } from "lucide-react";
import { ProjectStatus } from "../types";

interface ProjectTimelineProps {
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export default function ProjectTimeline({ status, startDate, endDate }: ProjectTimelineProps) {
  // Define milestones we want to track
  // 1. Planning, 2. Tender, 3. Execution, 4. BAST (Completed)
  const milestones = [
    {
      id: "Planning",
      label: "Planning",
      sublabel: "Perencanaan",
      desc: "Pradesain & Pagu",
    },
    {
      id: "Tender",
      label: "Tender",
      sublabel: "Pelelangan",
      desc: "Evaluasi Kontrak",
    },
    {
      id: "Execution",
      label: "Execution",
      sublabel: "Pelaksanaan",
      desc: "Fisik & Kurva S",
    },
    {
      id: "BAST",
      label: "BAST",
      sublabel: "Serah Terima",
      desc: "Pekerjaan Selesai",
    }
  ];

  // Helper to determine status order index
  const getStatusIndex = (currentStatus: ProjectStatus): number => {
    switch (currentStatus) {
      case "Planning":
        return 0;
      case "Tender":
        return 1;
      case "Running":
        return 2;
      case "Hold":
        return 2; // Keep in Execution phase but display hold
      case "Completed":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850/80 font-sans space-y-3.5 mt-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Milestone Proyek</span>
        {status === "Hold" && (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            TERTUNDA (HOLD)
          </span>
        )}
      </div>

      {/* Horizontal timeline representation */}
      <div className="relative flex justify-between items-start pt-2 px-1">
        
        {/* Background Connecting Line */}
        <div className="absolute top-[21px] left-8 right-8 h-1 bg-slate-800 rounded-full pointer-events-none z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-[21px] left-8 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 pointer-events-none z-0"
          style={{ 
            width: currentIndex === 0 
              ? "0%" 
              : currentIndex === 1 
                ? "33%" 
                : currentIndex === 2 
                  ? "66%" 
                  : "100%" 
          }}
        />

        {/* Milestone Steps */}
        {milestones.map((milestone, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isFuture = idx > currentIndex;

          // Milestone icon/color scheme
          let stepBg = "bg-slate-950 border-slate-800 text-slate-500";
          let textColor = "text-slate-500";
          let labelColor = "text-slate-400";

          if (isCompleted) {
            stepBg = "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20";
            textColor = "text-emerald-400 font-bold";
            labelColor = "text-slate-350";
          } else if (isActive) {
            if (status === "Hold") {
              stepBg = "bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/20";
              textColor = "text-rose-400 font-extrabold";
            } else {
              stepBg = "bg-blue-600 border-blue-400 text-white animate-pulse shadow-lg shadow-blue-500/20";
              textColor = "text-blue-400 font-extrabold";
            }
            labelColor = "text-white";
          }

          return (
            <div key={milestone.id} className="flex flex-col items-center text-center relative z-10 w-1/4">
              
              {/* Outer circle marker anchor */}
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${stepBg} transition-all duration-300 text-xs`}
                title={`${milestone.label} - ${milestone.sublabel}`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : isActive ? (
                  status === "Hold" ? (
                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  )
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Text labels layout */}
              <div className="mt-2.5">
                <span className={`block text-[10px] uppercase tracking-wider font-extrabold ${textColor}`}>
                  {milestone.label}
                </span>
                <span className={`block text-[9px] font-semibold ${labelColor} truncate px-1`}>
                  {milestone.sublabel}
                </span>
                <span className="hidden sm:block text-[8px] text-slate-500 mt-0.5 max-w-[70px] mx-auto leading-normal shrink-0">
                  {milestone.desc}
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
