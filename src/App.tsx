/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db } from "./lib/db";
import {
  UserRole,
  Project,
  Tender,
  Bid,
  Contract,
  Invoice,
  Bast,
  UserProfile,
  Contractor
} from "./types";
import {
  Building2,
  BookmarkPlus,
  Star,
  Compass,
  FileCheck2,
  HardHat,
  Search,
  Sparkles,
  Award,
  Signature,
  FileSpreadsheet,
  AlertTriangle,
  History,
  TrendingUp,
  CreditCard,
  Layers,
  MapPin,
  ChevronRight,
  UserCheck,
  Bell,
  RefreshCw,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  QrCode,
  ShieldCheck,
  MessageSquareOff,
  Eye,
  LogOut
} from "lucide-react";
import DashboardAnalytics from "./components/DashboardAnalytics";
import RegistrationForm from "./components/RegistrationForm";
import ContractorProfileDetail from "./components/ContractorProfileDetail";
import KurvaSCurve from "./components/KurvaSCurve";
import AIAssistant from "./components/AIAssistant";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";
import LoginForm from "./components/LoginForm";
import IndonesiaMap from "./components/IndonesiaMap";
import AutocompleteInput from "./components/AutocompleteInput";
import ProjectTimeline from "./components/ProjectTimeline";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("eproc_is_logged_in") === "true";
  });
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return db.getCurrentUser().role;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState<"dashboard" | "contractors" | "projects" | "tenders" | "bids" | "finance" | "audits">("dashboard");

  // Local Reactive Database States
  const [projects, setProjects] = useState<Project[]>(db.getProjects());
  const [tenders, setTenders] = useState<Tender[]>(db.getTenders());
  const [bids, setBids] = useState<Bid[]>(db.getBids());
  const [contracts, setContracts] = useState<Contract[]>(db.getContracts());
  const [invoices, setInvoices] = useState<Invoice[]>(db.getInvoices());
  const [contractors, setContractors] = useState<Contractor[]>(db.getContractors());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>(db.getAudits());

  // Interactivity States
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchProvince, setSearchProvince] = useState("");
  const [searchSBU, setSearchSBU] = useState("");
  const [aiMatchOutputs, setAiMatchOutputs] = useState<any[]>([]);
  const [isAiMatchingLoading, setIsAiMatchingLoading] = useState(false);
  const [selectedMatchProject, setSelectedMatchProject] = useState<string>("");

  // New Project Form
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjLocation, setNewProjLocation] = useState("Surabaya, Jawa Timur");
  const [newProjBudget, setNewProjBudget] = useState(25000000000);
  const [newProjCode, setNewProjCode] = useState(`PJ-${Date.now().toString().slice(-4)}`);

  // New Tender Form
  const [showNewTenderModal, setShowNewTenderModal] = useState(false);
  const [selectedProjForTender, setSelectedProjForTender] = useState("");
  const [newTenderTitle, setNewTenderTitle] = useState("");
  const [newTenderDesc, setNewTenderDesc] = useState("");
  const [newTenderType, setNewTenderType] = useState<any>("Tender Terbuka");

  // New Bid Form
  const [showNewBidModal, setShowNewBidModal] = useState(false);
  const [selectedTenderForBid, setSelectedTenderForBid] = useState<Tender | null>(null);
  const [newBidAmount, setNewBidAmount] = useState(0);
  const [newBidDays, setNewBidDays] = useState(365);
  const [newBidMethod, setNewBidMethod] = useState("");

  // New Invoice Form
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedContractForInvoice, setSelectedContractForInvoice] = useState<Contract | null>(null);
  const [newInvoiceAmount, setNewInvoiceAmount] = useState(0);
  const [newInvoiceTerm, setNewInvoiceTerm] = useState(1);

  // New BAST Form
  const [showNewBastModal, setShowNewBastModal] = useState(false);
  const [selectedProjForBast, setSelectedProjForBast] = useState<Project | null>(null);
  const [newBappNumber, setNewBappNumber] = useState("");

  // File Preview Modal States
  const [selectedTenderForPreview, setSelectedTenderForPreview] = useState<Tender | null>(null);
  const [previewDocType, setPreviewDocType] = useState<"tor" | "rks" | "boq" | null>(null);

  // Geospatial Map State
  const [selectedMapProjectId, setSelectedMapProjectId] = useState<string | null>(null);

  // Authentication Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem("eproc_is_logged_in", "true");
    setIsLoggedIn(true);
    setNotifications(db.getNotifications(user.uid));
    
    // Switch to optimal view tab
    if (user.role === "Finance") setActiveTab("finance");
    else if (user.role === "Auditor") setActiveTab("audits");
    else if (user.role === "Kontraktor" || user.role === "Subkontraktor") setActiveTab("tenders");
    else setActiveTab("dashboard");
  };

  const handleLogout = () => {
    db.logoutUser();
    localStorage.removeItem("eproc_is_logged_in");
    setIsLoggedIn(false);
  };

  // Sync roles on toggle
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    const newContextUser = db.switchUser(role);
    setCurrentUser(newContextUser);
    setNotifications(db.getNotifications(newContextUser.uid));
    
    // Auto shift relevant tabs on role switch for optimal flow UX
    if (role === "Finance") setActiveTab("finance");
    else if (role === "Auditor") setActiveTab("audits");
    else if (role === "Kontraktor" || role === "Subkontraktor") setActiveTab("tenders");
    else setActiveTab("dashboard");
  };

  useEffect(() => {
    setNotifications(db.getNotifications(currentUser.uid));
  }, [currentUser]);

  // Handle succession actions
  const reloadData = () => {
    setProjects(db.getProjects());
    setTenders(db.getTenders());
    setBids(db.getBids());
    setContracts(db.getContracts());
    setInvoices(db.getInvoices());
    setContractors(db.getContractors());
    setAudits(db.getAudits());
    setNotifications(db.getNotifications(currentUser.uid));
  };

  // AI Matching algorithm route call
  const triggerAIMatch = async (projectId: string) => {
    if (!projectId) return;
    setIsAiMatchingLoading(true);
    setAiMatchOutputs([]);
    try {
      const proj = projects.find(p => p.id === projectId);
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: proj,
          contractors: contractors
        })
      });
      if (res.ok) {
        const matches = await res.json();
        setAiMatchOutputs(matches);
        db.logAudit(currentUser.uid, currentUser.name, "AI Matching Execution", `Ran AI sourcing recommendation engine for Project Target: ${proj?.name}`);
      }
    } catch (e) {
      console.error("AI Matching failed", e);
    } finally {
      setIsAiMatchingLoading(false);
    }
  };

  // Create Project handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    // Auto coordinate estimation
    let lat = -6.2088; // default Jakarta
    let lon = 106.8456;
    const locLower = newProjLocation.toLowerCase();
    if (locLower.includes("jakarta")) {
      lat = -6.2297; lon = 106.8294;
    } else if (locLower.includes("kalimantan") || locLower.includes("ikn") || locLower.includes("penajam")) {
      lat = -0.9103; lon = 116.7108;
    } else if (locLower.includes("bogor") || locLower.includes("sentul") || locLower.includes("jawa barat")) {
      lat = -6.5815; lon = 106.8837;
    } else if (locLower.includes("surabaya") || locLower.includes("jawa timur")) {
      lat = -7.2185; lon = 112.7225;
    } else if (locLower.includes("bandung")) {
      lat = -6.9175; lon = 107.6191;
    } else if (locLower.includes("bali")) {
      lat = -8.4095; lon = 115.1889;
    } else if (locLower.includes("medan") || locLower.includes("sumatra") || locLower.includes("aceh")) {
      lat = 3.5952; lon = 98.6722;
    } else if (locLower.includes("sulawesi") || locLower.includes("makassar")) {
      lat = -5.1477; lon = 119.4327;
    } else if (locLower.includes("papua") || locLower.includes("sorong")) {
      lat = -4.2699; lon = 138.0803;
    } else {
      // Slightly randomize to prevent overlap
      lat = -6.2 + (Math.random() - 0.5) * 1.5;
      lon = 106.8 + (Math.random() - 0.5) * 1.5;
    }

    db.addProject({
      code: newProjCode,
      name: newProjName,
      location: newProjLocation,
      ownerId: currentUser.uid,
      ownerName: currentUser.name,
      budget: newProjBudget,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      status: "Planning",
      latitude: lat,
      longitude: lon
    });

    setNewProjName("");
    setNewProjCode(`PJ-${Date.now().toString().slice(-4)}`);
    setShowNewProjModal(false);
    reloadData();
  };

  // Create Tender handler
  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenderTitle.trim() || !selectedProjForTender) return;

    const proj = projects.find(p => p.id === selectedProjForTender);
    if (!proj) return;

    db.addTender({
      projectId: selectedProjForTender,
      title: newTenderTitle,
      description: newTenderDesc,
      location: proj.location,
      hpsBudget: proj.budget * 0.95, // HPS usually slightly below overall project budget
      schedule: "30 Hari Konstruksi",
      type: newTenderType,
      status: "Open",
      docUrls: {
        tor: "TOR_Generated_Procement.pdf",
        rks: "RKS_Sarat_Ketentuan_Umum.pdf",
        boq: "BOQ_HPS_Target.xlsx",
        drawings: "Engineering_Drawings_DED.pdf"
      }
    });

    setNewTenderTitle("");
    setNewTenderDesc("");
    setShowNewTenderModal(false);
    reloadData();
  };

  // Bid submission handler
  const handleCreateBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderForBid || newBidAmount <= 0) return;

    db.addBid({
      tenderId: selectedTenderForBid.id,
      contractorId: currentUser.uid,
      contractorName: currentUser.companyName || currentUser.name,
      bidAmount: newBidAmount,
      durationDays: newBidDays,
      executionMethod: newBidMethod,
      technicalDocUrl: "Technical_Proposal_Standard.pdf",
      status: "Evaluasi"
    });

    setNewBidAmount(0);
    setNewBidMethod("");
    setShowNewBidModal(false);
    reloadData();
  };

  // Award Bid directly and generate Contract draft
  const handleAwardBid = (bidId: string, tenderId: string, projectId: string, value: number) => {
    db.evaluateBid(bidId, 95, "Menang");
    db.createContractFromAward(bidId, tenderId, projectId, value);
    
    // Mark other bids as Lost
    const otherBids = bids.filter(b => b.tenderId === tenderId && b.id !== bidId);
    otherBids.forEach(ob => {
      db.evaluateBid(ob.id, 60, "Kalah");
    });

    // Update TenderStatus to Awarded
    const tIdx = tenders.findIndex(t => t.id === tenderId);
    if (tIdx !== -1) {
      tenders[tIdx].status = "Awarded";
    }

    reloadData();
  };

  // Create Invoice billing Term
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractForInvoice || newInvoiceAmount <= 0) return;

    db.addInvoice({
      contractId: selectedContractForInvoice.id,
      contractorId: currentUser.uid,
      invoiceNumber: `INV-EPROC/${newInvoiceTerm}/${Math.floor(100+Math.random()*900)}`,
      amount: newInvoiceAmount,
      tax: newInvoiceAmount * 0.11, // PPN 11% in Indonesia
      termNumber: newInvoiceTerm,
      fileUrl: "Generated_Billing_Statement.pdf",
      status: "Menunggu"
    });

    setNewInvoiceAmount(0);
    setShowNewInvoiceModal(false);
    reloadData();
  };

  // Sign Basts
  const handleSignBast = (bastId: string, signType: "owner" | "contractor" | "consultant") => {
    db.approveBast(bastId, currentUser.name, signType);
    reloadData();
  };

  // Sign Contracts
  const handleSignContract = (contractId: string, signType: "owner" | "contractor") => {
    db.signContract(contractId, signType);
    reloadData();
  };

  // Register New Contractor
  const handleSuccessRegistration = (data: any) => {
    db.registerContractor({
      name: data.name,
      nib: data.nib,
      npwp: data.npwp,
      sbu: data.sbu,
      siujk: data.siujk,
      address: data.address,
      city: data.city,
      province: data.province,
      pic: data.pic,
      whatsapp: data.whatsapp,
      website: data.website,
      logo: "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&h=120&q=80",
      cover: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&h=300&q=80",
      companyProfile: data.companyProfile,
      yearFounded: 2020,
      employeeCount: 45
    });
    reloadData();
  };

  // Filter contractor lists dynamically in card grid search
  const filteredContractors = contractors.filter(c => {
    const matchCity = c.city.toLowerCase().includes(searchCity.toLowerCase());
    const matchProvince = c.province.toLowerCase().includes(searchProvince.toLowerCase());
    const matchSbu = c.sbu.toLowerCase().includes(searchSBU.toLowerCase());
    return matchCity && matchProvince && matchSbu;
  });

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans transition-all selection:bg-blue-600 selection:text-white">
      
      {/* Platform Multi-role Context Safety Shield Header */}
      <div className="bg-[#1E293B]/30 backdrop-blur-md border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-400 shrink-0" />
          <span>Keamanan Enterprise: <strong>Role-Based Access Control (RBAC)</strong> aktif. Data terisolasi.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Beralih Akses Peran (Otorisasi RBAC):</span>
          <select
            value={activeRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="bg-[#0F172A] border border-blue-500/20 text-blue-400 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-blue-400/80 cursor-pointer"
          >
            <option value="Super Admin">Super Admin (Akses Penuh)</option>
            <option value="Owner Proyek">Owner Proyek (PT Pembangunan Nusantara)</option>
            <option value="Procurement">Procurement (Tim Penilai Tender)</option>
            <option value="Project Manager">Project Manager (Site Monitor)</option>
            <option value="Finance">Finance (Manajer Keuangan)</option>
            <option value="Kontraktor">Kontraktor (PT Wijaya Karya)</option>
            <option value="Subkontraktor">Subkontraktor (Ahli Pondasi)</option>
            <option value="Konsultan">Konsultan Pengawas (Syarif)</option>
            <option value="Auditor">Auditor Eksternal (BPK RI)</option>
          </select>
        </div>
      </div>

      {/* Main Brand Header Navbar */}
      <header className="bg-[#1E293B]/40 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/15 border border-blue-400/20 shrink-0">
            F
          </div>
          <div className="text-left">
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase">FORSDIG</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">E-PROC KONTRAKTOR</p>
          </div>
        </div>

        {/* Navigation Tab Links */}
        <nav className="flex flex-wrap gap-1.5 font-medium text-xs bg-slate-950/40 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "dashboard" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("contractors")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "contractors" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
          >
            Cari Kontraktor
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "projects" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
          >
            Proyek
          </button>

          <button
            onClick={() => setActiveTab("tenders")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "tenders" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
          >
            Tender & Bid
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "finance" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
          >
            Finance / Termin
          </button>

          {(activeRole === "Auditor" || activeRole === "Super Admin") && (
            <button
              onClick={() => setActiveTab("audits")}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === "audits" ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
            >
              Audits Log
            </button>
          )}
        </nav>

        {/* User profile & Notifications widget in Header */}
        <div className="flex items-center gap-3 md:border-l border-slate-800 md:pl-4 self-stretch md:self-auto justify-between">
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-blue-400 font-semibold block uppercase tracking-wider">{currentUser.role}</span>
            <span className="text-xs font-bold text-white block">{currentUser.name}</span>
          </div>
          <div className="relative p-1.5 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-400 cursor-pointer hover:text-white hover:bg-slate-900" title="Notifikasi">
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 font-bold transition-all text-[11px] cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout area */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Active Tab: Dashboard Layout */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <DashboardAnalytics
              projects={projects}
              tenders={tenders}
              contractors={contractors}
              invoices={invoices}
            />

            {/* Visualizing Active Kurva S side-by-side with semantic AI Match launcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2">
                <KurvaSCurve />
              </div>

              {/* AI matching engine widget container */}
              <div className="bg-[#1E293B]/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl text-left font-sans flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">AI Sourcing Matcher</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Pilih target perencanaan proyek Anda untuk menyaring kontraktor dengan skor kelayakan tertinggi secara instan.
                  </p>
                  
                  <div className="space-y-3.5">
                    <label className="block text-[11px] text-slate-500 uppercase font-bold">Pilih Proyek:</label>
                    <select
                      value={selectedMatchProject}
                      onChange={(e) => setSelectedMatchProject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Pilih Proyek Sourcing --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => triggerAIMatch(selectedMatchProject)}
                      disabled={isAiMatchingLoading || !selectedMatchProject}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      {isAiMatchingLoading ? "Mencari Sematik Terbaik..." : "Jalankan AI Match Engine"}
                    </button>
                  </div>
                </div>

                {/* AI Matching list outputs */}
                {aiMatchOutputs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase tracking-widest block">Rekomendasi Teratas:</span>
                    {aiMatchOutputs.map((m, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs gap-3">
                        <div>
                          <span className="font-bold text-slate-200 block truncate">{m.contractorName}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{m.reason}</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-extrabold shrink-0">
                          {m.matchPercentage}% FIT
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Active Tab: Contractors searching & profiles */}
        {activeTab === "contractors" && (
          <div className="space-y-6">
            
            <div className="flex flex-col lg:flex-row gap-5">
              
              {/* Sidebar Filters */}
              <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left h-fit space-y-5">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Search className="w-4.5 h-4.5 text-slate-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Filter Rekanan</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <AutocompleteInput
                    label="Cari Kota:"
                    value={searchCity}
                    onChange={setSearchCity}
                    placeholder="cth: Jakarta Timur"
                    suggestions={contractors.map(c => c.city)}
                  />

                  <AutocompleteInput
                    label="Cari Provinsi:"
                    value={searchProvince}
                    onChange={setSearchProvince}
                    placeholder="cth: Jawa Barat"
                    suggestions={contractors.map(c => c.province)}
                  />

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[10px]">Cari Lisensi SBU:</label>
                    <input
                      type="text"
                      value={searchSBU}
                      onChange={(e) => setSearchSBU(e.target.value)}
                      placeholder="cth: BG009"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <button
                    onClick={() => { setSearchCity(""); setSearchProvince(""); setSearchSBU(""); }}
                    className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold py-2 rounded-lg text-center transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* Card List of Contractors */}
              <div className="flex-1 space-y-5">
                
                {selectedContractor ? (
                  <ContractorProfileDetail
                    contractor={selectedContractor}
                    activeRole={activeRole}
                    onProfileClosed={() => { setSelectedContractor(null); reloadData(); }}
                    onReviewAdded={reloadData}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContractors.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContractor(c)}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start cursor-pointer hover:border-slate-700 hover:bg-slate-900/80 transition-all text-left"
                      >
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-16 h-16 rounded-xl border border-slate-800 object-cover shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white tracking-wide block hover:text-amber-400">{c.name}</span>
                            <span className="bg-slate-950 border border-slate-800 text-amber-500 font-mono text-[9px] px-1.5 py-0.5 rounded font-black">Score {c.score || 65}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">{c.city}, {c.province}</span>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">{c.companyProfile}</p>
                          
                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 mt-2 text-slate-500">
                            <span>Sertifikasi: {c.sbu?.slice(0, 5)}</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-300"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {c.rating || "0.0"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Online Registration Module (Only visible to non-contractor or on demand) */}
            <div className="pt-6 border-t border-slate-800">
              <RegistrationForm onSuccess={handleSuccessRegistration} />
            </div>

          </div>
        )}

        {/* Active Tab: Projects panel */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 block flex-wrap gap-2.5">
              <div className="text-left">
                <h2 className="text-base font-bold text-white">Kelola Proyek Infrastruktur</h2>
                <p className="text-xs text-slate-400 mt-0.5">Daftar fisik konstruksi yang dipegang sebagai owner / project manager.</p>
              </div>

              {activeRole === "Owner Proyek" && (
                <button
                  onClick={() => setShowNewProjModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </button>
              )}
            </div>

            {/* Indonesia Map Geospatial Visualizer Showcase */}
            <IndonesiaMap 
              projects={projects}
              selectedProjectId={selectedMapProjectId}
              onSelectProject={(id) => setSelectedMapProjectId(id)}
            />

            {/* List of projects cards details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left font-sans">
              {projects.map((p) => {
                const isOwnerOrAdmin = currentUser.role === "Super Admin" || currentUser.uid === p.ownerId;
                const isMapSelected = selectedMapProjectId === p.id;
                return (
                  <div 
                    key={p.id} 
                    className={`p-5 rounded-2xl space-y-4 transition-all duration-300 ${
                      isMapSelected 
                        ? 'bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20 scale-[1.01]' 
                        : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] text-amber-500 font-mono block font-black uppercase tracking-wider">{p.code}</span>
                        <h3 className="text-sm font-extrabold text-white tracking-wide mt-1 leading-snug">{p.name}</h3>
                      </div>
                      
                      {/* Status state badges */}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'Planning' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        p.status === 'Tender' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                        p.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <ProjectTimeline 
                      status={p.status} 
                      startDate={p.startDate} 
                      endDate={p.endDate} 
                    />

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Nilai Pagu Proyek:</span> <span className="font-extrabold text-slate-200 font-mono">Rp {p.budget.toLocaleString("id-ID")}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Provinsi Area Pekerjaan:</span> <span className="text-slate-300 font-semibold">{p.location}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Masa Periode Kontrak:</span> <span className="text-slate-300 font-mono font-semibold">{p.startDate} - {p.endDate}</span></div>
                      <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-slate-800/60">
                        <span className="text-slate-500 text-[10px]">Peta Geospasial:</span>
                        <button
                          onClick={() => setSelectedMapProjectId(isMapSelected ? null : p.id)}
                          className={`flex items-center gap-1 text-[10px] font-bold transition-all px-2 py-0.5 rounded border cursor-pointer ${
                            isMapSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-blue-400 border-slate-800 hover:text-blue-300 hover:border-slate-700'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{isMapSelected ? 'Dipilih' : 'Pusatkan Peta'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Monitor action inside card list */}
                    {p.status === "Running" && (
                      <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">Bobot Progress Fisik: <strong>48.5%</strong></span>
                        {activeRole === "Project Manager" && (
                          <button
                            onClick={() => {
                              setSelectedProjForBast(p);
                              setNewBappNumber(`BAST-${p.code}/${new Date().getFullYear()}`);
                              setShowNewBastModal(true);
                            }}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            Ajukan Serah Terima BAST
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Active Tab: Tender & Bid proposal submission */}
        {activeTab === "tenders" && (
          <div className="space-y-6 text-left">
            
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 block flex-wrap gap-2.5">
              <div>
                <h2 className="text-base font-bold text-white">Portal Tender Publik</h2>
                <p className="text-xs text-slate-400 mt-0.5">Saring tender aktif nasional dan daftarkan penawaran BOQ komersial perusahaan Anda.</p>
              </div>

              {(activeRole === "Owner Proyek" || activeRole === "Procurement") && (
                <button
                  onClick={() => setShowNewTenderModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Umumkan Tender Baru</span>
                </button>
              )}
            </div>

            {/* Map list of Tenders */}
            {tenders.map((t) => {
              const activeTenderBids = bids.filter(b => b.tenderId === t.id);
              return (
                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                    <div>
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">{t.type}</span>
                      <h3 className="text-base font-extrabold text-white tracking-wide mt-1.5">{t.title}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold font-mono">NILAI HPS MAKSIMAL</span>
                      <span className="text-base font-black text-amber-400">Rp {t.hpsBudget.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs text-slate-300">
                    <div className="flex flex-col justify-between">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">DOKUMEN TOR</span>
                      <button 
                        onClick={() => {
                          setSelectedTenderForPreview(t);
                          setPreviewDocType("tor");
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 hover:underline text-left cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="truncate">{t.docUrls.tor}</span>
                      </button>
                    </div>

                    <div className="flex flex-col justify-between">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">DOKUMEN RKS</span>
                      <button 
                        onClick={() => {
                          setSelectedTenderForPreview(t);
                          setPreviewDocType("rks");
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 hover:underline text-left cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="truncate">{t.docUrls.rks}</span>
                      </button>
                    </div>

                    <div className="flex flex-col justify-between">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">DOKUMEN BOQ TARGET</span>
                      <button 
                        onClick={() => {
                          setSelectedTenderForPreview(t);
                          setPreviewDocType("boq");
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 hover:underline text-left cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="truncate">{t.docUrls.boq}</span>
                      </button>
                    </div>

                    <div className="flex flex-col justify-between border-t sm:border-l sm:border-t-0 border-slate-850 pt-2 sm:pt-0 sm:pl-4">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">MASA TENDER</span>
                      <span className="text-slate-200 font-semibold">{t.schedule}</span>
                    </div>
                  </div>

                  {/* Submission Form for Contractors */}
                  {(activeRole === "Kontraktor" || activeRole === "Subkontraktor") && t.status === "Open" && (
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setSelectedTenderForBid(t);
                          setShowNewBidModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                      >
                        Kirim Penawaran Harga & Teknis (Bid)
                      </button>
                    </div>
                  )}

                  {/* Bid Evaluations Section */}
                  {activeTenderBids.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Daftar Berkas Penawaran Masuk (Evaluasi Otomatis):</span>
                      <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850">
                        <table className="w-full text-xs font-sans">
                          <thead>
                            <tr className="border-b border-slate-850 bg-slate-900 text-slate-400 text-left">
                              <th className="p-3">Nama Kontraktor</th>
                              <th className="p-3">Harga Penawaran</th>
                              <th className="p-3">Metode Pelaksanaan</th>
                              <th className="p-3">Durasi</th>
                              <th className="p-3 text-center">Hasil Skor AI (Autoeval)</th>
                              <th className="p-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeTenderBids.map((b) => {
                              // Autoevaluation math mock
                              const efficiency = ((t.hpsBudget - b.bidAmount) / t.hpsBudget) * 100;
                              // Price weight 40%, Technical 30%, experience 20%, time 10%
                              const computedScore = Math.min(100, Math.round(
                                (efficiency > 0 && efficiency < 15 ? 95 : 75) * 0.4 +
                                (b.durationDays <= 350 ? 98 : 85) * 0.1 +
                                90 * 0.5
                              ));

                              return (
                                <tr key={b.id} className="border-b border-slate-900 text-slate-300">
                                  <td className="p-3 font-semibold text-white">{b.contractorName}</td>
                                  <td className="p-3 font-mono">Rp {b.bidAmount.toLocaleString("id-ID")} <span className="text-[10px] text-emerald-400">({efficiency.toFixed(1)}% hemat)</span></td>
                                  <td className="p-3 text-slate-400 line-clamp-1 max-w-[200px]">{b.executionMethod}</td>
                                  <td className="p-3 font-mono">{b.durationDays} Hari</td>
                                  <td className="p-3 text-center">
                                    <span className="bg-slate-900 border border-slate-800 text-amber-500 font-mono font-black px-2 py-0.5 rounded text-[10px]">
                                      {computedScore || b.evaluationScore} / 100
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    {b.status === "Evaluasi" && (activeRole === "Owner Proyek" || activeRole === "Procurement") ? (
                                      <button
                                        onClick={() => handleAwardBid(b.id, t.id, t.projectId, b.bidAmount)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all"
                                      >
                                        Tunjuk Sebagai Pemenang
                                      </button>
                                    ) : (
                                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                        b.status === 'Menang' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        b.status === 'Evaluasi' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500'
                                      }`}>
                                        {b.status}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* Active Tab: Finance / Termin clearance */}
        {activeTab === "finance" && (
          <div className="space-y-6 text-left">
            
            {/* Active Contracts and e-signing monitor */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800 mb-4.5">
                <Signature className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perjanjian Kontrak EPROC</h3>
              </div>

              {contracts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs text-center border border-dashed border-slate-800 rounded-xl">
                  Belum ada draf kontrak aktif dalam sistem escrow. Selesaikan proses penunjukan pemenang tender di Tab "Tender & Bid".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                  {contracts.map((c) => (
                    <div key={c.id} className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                      
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">No. Registrasi Kontrak:</span>
                          <span className="text-xs font-bold text-white block mt-0.5">{c.contractNumber}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400'
                        }`}>
                          KONTRAK {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed italic">"{c.details}"</p>

                      <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-3 rounded-lg text-xs">
                        <span className="text-slate-500">Nilai Borongan:</span>
                        <span className="font-extrabold text-slate-200 text-right">Rp {c.activeValue.toLocaleString("id-ID")}</span>
                      </div>

                      {/* Signature flows */}
                      <div className="pt-2 border-t border-slate-900 space-y-3.5">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">E-Signature Autentikasi:</span>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          {/* Owner Signature */}
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-center text-xs">
                            <span className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Owner (Proyek)</span>
                            {c.esignedByOwner ? (
                              <div className="text-emerald-400 font-semibold font-mono flex items-center justify-center gap-1.5 pt-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>SIGNED</span>
                              </div>
                            ) : (
                              activeRole === "Owner Proyek" ? (
                                <button
                                  onClick={() => handleSignContract(c.id, "owner")}
                                  className="w-full bg-amber-500 text-slate-950 font-bold py-1.5 rounded text-[10px] mt-1"
                                >
                                  Tandatangan Digital
                                </button>
                              ) : (
                                <span className="text-slate-500 italic block pt-1.5">Awaiting Sign</span>
                              )
                            )}
                          </div>

                          {/* Contractor Signature */}
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-center text-xs">
                            <span className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Utama (Kontraktor)</span>
                            {c.esignedByContractor ? (
                              <div className="text-emerald-400 font-semibold font-mono flex items-center justify-center gap-1.5 pt-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>SIGNED</span>
                              </div>
                            ) : (
                              activeRole === "Kontraktor" ? (
                                <button
                                  onClick={() => handleSignContract(c.id, "contractor")}
                                  className="w-full bg-amber-500 text-slate-950 font-bold py-1.5 rounded text-[10px] mt-1"
                                >
                                  Tandatangan Digital
                                </button>
                              ) : (
                                <span className="text-slate-500 italic block pt-1.5">Awaiting Sign</span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Interactive EPROC QR Codes verified */}
                        {c.esignedByOwner && c.esignedByContractor && (
                          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-dashed border-emerald-500/20 flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center shrink-0">
                              <QrCode className="w-10 h-10 text-slate-950" />
                            </div>
                            <div className="text-[11px] leading-relaxed text-slate-400">
                              <span className="text-emerald-400 font-extrabold block">KONTRAK RESMI AKTIF & LEGAL</span>
                              <span>Pemeriksaan hash SHA-256 terautentikasi oleh LPJK KemenPUPR.</span>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BAST monitoring list */}
            {db.getBasts().length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800 mb-4.5">
                  <FileCheck2 className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Berita Acara Serah Terima (BAST / PHO)</h3>
                </div>

                <div className="space-y-4">
                  {db.getBasts().map((b) => (
                    <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4.5">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">No. Dokumen Serah Terima BAST:</span>
                        <span className="text-sm font-extrabold text-white block mt-0.5">{b.bappNumber}</span>
                        <p className="text-indigo-400 font-semibold mt-1 font-mono">Batas Serah Terima Akhir: {b.date}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {/* Consultant sign co */}
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center w-28">
                          <span className="text-[9px] text-slate-500 block">Konsultan (Superv)</span>
                          {b.consultantSignature ? (
                            <span className="text-emerald-400 font-bold block pt-1 font-mono text-[10px]">VERIFIED</span>
                          ) : activeRole === "Konsultan" ? (
                            <button onClick={() => handleSignBast(b.id, "consultant")} className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 mt-1 rounded text-[9px]">Sign</button>
                          ) : (
                            <span className="text-slate-600 block pt-1">Unsigned</span>
                          )}
                        </div>

                        {/* Owner sign co */}
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center w-28">
                          <span className="text-[9px] text-slate-500 block">Owner (Proyek)</span>
                          {b.ownerSignature ? (
                            <span className="text-emerald-400 font-bold block pt-1 font-mono text-[10px]">VERIFIED</span>
                          ) : activeRole === "Owner Proyek" ? (
                            <button onClick={() => handleSignBast(b.id, "owner")} className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 mt-1 rounded text-[9px]">Sign</button>
                          ) : (
                            <span className="text-slate-600 block pt-1">Unsigned</span>
                          )}
                        </div>

                        {/* Contractor sign co */}
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center w-28">
                          <span className="text-[9px] text-slate-500 block">Kontraktor (Utama)</span>
                          {b.contractorSignature ? (
                            <span className="text-emerald-400 font-bold block pt-1 font-mono text-[10px]">VERIFIED</span>
                          ) : activeRole === "Kontraktor" ? (
                            <button onClick={() => handleSignBast(b.id, "contractor")} className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 mt-1 rounded text-[9px]">Sign</button>
                          ) : (
                            <span className="text-slate-600 block pt-1">Unsigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices list panel */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4.5 block flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Klaim Termin Tagihan Invoice</h3>
                </div>

                {(activeRole === "Kontraktor" || activeRole === "Subkontraktor") && (
                  <button
                    onClick={() => {
                      if (contracts.length > 0) {
                        setSelectedContractForInvoice(contracts[0]);
                        setShowNewInvoiceModal(true);
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all"
                  >
                    Ajukan Invoice Baru
                  </button>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900 text-slate-400 text-left">
                      <th className="p-3">No. Invoice Tagihan</th>
                      <th className="p-3">Angsuran Termin</th>
                      <th className="p-3">Nilai Tagihan Pokok</th>
                      <th className="p-3">PPN (11%)</th>
                      <th className="p-3">Status Pencairan</th>
                      <th className="p-3 text-right">Tindakan Keuangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-900 text-slate-300">
                        <td className="p-3 font-semibold text-white font-mono">{inv.invoiceNumber}</td>
                        <td className="p-3">Termin {inv.termNumber} (Angsuran)</td>
                        <td className="p-3 font-mono">Rp {inv.amount.toLocaleString("id-ID")}</td>
                        <td className="p-3 font-mono text-slate-400">Rp {inv.tax.toLocaleString("id-ID")}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            inv.status === 'Dibayar' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            inv.status === 'Disetujui' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            inv.status === 'Diverifikasi' ? 'bg-indigo-505 bg-indigo-550' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {/* Finance flow triggers */}
                          {activeRole === "Finance" && inv.status === "Menunggu" && (
                            <button
                              onClick={() => db.verifyInvoice(inv.id, "Disetujui")}
                              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-[10px] px-3 py-1.5 rounded transition-all mr-2"
                            >
                              Verifikasi Berkas
                            </button>
                          )}
                          
                          {activeRole === "Finance" && inv.status === "Disetujui" && (
                            <button
                              onClick={() => db.payInvoice(inv.id, "Bank Mandiri Escrow", "124-0012091-0")}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-3.5 py-1.5 rounded transition-all"
                            >
                              Cairkan Transfer Bank
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Active Tab: Auditor Access controls */}
        {activeTab === "audits" && (
          <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl text-left space-y-4">
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800">
              <History className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Aktivitas Kronologis Platform (Audit Trail)</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Sesuai standar operasional Audit Internal Indonesia (BPK RI / BPKP), semua aktivitas login, perubahan termin keuangan, penatapan pemenang tender, penetapan sanksi K3, tercatat secara kronologis. Log tidak dapat dihapus, ditimpa, atau dinonaktifkan (Immutable Ledger).
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden font-mono text-[11px] text-slate-300">
              <div className="grid grid-cols-4 bg-slate-900 border-b border-slate-850 p-2.5 text-slate-400 font-bold text-[10px]">
                <div>WAKTU (WITA/WIB)</div>
                <div>PELAKU LOG</div>
                <div>AKSI SISTEM</div>
                <div>RINCIAN OPERASI</div>
              </div>
              <div className="divide-y divide-slate-850 max-h-[400px] overflow-y-auto">
                {audits.map((a) => (
                  <div key={a.id} className="grid grid-cols-4 p-2.5 hover:bg-slate-900/40 transition-all">
                    <div className="text-slate-400">{new Date(a.timestamp).toLocaleString("id-ID")}</div>
                    <div className="font-semibold text-white">{a.userName}</div>
                    <div className="text-amber-500">{a.action}</div>
                    <div className="text-slate-300 truncate" title={a.details}>{a.details}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating AI Procurement Assistant Assistant */}
      <AIAssistant dbContext={{ projects, tenders, bids, invoices, contractors }} />

      {/* FOOTER credit */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} FORSDIG E-PROC KONTRAKTOR &bull; Sistem Terintegrasi Sesuai Aturan LPJK RI.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-600">Enterprise Edition v3.5.4 &bull; Sandboxed Container Host Ingress SSL Verified</p>
      </footer>

      {/* MODAL 1: ADD PROJECT */}
      {showNewProjModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-left space-y-4 font-sans animate-zoomIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tambah Proyek Infrastruktur</h3>
            <form onSubmit={handleCreateProject} className="space-y-4.5">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Kode Identitas Proyek</label>
                <input
                  type="text"
                  value={newProjCode}
                  onChange={(e) => setNewProjCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nama Pekerjaan Sipil</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="cth: Pembangunan Jembatan Layang"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Provinsi Lokasi Pembangunan</label>
                <input
                  type="text"
                  value={newProjLocation}
                  onChange={(e) => setNewProjLocation(e.target.value)}
                  placeholder="cth: Bandung, Jawa Barat"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nilai Pagu (Rupiah)</label>
                <input
                  type="number"
                  value={newProjBudget}
                  onChange={(e) => setNewProjBudget(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjModal(false)}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TENDER */}
      {showNewTenderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-left space-y-4 font-sans animate-zoomIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Umumkan Tender Konstruksi</h3>
            <form onSubmit={handleCreateTender} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Pilih Target Proyek</label>
                <select
                  value={selectedProjForTender}
                  onChange={(e) => setSelectedProjForTender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Hubungkan dengan Proyek --</option>
                  {projects.filter(p => p.status === 'Planning').map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Rp {p.budget.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nama Judul Tender Pengadaan</label>
                <input
                  type="text"
                  value={newTenderTitle}
                  onChange={(e) => setNewTenderTitle(e.target.value)}
                  placeholder="cth: Pekerjaan Struktur Beton Pile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Rincian Deskripsi Teknis Kerja</label>
                <textarea
                  rows={3}
                  value={newTenderDesc}
                  onChange={(e) => setNewTenderDesc(e.target.value)}
                  placeholder="Detail rks umum, boq, uji mutu beton cor K-350..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Metode Pemilihan Pengadaan</label>
                <select
                  value={newTenderType}
                  onChange={(e) => setNewTenderType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Tender Terbuka">Tender Terbuka (Publik Nasional)</option>
                  <option value="Tender Terbatas">Tender Terbatas (Daftar Vendor)</option>
                  <option value="Penunjukan Langsung">Penunjukan Langsung (Darurat / Khusus)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTenderModal(false)}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Publish Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD BID PENAWARAN */}
      {showNewBidModal && selectedTenderForBid && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-left space-y-4 font-sans animate-zoomIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kirim Penawaran Komersial</h3>
            <p className="text-[11px] text-slate-400">Tender: <strong>{selectedTenderForBid.title}</strong> &bull; HPS: Rp {selectedTenderForBid.hpsBudget.toLocaleString()}</p>
            <form onSubmit={handleCreateBid} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nilai Penawaran Harga (Rupiah)</label>
                <input
                  type="number"
                  value={newBidAmount}
                  onChange={(e) => setNewBidAmount(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Estimasi Target Penyelesaian (Hari)</label>
                <input
                  type="number"
                  value={newBidDays}
                  onChange={(e) => setNewBidDays(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Klausul Deklarasi Pelaksanaan Teknis</label>
                <textarea
                  rows={2}
                  value={newBidMethod}
                  onChange={(e) => setNewBidMethod(e.target.value)}
                  placeholder="Rincian alokasi alat berat, koordinat batching plant pendukung..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBidModal(false)}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Submit Penawaran (Bid)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD INVOICE */}
      {showNewInvoiceModal && selectedContractForInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-left space-y-4 font-sans animate-zoomIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajukan Invoice Termin Baru</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Pilih Target Angsuran Termin</label>
                <select
                  value={newInvoiceTerm}
                  onChange={(e) => setNewInvoiceTerm(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value={1}>Termin 1 - Uang Muka Mandiri (25%)</option>
                  <option value={2}>Termin 2 - Kemajuan Kerja 50% (25%)</option>
                  <option value={3}>Termin 3 - Kemajuan Kerja 75% (25%)</option>
                  <option value={4}>Termin Final - Serah Terima PHO (25%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Besaran Nilai Tagihan Pokok (Rupiah)</label>
                <input
                  type="number"
                  value={newInvoiceAmount}
                  onChange={(e) => setNewInvoiceAmount(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Kirim Klaim Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SUBMIT BAST */}
      {showNewBastModal && selectedProjForBast && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-left space-y-4 font-sans animate-zoomIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajukan Sertifikat Serah Terima (BAST)</h3>
            <p className="text-xs text-slate-400">Proyek: <strong>{selectedProjForBast.name}</strong></p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                db.addBast({
                  projectId: selectedProjForBast.id,
                  bidId: "bid-ikn-drainage",
                  bappNumber: newBappNumber,
                  date: new Date().toISOString().slice(0, 10),
                  ownerSignature: "SIGNED - Dharmawan Wijaya",
                  contractorSignature: "",
                  consultantSignature: ""
                });
                setShowNewBastModal(false);
                reloadData();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nomor Surat BAPP Resmi</label>
                <input
                  type="text"
                  value={newBappNumber}
                  onChange={(e) => setNewBappNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBastModal(false)}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Ajukan Berkas Serah Terima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DOCUMENT PREVIEW MODAL */}
      {selectedTenderForPreview && previewDocType && (
        <DocumentPreviewModal
          tender={selectedTenderForPreview}
          docType={previewDocType}
          onClose={() => {
            setSelectedTenderForPreview(null);
            setPreviewDocType(null);
          }}
        />
      )}

    </div>
  );
}
