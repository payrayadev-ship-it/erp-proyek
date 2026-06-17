/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building2, 
  Lock, 
  Mail, 
  ShieldCheck, 
  LogIn, 
  ArrowRight, 
  ChevronRight, 
  Info,
  Clock,
  KeyRound,
  UserCheck2,
  Users2,
  FileText
} from "lucide-react";
import { motion } from "motion/react";
import { db } from "../lib/db";
import { UserRole, UserProfile } from "../types";
import RegistrationForm from "./RegistrationForm";

interface LoginFormProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("••••••••");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available user list for quick assistance
  const presetUsers = db.getUsers();

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = db.loginUser(email);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg("Email tidak terdaftar atau kredensial salah.");
      }
    }, 850);
  };

  const handleQuickLogin = (presetEmail: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    setEmail(presetEmail);
    setPassword("password123");

    setTimeout(() => {
      const user = db.loginUser(presetEmail);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg("Gagal melakukan login simulasi otomatis.");
      }
    }, 700);
  };

  const handleNewVendorSuccess = (data: any) => {
    // Registered successfully. We can automatically log them in as a new vendor.
    // Let's find if the user registration created a matched user
    setTimeout(() => {
      const allUsers = db.getUsers();
      const matched = allUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (matched) {
        onLoginSuccess(matched);
      } else {
        // Fallback to procurement or first contractor
        const firstContractor = allUsers.find(u => u.role === "Kontraktor");
        if (firstContractor) onLoginSuccess(firstContractor);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans transition-all">
      {/* Upper Tech Accents */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      {/* Decorative Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Outer wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center max-w-[1440px] mx-auto w-full relative z-10 p-4 sm:p-6 lg:p-10 gap-8">
        
        {/* Left Side: Brand & Live statistics */}
        <div className="flex-1 flex flex-col justify-between text-left p-6 sm:p-8 lg:p-12 space-y-12">
          {/* Brand header */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-xl shadow-blue-500/10 border border-blue-400/20 shrink-0">
              F
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase">FORSDIG</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mr-1">E-PROCUREMENT INTEGRATED SYSTEM</p>
            </div>
          </div>

          {/* Slogan & Info cards */}
          <div className="space-y-6 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Akses Portal <span className="text-blue-500">E-Procurement</span> Bersertifikat Kemenkumham
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Sistem ERP Terpadu untuk manajemen pengadaan barang & jasa, penilaian rekam jejak kontraktor, manajemen progres dan dokumen kontrak (BAST) untuk konstruksi nasional yang akuntabel.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/85">
                <div className="text-2xl font-extrabold text-white font-mono">100%</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Audit Trail Realtime</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/85">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">Verified</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">NIB & SBU Integration</p>
              </div>
            </div>
          </div>

          {/* Footer credentials overview list */}
          <div className="hidden lg:block bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2 max-w-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 border-b border-slate-850 pb-2 mb-2">
              <Info className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>INFORMASI KREDENSIAL PORTAL UTAMA</span>
            </div>
            <p className="text-[11px] text-slate-400 select-all leading-relaxed">
              Anda dapat masuk secara resmi menggunakan email masing-masing peran di sebelah kanan untuk melihat isolasi fungsional data dan instrumen operasional spesifik.
            </p>
          </div>
        </div>

        {/* Right Side: Tabbed Login / Registration form */}
        <div className="w-full lg:w-[580px] flex flex-col justify-center shrink-0">
          <div className="bg-[#111827]/75 backdrop-blur-xl border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-800 p-2 bg-slate-950/40">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "login" 
                    ? "bg-slate-900 text-white border border-slate-800 shadow-md" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Portal</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "register" 
                    ? "bg-slate-900 text-white border border-slate-800 shadow-md" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Daftar Vendor Baru</span>
              </button>
            </div>

            {/* Custom tab views */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[82vh] text-left">
              
              {activeTab === "login" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Log In ke Dashboard</h3>
                    <p className="text-xs text-slate-400 mt-1">Silakan masukkan email rekanan Anda atau gunakan opsi akses cepat.</p>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-450 p-4 rounded-xl text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Manual Login Form */}
                  <form onSubmit={handleCredentialSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1.5">Alamat Email Akses</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="contoh: payrayadev@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1.5">Kata Sandi (Password)</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/15 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Masuk Sistem</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Presets Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-850"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Mulai Dengan Akses Cepat Multi-Peran</span>
                    <div className="flex-grow border-t border-slate-850"></div>
                  </div>

                  {/* Grid layout of preset entities */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {presetUsers.map((user) => (
                      <button
                        key={user.uid}
                        onClick={() => handleQuickLogin(user.email)}
                        className="w-full bg-slate-900 hover:bg-slate-850/80 border border-slate-850 hover:border-blue-500/40 p-3 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            user.role === "Super Admin" 
                              ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                              : user.role === "Owner Proyek"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : user.role === "Finance"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : user.role === "Auditor"
                                    ? "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                                    : "bg-slate-950 text-slate-400 border border-slate-800"
                          }`}>
                            {user.role === "Super Admin" && <ShieldCheck className="w-4.5 h-4.5" />}
                            {user.role === "Owner Proyek" && <Building2 className="w-4.5 h-4.5" />}
                            {user.role === "Finance" && <KeyRound className="w-4.5 h-4.5" />}
                            {user.role === "Auditor" && <UserCheck2 className="w-4.5 h-4.5" />}
                            {user.role !== "Super Admin" && user.role !== "Owner Proyek" && user.role !== "Finance" && user.role !== "Auditor" && (
                              <Users2 className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-950 font-bold text-slate-400 border border-slate-850">{user.role}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{user.companyName} • {user.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-650 group-hover:text-slate-300 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>

                </div>
              )}

              {activeTab === "register" && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-white">Daftarkan Badan Usaha Anda</h3>
                    <p className="text-xs text-slate-400 mt-1">Registrasikan legalitas NIB, NPWP, dan SBU di jaringan e-proc nasional untuk mengikuti tender terbuka.</p>
                  </div>

                  <RegistrationForm onSuccess={handleNewVendorSuccess} />
                </div>
              )}

            </div>

            {/* Bottom branding detail */}
            <div className="bg-slate-950/60 p-4 border-t border-slate-850 text-center text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>FORSDIG E-PROC v2.1-RELEASE</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> AES-256 SECURED</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
