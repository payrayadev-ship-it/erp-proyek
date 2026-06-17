/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, ZoomIn, ZoomOut, RefreshCw, Layers, Compass, Building, CheckCircle, Flame, CalendarRange } from "lucide-react";
import { Project } from "../types";

interface IndonesiaMapProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
}

export default function IndonesiaMap({ projects, selectedProjectId, onSelectProject }: IndonesiaMapProps) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"tech" | "minimal">("tech");

  // Equidistant latitude/longitude projection coordinates configuration
  // Indonesia bounds roughly: 95E to 141E, 6N to 11S
  const lonMin = 95.0;
  const lonMax = 141.0;
  const latMin = -11.0;
  const latMax = 6.0;

  const width = 800;
  const height = 320;

  const projectToCoords = (lat: number, lon: number) => {
    // Normalization to absolute pixels
    const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
    const y = ((latMax - lat) / (latMax - latMin)) * height;
    return { x, y };
  };

  const statusColors = {
    Planning: {
      bg: "bg-blue-500",
      text: "text-blue-400",
      border: "border-blue-550",
      fill: "fill-blue-500",
      glow: "shadow-blue-500/50",
      svgColor: "#3b82f6"
    },
    Tender: {
      bg: "bg-amber-500",
      text: "text-amber-400",
      border: "border-amber-550",
      fill: "fill-amber-500",
      glow: "shadow-amber-500/50",
      svgColor: "#f59e0b"
    },
    Running: {
      bg: "bg-emerald-500",
      text: "text-emerald-400",
      border: "border-emerald-550",
      fill: "fill-emerald-500",
      glow: "shadow-emerald-500/50",
      svgColor: "#10b981"
    },
    Hold: {
      bg: "bg-rose-500",
      text: "text-rose-400",
      border: "border-rose-550",
      fill: "fill-rose-500",
      glow: "shadow-rose-500/50",
      svgColor: "#f43f5e"
    },
    Completed: {
      bg: "bg-slate-500",
      text: "text-slate-400",
      border: "border-slate-550",
      fill: "fill-slate-500",
      glow: "shadow-slate-500/50",
      svgColor: "#64748b"
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 font-sans text-left relative overflow-hidden">
      {/* Background cyber grid patterns for Tech view */}
      {viewMode === "tech" && (
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
      )}

      {/* Header controls toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-2.5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
            <span className="text-[10px] text-blue-400 font-mono font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">LIVE RADAR</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">INDONESIAN GEOPLANNER</span>
          </div>
          <h3 className="text-sm font-extrabold text-white tracking-wide mt-1">Geospasial Lokasi Kerja Konstruksi</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(prev => prev === "tech" ? "minimal" : "tech")}
            className="p-1 px-2 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-400 font-bold rounded border border-slate-800 hover:border-slate-750 transition-all flex items-center gap-1 cursor-pointer"
            title="Ubah tema peta"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Map Theme: {viewMode === "tech" ? "Hologram Grid" : "Dark Minimal"}</span>
          </button>
        </div>
      </div>

      {/* Map stage wrapper */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-2 sm:p-4 md:p-6 flex items-center justify-center relative select-none">
        
        {/* Hologram Coordinate Overlay Lines */}
        {viewMode === "tech" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {/* Grid Line Latitudes */}
            <div className="absolute top-[25%] left-0 right-0 h-[1px] border-t border-dashed border-slate-800 flex items-center justify-start pl-2">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8]">EQ (0.000°)</span>
            </div>
            <div className="absolute top-[50%] left-0 right-0 h-[1px] border-t border-dashed border-slate-800 flex items-center justify-start pl-2">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8]">-4.250° S</span>
            </div>
            <div className="absolute top-[75%] left-0 right-0 h-[1px] border-t border-dashed border-slate-800 flex items-center justify-start pl-2">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8]">-8.500° S</span>
            </div>

            {/* Grid Line Longitudes */}
            <div className="absolute left-[20%] top-0 bottom-0 w-[1px] border-l border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8] rotate-90 origin-bottom">104.2° E</span>
            </div>
            <div className="absolute left-[40%] top-0 bottom-0 w-[1px] border-l border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8] rotate-90 origin-bottom">113.4° E</span>
            </div>
            <div className="absolute left-[60%] top-0 bottom-0 w-[1px] border-l border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8] rotate-90 origin-bottom">122.6° E</span>
            </div>
            <div className="absolute left-[80%] top-0 bottom-0 w-[1px] border-l border-dashed border-slate-800 flex items-end justify-center pb-1">
              <span className="text-[8px] text-slate-600 font-mono scale-[0.8] rotate-90 origin-bottom">131.8° E</span>
            </div>
          </div>
        )}

        {/* SVG Map Canvas */}
        <div className="w-full max-w-4xl aspect-[800/320] relative">
          <svg
            viewBox="0 0 800 320"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 15px rgba(30, 41, 59, 0.4))" }}
          >
            {/* Map Contours (Stylized low-poly vectors of major Indonesian islands) */}
            <g 
              className={`transition-all duration-300 ${
                viewMode === "tech" 
                  ? "text-blue-950 fill-blue-900/10 stroke-blue-800/35" 
                  : "text-slate-900 fill-slate-850/15 stroke-slate-800/50"
              }`}
              strokeWidth="1.5"
            >
              {/* Sumatra Island Contour */}
              <path 
                id="sumatra"
                d="M 15 30 L 75 75 L 125 125 L 175 210 L 171 216 L 150 205 L 125 190 L 105 160 L 75 120 L 50 90 L 20 50 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />
              
              {/* Java Island Contour */}
              <path 
                id="java"
                d="M 191 224 L 230 230 L 260 235 L 308 248 L 337 262 L 336 268 L 300 258 L 266 258 L 230 250 L 195 238 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />

              {/* Kalimantan Island Contour */}
              <path 
                id="kalimantan"
                d="M 255 110 Q 255 100 270 75 L 305 60 L 335 50 L 370 45 L 393 50 L 400 90 L 385 130 L 382 150 L 339 175 Q 310 160 275 145 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />

              {/* Sulawesi Island Contour */}
              <path 
                id="sulawesi"
                d="M 425 210 L 424 180 L 433 150 L 431 130 L 418 120 L 431 120 L 440 135 L 455 130 L 485 110 L 518 84 L 518 90 L 485 115 L 455 145 L 480 150 L 500 152 L 480 160 L 452 155 L 455 175 L 478 188 L 475 192 L 448 180 L 436 170 L 430 210 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />

              {/* Lesser Sunda Islands Contour (Bali, Nusa Tenggara) */}
              <path 
                id="lessersunda"
                d="M 347 271 L 360 271 L 385 273 L 415 273 L 445 275 L 475 275 L 505 285 L 525 291 L 521 296 L 495 288 L 450 280 L 410 278 L 347 275 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />

              {/* Papua Island Contour */}
              <path 
                id="papua"
                d="M 630 128 L 655 120 L 660 140 L 685 145 L 715 135 L 750 145 L 795 160 L 790 271 L 760 250 L 730 215 L 700 190 L 665 178 L 650 160 Z" 
                className="transition-all hover:fill-blue-500/5 hover:stroke-blue-500/20"
              />
            </g>

            {/* Scale compass indicator */}
            {viewMode === "tech" && (
              <g transform="translate(45, 275)" className="opacity-40 font-mono text-slate-500">
                <circle cx="0" cy="0" r="14" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="-18" y1="0" x2="18" y2="0" stroke="#334155" strokeWidth="0.8" />
                <line x1="0" y1="-18" x2="0" y2="18" stroke="#334155" strokeWidth="0.8" />
                <text x="-3" y="-20" className="text-[7px]" fill="#64748b">N</text>
                <text x="21" y="2" className="text-[6px]" fill="#475569">1:15,000,000</text>
              </g>
            )}

            {/* Dynamic Project Pinpoint Markers */}
            {projects.map((p) => {
              // Standard defaults if location coordinates are missing
              const lat = p.latitude ?? -6.2;
              const lon = p.longitude ?? 106.8;
              const { x, y } = projectToCoords(lat, lon);
              
              const isSelected = selectedProjectId === p.id;
              const isHovered = hoveredProject?.id === p.id;
              const colorInfo = statusColors[p.status] || statusColors.Running;

              return (
                <g 
                  key={p.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectProject && onSelectProject(p.id)}
                  onMouseEnter={() => setHoveredProject(p)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {/* Outer Radar Waves for Active/Selected projects */}
                  {(isSelected || p.status === "Running") && (
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="16" 
                      fill="none" 
                      stroke={colorInfo.svgColor} 
                      strokeWidth="1.5" 
                      className={`animate-ping origin-center`}
                      style={{ animationDuration: isSelected ? "1.2s" : "2.5s" }}
                      opacity="0.35"
                    />
                  )}

                  {/* Highlight Glow Rings */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r={isSelected ? "9" : "6"} 
                    fill={colorInfo.svgColor} 
                    fillOpacity={isSelected || isHovered ? "0.3" : "0.15"}
                    stroke={colorInfo.svgColor}
                    strokeWidth="1"
                    className="transition-all duration-300"
                  />

                  {/* Core Pin Point Circle */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r={isSelected ? "4.5" : "3.5"} 
                    fill={colorInfo.svgColor}
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="transition-all duration-300 shadow-xl"
                  />

                  {/* Hotspot Hover Click Area */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="12" 
                    fill="transparent" 
                  />

                  {/* Static projection crosshair lines for detail in tech view */}
                  {viewMode === "tech" && (isSelected || isHovered) && (
                    <g className="opacity-50">
                      <line x1="-25" y1="0" x2="-8" y2="0" stroke={colorInfo.svgColor} strokeWidth="0.5" />
                      <line x1="8" y1="0" x2="25" y2="0" stroke={colorInfo.svgColor} strokeWidth="0.5" />
                      <line x1="0" y1="-25" x2="0" y2="-8" stroke={colorInfo.svgColor} strokeWidth="0.5" />
                      <line x1="0" y1="8" x2="0" y2="25" stroke={colorInfo.svgColor} strokeWidth="0.5" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floated Tooltip Overlay */}
          {(hoveredProject || projects.find(p => p.id === selectedProjectId)) && (() => {
            const displayProj = hoveredProject || projects.find(p => p.id === selectedProjectId)!;
            const lat = displayProj.latitude ?? -6.2;
            const lon = displayProj.longitude ?? 106.8;
            const { x, y } = projectToCoords(lat, lon);

            const colorProps = statusColors[displayProj.status] || statusColors.Running;

            // Positioning adjustment: Place tip above the marker
            const tipLeft = `${(x / width) * 100}%`;
            const tipTop = `${(y / height) * 100}%`;

            return (
              <div 
                className="absolute bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-2xl flex flex-col space-y-2 pointer-events-none transition-all duration-200 z-30 w-64 text-xs font-sans font-medium"
                style={{
                  left: `calc(${tipLeft} - 128px)`, // Center horizontally offset by half-width
                  top: `calc(${tipTop} - 150px)`,   // Show above the marker pin
                }}
              >
                <div className="flex justify-between items-center bg-slate-900 border-b border-slate-800 pb-1.5 -mx-3.5 px-3.5 h-6">
                  <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase">{displayProj.code}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${colorProps.bg} text-white`}>
                    {displayProj.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-white leading-snug line-clamp-2">{displayProj.name}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">Area: {displayProj.location}</p>
                </div>
                <div className="pt-1.5 border-t border-slate-850 flex justify-between text-[10px] items-center">
                  <span className="text-slate-500">Pagu:</span>
                  <span className="font-extrabold text-slate-200 font-mono">Rp {(displayProj.budget / 1e9).toFixed(1)} Miliar</span>
                </div>
                {/* Lat/Long coordinates label footer */}
                <div className="text-[8px] text-slate-600 font-mono flex justify-between">
                  <span>LAT: {lat.toFixed(4)}° </span>
                  <span>LON: {lon.toFixed(4)}° </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Footer Info / Key legends */}
      <div className="flex justify-between items-center flex-wrap gap-4 text-xs border-t border-slate-800 pt-3 text-slate-400">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">STATUS KUNCI:</span>
          {Object.entries(statusColors).map(([status, info]) => {
            const count = projects.filter(p => p.status === status).length;
            return (
              <div key={status} className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${info.bg}`} />
                <span className="font-semibold text-slate-300">{status}</span>
                <span className="font-mono text-slate-500">({count})</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sync Realtime dengan Data Grid Kontrak</span>
        </div>
      </div>
    </div>
  );
}
