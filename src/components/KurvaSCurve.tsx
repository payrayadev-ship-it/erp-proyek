/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DUMMY_KURVA_S = [
  { name: "Bulan 1", "Rencana Progress (%)": 8, "Realisasi Lapangan (%)": 7 },
  { name: "Bulan 2", "Rencana Progress (%)": 20, "Realisasi Lapangan (%)": 18 },
  { name: "Bulan 3", "Rencana Progress (%)": 35, "Realisasi Lapangan (%)": 38 },
  { name: "Bulan 4", "Rencana Progress (%)": 52, "Realisasi Lapangan (%)": 48.5 },
  { name: "Bulan 5", "Rencana Progress (%)": 68, "Realisasi Lapangan (%)": null },
  { name: "Bulan 6", "Rencana Progress (%)": 84, "Realisasi Lapangan (%)": null },
  { name: "Bulan 7", "Rencana Progress (%)": 100, "Realisasi Lapangan (%)": null },
];

export default function KurvaSCurve() {
  return (
    <div className="bg-[#1E293B]/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl font-sans text-left">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Kurva S Kontruksi Sipil</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Monitoring deviasi realisasi fisik vs bobot rencana dwi-mingguan (PJ-IKN-003).</p>
        </div>
        <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Rencana (Target)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Realisasi Lapangan</span>
          </div>
        </div>
      </div>

      <div className="h-64 mt-4 text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={DUMMY_KURVA_S}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                fontSize: "10px",
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="Rencana Progress (%)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="Realisasi Lapangan (%)"
              stroke="#818cf8"
              strokeWidth={3}
              activeDot={{ r: 8 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
