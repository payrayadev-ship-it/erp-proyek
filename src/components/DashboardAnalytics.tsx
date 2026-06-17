/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Sector, Legend, PieChart, Pie } from "recharts";
import { Building2, FileCheck2, ClipboardList, Wallet, Sparkles, TrendingUp, HelpCircle } from "lucide-react";

interface AnalyticsProps {
  projects: any[];
  tenders: any[];
  contractors: any[];
  invoices: any[];
}

const TENDER_PROVINCE_DATA = [
  { name: "DKI Jakarta", "Nilai HPS (Milyar)": 80 },
  { name: "Kaltim (IKN)", "Nilai HPS (Milyar)": 135 },
  { name: "Jawa Timur", "Nilai HPS (Milyar)": 95 },
  { name: "Jawa Barat", "Nilai HPS (Milyar)": 12.5 }
];

const CONTRACTOR_GRADE_DATA = [
  { name: "Grade Utama (A/B1)", value: 2 },
  { name: "Grade Madya (B/M1)", value: 1 },
];

const COLORS = ["#3b82f6", "#6366f1", "#06b6d4", "#10b981"];

export default function DashboardAnalytics({ projects, tenders, contractors, invoices }: AnalyticsProps) {
  // Aggregate stats
  const totalProjects = projects.length;
  const totalTenders = tenders.length;
  const totalContractors = contractors.length;
  const verifiedContractors = contractors.filter(c => c.status === "Verified").length;

  const runningValue = projects
    .filter(p => p.status === "Running")
    .reduce((sum, current) => sum + (current.budget || 0), 0);

  const activeTenderValue = tenders
    .filter(t => t.status === "Open")
    .reduce((sum, current) => sum + (current.hpsBudget || 0), 0);

  const invoicePendingCount = invoices.filter(i => i.status === "Menunggu").length;
  const invoicePendingValue = invoices
    .filter(i => i.status === "Menunggu")
    .reduce((sum, current) => sum + (current.amount || 0), 0);

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Visual Banners and KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* KPI 1 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">PROYEK TERGABUNG</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{totalProjects}</span>
            <span className="text-[9px] text-emerald-400 font-mono mt-0.5 block font-semibold">&bull; {projects.filter(p => p.status === "Running").length} Sedang Berjalan</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">TENDER AKTIF</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{tenders.filter(t => t.status === "Open").length} <span className="text-xs font-normal text-slate-400">/ {totalTenders}</span></span>
            <span className="text-[9px] text-blue-400 font-mono mt-0.5 block font-semibold">&bull; HPS Rp {(activeTenderValue / 1e9).toFixed(1)} Milyar</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">KONTRAKTOR LOLOS SAKS</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{verifiedContractors} <span className="text-xs font-normal text-slate-400">/ {totalContractors}</span></span>
            <span className="text-[9px] text-emerald-400 font-mono mt-0.5 block font-semibold">&bull; Keamanan legalitas 100%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">INVOICE PENDING</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{invoicePendingCount}</span>
            <span className="text-[9px] text-rose-400 font-mono mt-0.5 block font-semibold">&bull; Rp {(invoicePendingValue / 1e9).toFixed(2)} Milyar</span>
          </div>
        </div>

      </div>

      {/* Nilai Proyek Berjalan Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4.5">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider block uppercase">NILAI KONTRAK AKTIF TERMONITOR</span>
          <span className="text-2xl font-black text-white mt-1.5 block">Rp {runningValue.toLocaleString("id-ID")}</span>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">Dana aman terverifikasi dalam master escrow rekening giro PT Pembangunan Nusantara.</p>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/20 py-2.5 px-4 rounded-xl flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span className="text-xs text-indigo-300 font-mono font-medium">Beban Realisasi: Terlaksana Sehat</span>
        </div>
      </div>

      {/* Recharts Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart Panel */}
        <div className="bg-[#1E293B]/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sebaran Nilai HPS Sektor Infrastruktur</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Analisis visual akumulasi pagu Tender Pengadaan berdasarkan polda administrasi daerah.</p>
          </div>
          
          <div className="h-60 mt-4 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TENDER_PROVINCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip
                  cursor={{ fill: "#1e293b", opacity: 0.3 }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "10px",
                    color: "#e2e8f0"
                  }}
                />
                <Bar dataKey="Nilai HPS (Milyar)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {TENDER_PROVINCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Panel (Contractor Status/Qualify) */}
        <div className="bg-[#1E293B]/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Komposisi Klasifikasi Vendor</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Proporsi pembagian kualifikasi skala modal rekanan terdaftar.</p>
          </div>

          <div className="h-48 mt-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CONTRACTOR_GRADE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CONTRACTOR_GRADE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "10px",
                    color: "#e2e8f0"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 mt-2 space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Utama (Kualifikasi Besar / B1)</span>
              </div>
              <span className="font-bold text-white">2 Kontraktor</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Madya (Kualifikasi Sedang / M1)</span>
              </div>
              <span className="font-bold text-white">1 Rekanan</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
