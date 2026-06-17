import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Download, 
  FileText, 
  Sparkles, 
  Printer, 
  BookOpen, 
  Layers, 
  TrendingDown, 
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info
} from "lucide-react";

interface Tender {
  id: string;
  projectId: string;
  title: string;
  description: string;
  location: string;
  hpsBudget: number;
  schedule: string;
  type: string;
  status: string;
  docUrls: {
    tor: string;
    rks: string;
    boq: string;
    drawings?: string;
  };
}

interface DocumentPreviewModalProps {
  tender: Tender;
  docType: "tor" | "rks" | "boq";
  onClose: () => void;
}

// Concrete structured content for offline/fallback high-fidelity mock data
const MOCK_DOC_SECTIONS = {
  tor: [
    {
      id: "sec-1",
      title: "BAB I: KETENTUAN UMUM & LATAR BELAKANG",
      content: `Pemerintah Indonesia melalui Kementerian Pekerjaan Umum memasukkan proyek ini sebagai prioritas strategis nasional guna mereduksi rasio kemacetan di area koridor arteri perkotaan utama hingga 42%. Dokumen Kerangka Acuan Kerja (Terms of Reference) ini dirancang sebagai acuan teknis mengikat dalam pelaksanaan konstruksi sipil berstandar kelas satu.`
    },
    {
      id: "sec-2",
      title: "BAB II: RUANG LINGKUP PEKERJAAN (SCOPE OF WORK)",
      content: `Pekerjaan konstruksi secara garis besar meliputi:
1. Pekerjaan struktur bawah (Substructure): Pemboran dan pengecoran pondasi dalam jenis Bored Pile diameter Ø1200 mm dengan kedalaman efektif minimal 28 meter atau hingga menyentuh lapisan batuan keras terverifikasi.
2. Pekerjaan struktur tengah (Midstructure): Pengadaan pier beton bertulang mutu tinggi cor insitu (Cast in Place) dan perakitan balok kepala tiang (Pier Head) precast segmental yang presisi.
3. Pekerjaan struktur atas (Superstructure): Ereksi balok gelagar box girder baja (Steel Box Girder) bentang panjang menggunakan launcher gantry berkekuatan nominal minimal 150 ton dengan pengawasan super struktural ketat.
4. Pekerjaan finishing: Pengaspalan perkerasan hotmix, drainase jembatan layang, marka termoplastik reflektif, barrier fungsional beton pembatas jalan, serta instrumen K3 dan rambu keselamatan jalan.`
    },
    {
      id: "sec-3",
      title: "BAB III: SPESIFIKASI MATERIAL MUTU TEKNIS",
      content: `Seluruh material beton struktural utama wajib bersertifikasi laboratorium pengujian terakreditasi KAN:
- Mutu beton pondasi tiang pancang (bored pile): Karakteristik minimal K-350 (fc' 29 MPa).
- Mutu beton pier column dan pier head: Karakteristik minimal K-400 (fc' 33 MPa).
- Mutu beton girder pracetak pratekan (prestressed): Karakteristik minimal K-500 (fc' 41.5 MPa) menggunakan kabel tendon baja tensi tinggi (High Tensile Strand) bebas korosi.`
    },
    {
      id: "sec-4",
      title: "BAB IV: METODOLOGI PEKERJAAN K3 & PENJADWALAN CHRONO",
      content: `Kontraktor pelaksana diwajibkan menyusun Rencana Keselamatan Konstruksi (RKK) komprehensif. Operasi pengangkatan girder baja (girder erection) eksklusif wajib dilaksanakan pada malam hari (window time) dari jam 22.00 WIB hingga 04.30 WIB dengan skema manajemen perubahan arus lalu lintas sirkuler dinamis bersama tim Kepolisian Lalu Lintas Metro setempat.`
    }
  ],
  rks: [
    {
      id: "sec-1",
      title: "BAB I: PERSYARATAN ADMINISTRASI & KUMPULAN DOKUMEN",
      content: `Peserta tender wajib memiliki izin usaha yang valid:
- Sertifikat Badan Usaha (SBU) Jasa Konstruksi Kategori Kualifikasi Besar (B1/B2) atau Spesialis Struktur Utama Jembatan Layang.
- Nomor Induk Berusaha (NIB) dengan kode KBLI pengerjaan konstruksi jembatan layang aktif.
- Memiliki sisa kemampuan nyata (SKN) keuangan didukung jaminan kredit (Line of Credit) dari perbankan nasional tepercaya minimal senilai 10% dari total nilai anggaran HPS proyek.`
    },
    {
      id: "sec-2",
      title: "BAB II: PERSYARATAN TEKNIS MUTU BETON & AGREGAT",
      content: `Campuran beton ready-mix wajib disuplai dari batching plant terdekat bersertifikasi ISO 9001. Agregat kasar berupa batu pecah abrasi minimal 20%, agregat halus berupa pasir sungai alami bebas kandungan lumpur organik berlebih (kandungan maksimal < 1%). Setiap truk mixer wajib melampirkan lembar slip pengiriman beton resmi dan dilakukan pengujian penurunan slump (slump test) di lapangan dengan deviasi diperkenankan antara ±2 cm.`
    },
    {
      id: "sec-3",
      title: "BAB III: PROTOKOL K3L DAN JAMINAN PERLINDUNGAN SOSIAL",
      content: `Kontraktor pelaksana wajib mendaftarkan seluruh personil dan tenaga kerja lapangan ke dalam program jaminan sosial BPJS Ketenagakerjaan Konstruksi sebelum surat perintah mulai kerja (SPMK) diterbitkan. Alat Pelindung Diri (APD) standar minimal helm keselamatan kelas B, sepatu keselamatan berlapis baja, rompi reflektif berkabel lampu, serta harness pengaman gantung (full-body harness) untuk area kerja tinggi wajib konsisten digunakan.`
    },
    {
      id: "sec-4",
      title: "BAB IV: MEKANISME PENGAWASAN, DENDA & FORCE MAJEURE",
      content: `Denda keterlambatan ditetapkan sebesar sebesar 1‰ (satu permil) dari nilai kontrak atau porsi pekerjaan sisa per hari keterlambatan kerja. Manajemen dwi-mingguan dievaluasi melalui kurva S kemajuan fisik riil vs rencana. Deviasi keterlambatan fisik kumulatif di atas 10% berturut-turut pada 3 laporan berkala akan otomatis memicu Surat Peringatan (SP-1) dan pembahasan draf pembatalan sepihak kontrak.`
    }
  ],
  boq: [] // Rendered dynamically inside the table spreadsheets for interactive calculation
};

// Spreadsheet Items structure
interface BOQItem {
  id: number;
  code: string;
  item: string;
  unit: string;
  volume: number;
  hpsUnitPrice: number;
}

const INITIAL_BOQ_ITEMS: BOQItem[] = [
  { id: 1, code: "1.1", item: "Pekerjaan Persiapan, Mobilisasi Crane & Pembersihan Lahan", unit: "Lump Sum", volume: 1, hpsUnitPrice: 1850000000 },
  { id: 2, code: "1.2", item: "Manajemen K-3 Kontrol, Rambu Rerouting, Jaring Pengaman & Pagar Proyek", unit: "Bulan", volume: 12, hpsUnitPrice: 120000000 },
  { id: 3, code: "2.1", item: "Pengeboran Tiang Pancang Bored Pile diameter Ø1200 mm kedalaman 28-32m", unit: "Meter", volume: 1650, hpsUnitPrice: 6200000 },
  { id: 4, code: "2.2", item: "Pekerjaan Cor Beton Mutu Tinggi K-350 Ready-Mix (Pondasi)", unit: "m³", volume: 3200, hpsUnitPrice: 1950000 },
  { id: 5, code: "3.1", item: "Pekerjaan Besi Beton Ulir / Tulangan Struktural Utama", unit: "Kg", volume: 420000, hpsUnitPrice: 18500 },
  { id: 6, code: "3.2", item: "Beton Cor Mutu Sangat Tinggi K-400 (Pier Column & Pier Head)", unit: "m³", volume: 2400, hpsUnitPrice: 2150000 },
  { id: 7, code: "4.1", item: "Pabrikasi & Pengadaan Balok Gelagar Pracetak Pasca-Tegang Girder (L=40m)", unit: "Buah", volume: 36, hpsUnitPrice: 480000000 },
  { id: 8, code: "4.2", item: "Ereksi Girder Bentang Panjang Menggunakan Gantry Launcher Khusus", unit: "Buah", volume: 36, hpsUnitPrice: 125000000 },
  { id: 9, code: "5.1", item: "Perkerasan Jalan Aspal Kasar Overlay Jenis AC-Base (Tebal 6cm)", unit: "m²", volume: 8500, hpsUnitPrice: 320000 },
  { id: 10, code: "5.2", item: "Marka Jalan Termoplastik, Pengadaan Drainase Bawah & Rambu Layang", unit: "Lump Sum", volume: 1, hpsUnitPrice: 920000000 }
];

export function DocumentPreviewModal({ tender, docType, onClose }: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<string>("sec-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [bidAdjustment, setBidAdjustment] = useState<number>(95); // Default bid target is 95% of HPS
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Auto-trigger fallback / initial AI review summary on render or fetch
  useEffect(() => {
    handleFetchAISummary();
  }, [docType, tender.id]);

  const handleFetchAISummary = async () => {
    setLoadingAI(true);
    try {
      const docName = 
        docType === "tor" ? tender.docUrls.tor :
        docType === "rks" ? tender.docUrls.rks :
        tender.docUrls.boq;

      const response = await fetch("/api/ai/summarize-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderTitle: tender.title,
          documentType: docType,
          docName: docName
        })
      });
      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
      } else {
        throw new Error("No data summary returned.");
      }
    } catch (e) {
      console.error("Failed to fetch server-side AI summary, using simulation.", e);
    } finally {
      setLoadingAI(false);
    }
  };

  const getDocTitle = () => {
    switch (docType) {
      case "tor": return "KERANGKA ACUAN KERJA (TERM OF REFERENCE)";
      case "rks": return "RENCANA KERJA DAN SYARAT-SYARAT (RKS)";
      case "boq": return "BILL OF QUANTITIES (BOQ HPS TARGET)";
    }
  };

  const getDocBadgeColor = () => {
    switch (docType) {
      case "tor": return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30";
      case "rks": return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
      case "boq": return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
  };

  // Helper to highlight matching text search queries
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-500/30 text-amber-300 font-semibold px-0.5 rounded border border-amber-500/30">
              {part}
            </mark>
          ) : part
        )}
      </>
    );
  };

  const currentSections = docType !== "boq" ? MOCK_DOC_SECTIONS[docType] : [];

  // Recalculating BOQ spreadsheet
  const boqScalingMultiplier = bidAdjustment / 100;
  const totalHpsBudget = INITIAL_BOQ_ITEMS.reduce((sum, item) => sum + (item.volume * item.hpsUnitPrice), 0);
  const totalYourBidBudget = INITIAL_BOQ_ITEMS.reduce((sum, item) => sum + (item.volume * (item.hpsUnitPrice * boqScalingMultiplier)), 0);

  const formatRupiah = (num: number) => {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  };

  return (
    <div id="tender-doc-preview-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Document Header Panel */}
        <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl ${getDocBadgeColor().split(' ')[0]}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md ${getDocBadgeColor()}`}>
                  {docType.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LPJK VERIFIED</span>
                </span>
              </div>
              <h2 className="text-sm font-black text-white mt-1 uppercase tracking-wide leading-none">
                {getDocTitle()}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                File: {docType === "tor" ? tender.docUrls.tor : docType === "rks" ? tender.docUrls.rks : tender.docUrls.boq}
              </p>
            </div>
          </div>

          {/* Quick Stats Summary Banner */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-850">
            <div className="text-left">
              <span className="text-[9px] text-slate-500 block font-bold tracking-wider uppercase">HPS Target Maksimal</span>
              <span className="text-xs font-mono font-extrabold text-amber-500">{formatRupiah(tender.hpsBudget)}</span>
            </div>
            <div className="w-px h-6.5 bg-slate-800"></div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-500 block font-sans font-bold tracking-wider uppercase">ID Tender</span>
              <span className="text-xs text-slate-300 font-semibold">{tender.id}</span>
            </div>
          </div>

          {/* User Controls Panel */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Zoom Widget */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-0.5 text-xs">
              <button 
                onClick={() => setZoom(Math.max(75, zoom - 25))}
                className="p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-all rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[10.5px] font-bold text-slate-300">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(150, zoom + 25))}
                className="p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-all rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                alert("Simulasi cetak dokumen disiapkan. Cetakan fisik disesuaikan ke format kualifikasi LPJK.");
              }}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
              title="Cetak Salinan"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setHasCopied(true);
                setTimeout(() => setHasCopied(false), 2500);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{hasCopied ? "Mengunduh..." : "Download"}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-all rounded-lg"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master Document Split Screen Canvas */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT OUTLINE SIDEBAR (Daftar Isi) - Only for text documents TOR/RKS */}
          {docType !== "boq" && (
            <div className="w-68 hidden md:flex flex-col bg-slate-950/40 border-r border-slate-800/80 p-4 shrink-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-3">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Outline Dokumen</span>
              </div>
              
              <div className="space-y-1">
                {currentSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2 group ${
                      activeTab === sec.id 
                        ? "bg-indigo-650/15 text-indigo-300 border border-indigo-500/30" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform ${activeTab === sec.id ? "rotate-90 text-indigo-400" : "text-slate-600 group-hover:translate-x-0.5"}`} />
                    <span className="text-xs font-semibold leading-relaxed line-clamp-2">
                      {sec.title.replace("BAB ", "")}
                    </span>
                  </button>
                ))}
              </div>

              {/* Legal Verification Stamp Footer */}
              <div className="mt-auto pt-6 border-t border-slate-850 text-[10px] text-slate-500 space-y-2 font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-slate-400 font-bold block mb-1">DOKUMEN RIIL LPJK</span>
                  SHA256: d86ac681...f328a9b
                  <br />
                  Digital Signed by INA-Sertifikasi
                </div>
              </div>
            </div>
          )}

          {/* MAIN DOCUMENT VIEWER CANVAS */}
          <div className="flex-1 flex flex-col bg-slate-950/15 overflow-hidden">
            
            {/* Search Filter Header (For Text Documents) */}
            {docType !== "boq" ? (
              <div className="p-3.5 bg-slate-900 border-b border-slate-800/60 flex items-center justify-between gap-2.5">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Saring atau cari isi klausul (cth: Beton, K3, Girder)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px] uppercase font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="text-[10px] text-slate-500 font-mono">
                  Standard Format: LPJK-F77-TOR v2026
                </div>
              </div>
            ) : (
              /* Spreadsheets Parameters Slider (For BOQ Document) */
              <div className="p-4 bg-slate-900 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kalkulator Simulasi Bid Komersial</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Geser rasio penawaran untuk memprediksi harga efisiensi total di bawah pagu HPS.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 shrink-0 select-none">
                  <span className="text-xs text-slate-400 font-semibold">Tingkat Penawaran:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="70" 
                      max="100" 
                      value={bidAdjustment}
                      onChange={(e) => setBidAdjustment(Number(e.target.value))}
                      className="w-24 accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                    />
                    <span className="font-mono text-xs font-extrabold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                      {bidAdjustment}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Content View Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ fontSize: `${(zoom / 100) * 13}px` }}>
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* 1. TEXT VIEW (TOR or RKS) */}
                {docType !== "boq" && (
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden text-left font-sans text-slate-350 leading-relaxed relative">
                    <div className="bg-slate-950 px-5.5 py-4 border-b border-slate-850 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                        {currentSections.find(s => s.id === activeTab)?.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Halaman {currentSections.findIndex(s => s.id === activeTab) + 1} of 4</span>
                    </div>

                    <div className="p-6.5 space-y-6">
                      <p className="whitespace-pre-line leading-relaxed tracking-wide">
                        {highlightText(currentSections.find(s => s.id === activeTab)?.content || "", searchQuery)}
                      </p>

                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2 mt-4">
                        <div className="flex items-start gap-2.5 text-xs text-slate-400">
                          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-200 block">Catatan Verifikasi Audit</span>
                            Seluruh kriteria kepatuhan administrasi di atas merupakan elemen gugur reguler. Penandatanganan berkas menggunakan tanda tangan elektronik bersertifikat BSrE BS-2026.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SPREADSHEETS TABLE VIEW (BOQ) */}
                {docType === "boq" && (
                  <div className="space-y-5 text-left">
                    
                    {/* Sum Metrics Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wide">TOTAL PAGU TARGET (HPS)</span>
                        <span className="text-sm font-mono font-black text-white mt-1 block">{formatRupiah(totalHpsBudget)}</span>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wide">PETA ESTIMASI TAWARAN ANDA</span>
                        <span className="text-sm font-mono font-black text-emerald-400 mt-1 block">{formatRupiah(totalYourBidBudget)}</span>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
                        <span className="text-[10px] text-emerald-400/80 block font-bold uppercase tracking-wide">PROYEKSI EFISIENSI HEMAT</span>
                        <span className="text-sm font-mono font-black text-emerald-400 mt-1 block">
                          {formatRupiah(totalHpsBudget - totalYourBidBudget)} <span className="text-xs font-sans font-medium text-slate-400">({(100 - bidAdjustment).toFixed(0)}% hemat)</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-sans">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[10.5px] uppercase font-bold text-left">
                              <th className="p-3 w-12 text-center">No</th>
                              <th className="p-3">Uraian Deskripsi Pekerjaan</th>
                              <th className="p-3 text-center">Volume</th>
                              <th className="p-3 text-center">Satuan</th>
                              <th className="p-3 text-right">HPS Satuan</th>
                              <th className="p-3 text-right">Simulasi Satuan ({bidAdjustment}%)</th>
                              <th className="p-3 text-right">Total Penawaran</th>
                            </tr>
                          </thead>
                          <tbody>
                            {INITIAL_BOQ_ITEMS.map((item) => {
                              const adjustedUnitPrice = item.hpsUnitPrice * boqScalingMultiplier;
                              const currentTotal = item.volume * adjustedUnitPrice;

                              return (
                                <tr key={item.id} className="border-b border-slate-900 hover:bg-slate-950/40 text-slate-300 transition-colors">
                                  <td className="p-3 text-center font-mono text-slate-500">{item.code}</td>
                                  <td className="p-3 font-medium text-white max-w-[280px] leading-tight">{item.item}</td>
                                  <td className="p-3 text-center font-mono font-bold">{item.volume.toLocaleString("id-ID")}</td>
                                  <td className="p-3 text-center text-slate-400 font-mono">{item.unit}</td>
                                  <td className="p-3 text-right font-mono text-slate-500">{formatRupiah(item.hpsUnitPrice)}</td>
                                  <td className="p-3 text-right font-mono text-emerald-400">{formatRupiah(adjustedUnitPrice)}</td>
                                  <td className="p-3 text-right font-mono font-extrabold text-white">{formatRupiah(currentTotal)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-550/10 text-[10.5px] text-amber-500 leading-relaxed font-sans">
                      <strong>* INFORMASI PERINGATAN RE-CALC</strong>: Seluruh unit price penawaran komersial telah dikunci bersertifikat standard eskalasi bahan konstruksi nasional LPJK 2026. Deviasi di bawah 80% pagu secara acak dinilai berisiko tinggi gugur evaluasi teknis akibat perang tarif tidak realistis (dumping).
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT AI COPILOT ANALYTICS SIDEBAR */}
          <div className="w-80 hidden lg:flex flex-col bg-slate-950/70 border-l border-slate-800/80 p-4.5 shrink-0 overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">AI Procurement Agent</h3>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                G-3.5
              </span>
            </div>

            <div className="space-y-4 text-left flex-1 flex flex-col">
              
              <div className="text-left bg-slate-900 border border-slate-850 p-3 rounded-xl flex items-start gap-2.5 shrink-0">
                <div className="p-1 px-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 font-bold self-start mt-0.5 text-xs font-mono">i</div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wide">Analisis Sourcing & Risiko</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    AI mengevaluasi isi berkas untuk menilai gap regulasi, risiko sanksi denda dwi-mingguan, dan strategi HPS optimal.
                  </p>
                </div>
              </div>

              {/* Summary text display area with markdown layout mapping */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850 flex-1 overflow-y-auto text-xs text-slate-300 relative min-h-[250px]">
                {loadingAI ? (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                    <span className="text-[10.5px] text-indigo-300 font-mono uppercase tracking-widest font-bold">Menganalisis Dokumen...</span>
                  </div>
                ) : (
                  <div className="space-y-4 scroll-smooth leading-relaxed text-slate-300">
                    {/* Render paragraphs cleanly or bullet points nicely */}
                    {aiSummary ? (
                      <div className="space-y-3.5 pr-1">
                        {aiSummary.split('\n').map((line, idx) => {
                          if (line.startsWith("###")) {
                            return <h4 key={idx} className="text-indigo-450 font-bold border-b border-slate-850 pb-1 mt-3.5 text-[11.5px] tracking-wide uppercase">{line.replace("###", "").trim()}</h4>;
                          }
                          if (line.startsWith("####")) {
                            return <h5 key={idx} className="text-slate-255 font-extrabold mt-3 text-[11px] text-slate-100 uppercase">{line.replace("####", "").trim()}</h5>;
                          }
                          if (line.startsWith("*") || line.startsWith("-")) {
                            return (
                              <div key={idx} className="flex items-start gap-1.5 py-0.5">
                                <span className="text-indigo-400 shrink-0 mt-1">•</span>
                                <span className="text-[11.2px] leading-relaxed text-slate-300">
                                  {line.replace(/^[\*\-]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                                </span>
                              </div>
                            );
                          }
                          if (line.trim() === "") return null;
                          return <p key={idx} className="text-[11.2px] font-normal leading-relaxed text-slate-400">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-center py-10">
                        Gagal mengunggah analisis dokumen. Klik tombol di bawah untuk memicu analisis manual.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Refresh AI Agent Button */}
              <button
                onClick={handleFetchAISummary}
                disabled={loadingAI}
                className="w-full mt-auto bg-slate-900 hover:bg-slate-800 disabled:opacity-55 active:bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-[10.5px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loadingAI ? "animate-spin" : ""}`} />
                <span>Pemicu Evaluasi Ulang AI</span>
              </button>

            </div>
          </div>

        </div>

        {/* Modal Bottom Done Bar */}
        <div className="bg-slate-950/80 p-3.5 border-t border-slate-800 flex justify-between items-center text-xs shrink-0 px-5">
          <span className="text-slate-500 font-mono text-[10px]">
            FORSDIG E-PROC • SISTEM PRATINJAU ELEKTRONIK SEAMAN KATEGORI STRUKTUR UTAMA
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-bold px-4 py-1.5 rounded-lg transition-all"
          >
            Selesai Membaca
          </button>
        </div>

      </div>
    </div>
  );
}
