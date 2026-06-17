/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db as firestoreDb } from "./firebase";
import { collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";

import {
  UserProfile,
  Contractor,
  ContractorReview,
  ContractorDocument,
  ContractorStaff,
  ContractorEquipment,
  Project,
  Tender,
  Bid,
  Contract,
  ProgressReport,
  Bast,
  Invoice,
  Payment,
  SystemNotification,
  AuditLog,
  UserRole,
  ContractorStatus,
  InvoiceStatus
} from "../types";

// Seed Data
const INITIAL_USERS: UserProfile[] = [
  {
    uid: "user-super-admin",
    email: "admin@forsdig.id",
    role: "Super Admin",
    name: "Ir. H. Budi Santoso",
    phone: "+62 811-2345-678",
    companyName: "FORSDIG Indonesia",
    verified: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    uid: "user-owner",
    email: "payrayadev@gmail.com", // Match the current active user for standard auth
    role: "Owner Proyek",
    name: "Dharmawan Wijaya",
    phone: "+62 812-3456-7890",
    companyName: "PT Pembangunan Nusantara TBK",
    verified: true,
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z"
  },
  {
    uid: "user-procurement",
    email: "procurement@nusantara.id",
    role: "Procurement",
    name: "Rian Hermawan",
    phone: "+62 813-9876-5432",
    companyName: "PT Pembangunan Nusantara TBK",
    verified: true,
    createdAt: "2026-01-11T00:00:00Z",
    updatedAt: "2026-01-11T00:00:00Z"
  },
  {
    uid: "user-pm",
    email: "pm@nusantara.id",
    role: "Project Manager",
    name: "Hendrik Gunawan",
    phone: "+62 815-4433-2211",
    companyName: "PT Pembangunan Nusantara TBK",
    verified: true,
    createdAt: "2026-01-12T00:00:00Z",
    updatedAt: "2026-01-12T00:00:00Z"
  },
  {
    uid: "user-finance",
    email: "finance@nusantara.id",
    role: "Finance",
    name: "Siska Amelia, S.E.",
    phone: "+62 819-7788-9900",
    companyName: "PT Pembangunan Nusantara TBK",
    verified: true,
    createdAt: "2026-01-13T00:00:00Z",
    updatedAt: "2026-01-13T00:00:00Z"
  },
  {
    uid: "user-contractor-1",
    email: "contractor1@wijaya-karya.id",
    role: "Kontraktor",
    name: "Ir. Ahmad Fauzi",
    phone: "+62 821-5566-7788",
    companyName: "PT Wijaya Karya Prakasa",
    verified: true,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z"
  },
  {
    uid: "user-contractor-2",
    email: "contractor2@adhikarya.id",
    role: "Kontraktor",
    name: "Hendra Saputra",
    phone: "+62 822-1122-3344",
    companyName: "PT Adhi Jaya Konstruksi",
    verified: true,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z"
  },
  {
    uid: "user-subcon",
    email: "subcon@spesialis.id",
    role: "Subkontraktor",
    name: "Taufik Hidayat",
    phone: "+62 856-7890-1234",
    companyName: "PT Pondasi Pancang Megah",
    verified: true,
    createdAt: "2026-01-16T00:00:00Z",
    updatedAt: "2026-01-16T00:00:00Z"
  },
  {
    uid: "user-consultant",
    email: "consultant@indoconsult.id",
    role: "Konsultan",
    name: "Prof. Dr. Ir. H. M. Syarif",
    phone: "+62 811-9988-7766",
    companyName: "PT Indo Pratama Konsultan",
    verified: true,
    createdAt: "2026-01-17T00:00:00Z",
    updatedAt: "2026-01-17T00:00:00Z"
  },
  {
    uid: "user-auditor",
    email: "auditor@bpk-ri.id",
    role: "Auditor",
    name: "Drs. Bambang Hariyadi, M.Ak.",
    phone: "+62 812-7777-8888",
    companyName: "Badan Pemeriksa Keuangan",
    verified: true,
    createdAt: "2026-01-18T00:00:00Z",
    updatedAt: "2026-01-18T00:00:00Z"
  }
];

const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: "user-contractor-1",
    name: "PT Wijaya Karya Prakasa",
    nib: "9120301410294",
    npwp: "01.234.567.8-012.000",
    sbu: "BG009 (Jasa Konstruksi Gedung Kesehatan)",
    siujk: "1-12001-91203-0141",
    address: "Jl. DI Panjaitan Kav. 10",
    city: "Jakarta Timur",
    province: "DKI Jakarta",
    pic: "Ir. Ahmad Fauzi",
    email: "contractor1@wijaya-karya.id",
    whatsapp: "+62 821-5566-7788",
    website: "https://wijaya-karya-prakasa.co.id",
    logo: "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&h=120&q=80",
    cover: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&h=300&q=80",
    companyProfile: "PT Wijaya Karya Prakasa adalah perusahaan kontraktor umum nasional kelas kualifikasi besar (B1) dengan pengalaman lebih dari 15 tahun di bidang infrastruktur sipil, jembatan, bandar udara, dan proyek gedung bertingkat tinggi.",
    yearFounded: 2011,
    employeeCount: 450,
    rating: 4.8,
    ratingCount: 12,
    status: "Verified",
    score: 92, // Experience (25), Legal (15), Financial (15), Experts (15), Equipments (12), etc.
    createdAt: "2026-01-14T00:00:00Z"
  },
  {
    id: "user-contractor-2",
    name: "PT Adhi Jaya Konstruksi",
    nib: "8120401210211",
    npwp: "02.345.678.9-021.000",
    sbu: "SI001 (Jasa Konstruksi Saluran Air, Irigasi)",
    siujk: "1-21010-81204-0121",
    address: "Jl. Jend. Sudirman No. 86",
    city: "Surabaya",
    province: "Jawa Timur",
    pic: "Hendra Saputra",
    email: "contractor2@adhikarya.id",
    whatsapp: "+62 822-1122-3344",
    website: "https://adhijayakonstruksi.com",
    logo: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=120&h=120&q=80",
    cover: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&h=300&q=80",
    companyProfile: "PT Adhi Jaya Konstruksi bergerak dalam pembangunan jalan tol, pengerukan pelabuhan, sistem pengairan bendungan, serta penataan kawasan industri strategis di bagian timur Indonesia.",
    yearFounded: 2014,
    employeeCount: 320,
    rating: 4.6,
    ratingCount: 8,
    status: "Verified",
    score: 85,
    createdAt: "2026-01-15T00:00:00Z"
  },
  {
    id: "user-subcon",
    name: "PT Pondasi Pancang Megah",
    nib: "7126102213190",
    npwp: "03.456.789.0-032.000",
    sbu: "SP002 (Pekerjaan Pondasi Spesialis Borepile)",
    siujk: "1-32002-71261-0221",
    address: "Kawasan Industri MM2100 Blok C-2",
    city: "Bekasi",
    province: "Jawa Barat",
    pic: "Taufik Hidayat",
    email: "subcon@spesialis.id",
    whatsapp: "+62 856-7890-1234",
    website: "https://pondasipancangmegah.co.id",
    logo: "https://images.unsplash.com/photo-1521791136364-7286de70083d?auto=format&fit=crop&w=120&h=120&q=80",
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=300&q=80",
    companyProfile: "Spesialis subkontraktor pondasi dalam, bore pile, secant pile, diaphragm wall, dan soil improvement dengan mesin hidrolik mutakhir standar internasional.",
    yearFounded: 2018,
    employeeCount: 154,
    rating: 4.5,
    ratingCount: 5,
    status: "Verified",
    score: 79,
    createdAt: "2026-01-16T00:00:00Z"
  }
];

const INITIAL_REVIEWS: ContractorReview[] = [
  {
    id: "review-1",
    contractorId: "user-contractor-1",
    reviewerId: "user-owner",
    reviewerName: "PT Pembangunan Nusantara TBK",
    projectTitle: "Modernisasi Puskesmas Sentul Bogor",
    quality: 5,
    timeliness: 5,
    communication: 4,
    safety: 5,
    reviewText: "PT Wijaya Karya Prakasa menyelesaikan gedung rumah sakit rawat inap puskesmas 3 hari lebih cepat dari jadwal. Kualitas beton dan mechanical electrical presisi tinggi.",
    rating: 4.75,
    createdAt: "2026-05-15T10:30:00Z"
  },
  {
    id: "review-2",
    contractorId: "user-contractor-1",
    reviewerId: "owner-merak",
    reviewerName: "PT Angkutan Sungai Danau dan Penyeberangan (ASDP)",
    projectTitle: "Pembangunan Dermaga VIP & Flyover Pelabuhan Merak",
    quality: 5,
    timeliness: 5,
    communication: 5,
    safety: 5,
    reviewText: "Ekselen dalam manajemen lalu lintas window time malam hari saat langsir gelagar baja besar. Nihil kecelakaan kerja (Zero Accident) tercapai sepanjang proyek.",
    rating: 5.0,
    createdAt: "2026-04-12T08:15:00Z"
  },
  {
    id: "review-3",
    contractorId: "user-contractor-1",
    reviewerId: "owner-ap2",
    reviewerName: "PT Angkasa Pura II (Persero)",
    projectTitle: "Overlay Taxiway & Renovasi Apron Terminal 2 Soekarno-Hatta",
    quality: 4,
    timeliness: 4,
    communication: 4,
    safety: 4,
    reviewText: "Kualitas aspal halus draf penetrasi tinggi. Komunikasi dengan ATC bandara berjalan tertib. Sedikit hambatan cuaca ekstrem namun diselesaikan dengan baik.",
    rating: 4.0,
    createdAt: "2026-03-20T14:45:00Z"
  },
  {
    id: "review-4",
    contractorId: "user-contractor-1",
    reviewerId: "owner-dpu",
    reviewerName: "Dinas Pekerjaan Umum Karawang",
    projectTitle: "Saluran Irigasi Tersier & Embung Retensi Flood Control",
    quality: 5,
    timeliness: 4,
    communication: 4,
    safety: 5,
    reviewText: "Struktur tanggul penahan banjir sangat solid. Finishing kemiringan saluran air sesuai gambar kerja digital. Sangat kooperatif dalam revisi CCO lapangan.",
    rating: 4.5,
    createdAt: "2026-02-10T11:20:00Z"
  },
  {
    id: "review-5",
    contractorId: "user-contractor-1",
    reviewerId: "owner-bpjn",
    reviewerName: "Balai Pelaksana Jalan Nasional (BPJN) Wilayah VII",
    projectTitle: "Preservasi Jalur Pantai Selatan (Pansela) Jawa Mandiri",
    quality: 5,
    timeliness: 5,
    communication: 5,
    safety: 5,
    reviewText: "Pelaksanaan pemotongan tebing bukit berjalan masif dan presisi tanpa longsor sekunder. Struktur retaining wall beton pracetak terpasang rapi.",
    rating: 5.0,
    createdAt: "2026-01-28T09:00:00Z"
  },
  {
    id: "review-6",
    contractorId: "user-contractor-1",
    reviewerId: "owner-jasamarga",
    reviewerName: "PT Jasa Marga Solo-Yogyakarta",
    projectTitle: "Konstruksi Rigid Pavement Tol Trans Jawa Paket 2A",
    quality: 3,
    timeliness: 3,
    communication: 3,
    safety: 3,
    reviewText: "Kualitas beton rigid sangat baik, namun sempat mengalami kendala keterlambatan penyelesaian akibat terlambatnya relokasi utilitas pipa gas bawah tanah.",
    rating: 3.0,
    createdAt: "2025-11-15T16:40:00Z"
  },
  {
    id: "review-7",
    contractorId: "user-contractor-1",
    reviewerId: "owner-kemenag",
    reviewerName: "Kementerian Agama RI - Satker UIII",
    projectTitle: "Gedung Asrama & Laboratorium Bahasa Kampus UIII Depok",
    quality: 4,
    timeliness: 4,
    communication: 4,
    safety: 5,
    reviewText: "Sistem facade precast GRC terpasang lurus dan kedap air. Penempatan safety inspector dan rambu K3 sangat rapat di seluruh lantai gedung tinggi.",
    rating: 4.25,
    createdAt: "2025-10-05T13:10:05Z"
  },
  {
    id: "review-8",
    contractorId: "user-contractor-1",
    reviewerId: "owner-binamarga",
    reviewerName: "Dinas Bina Marga Pemprov Jabar",
    projectTitle: "Pembangunan Jembatan Kabel Gantung Sungai Citanduy",
    quality: 4,
    timeliness: 5,
    communication: 4,
    safety: 5,
    reviewText: "Instalasi angkur blok beton jembatan sangat rigid. Seluruh uji beban statis dan dinamis menorehkan angka lendutan aman di bawah batas toleransi jembatan.",
    rating: 4.5,
    createdAt: "2025-09-12T10:00:00Z"
  },
  {
    id: "review-sub-1",
    contractorId: "user-subcon",
    reviewerId: "owner-swadharma",
    reviewerName: "PT Swadharma Prima Kantor Dukuh Atas",
    projectTitle: "Pekerjaan Pondasi Borepile Menara Office 32 Lantai",
    quality: 5,
    timeliness: 5,
    communication: 5,
    safety: 5,
    reviewText: "Sangat ahli dalam pengerjaan pondasi borepile diameter 1.5m di area sempit perkotaan yang padat bangunan tinggi. Bebas dari komplain getaran tetangga.",
    rating: 5.0,
    createdAt: "2026-05-18T15:20:00Z"
  },
  {
    id: "review-sub-2",
    contractorId: "user-subcon",
    reviewerId: "owner-semengresik",
    reviewerName: "PT Semen Indonesia (Persero) TBK",
    projectTitle: "Silo Semen Kapasitas Tinggi & Pondasi Dalam Pabrik Tuban",
    quality: 5,
    timeliness: 4,
    communication: 4,
    safety: 5,
    reviewText: "Konstruksi diaphragm wall sangat rapat dan lurus tanpa deviasi kebocoran air tanah bawah silo. Hasil uji integrity test (PIT) seluruh pile berkualifikasi kelas A.",
    rating: 4.5,
    createdAt: "2026-04-02T11:40:00Z"
  },
  {
    id: "review-sub-3",
    contractorId: "user-subcon",
    reviewerId: "owner-greenpramuka",
    reviewerName: "PT Duta Putra Mahkota Apartemen",
    projectTitle: "Galian Basement Deep Excavation Tower Residence J",
    quality: 4,
    timeliness: 4,
    communication: 4,
    safety: 4,
    reviewText: "Instalasi struts baja penahan dinding galian sangat kuat. Monitoring inklinometer tanah dilaporkan berkala harian tanpa hambatan pergeseran struktur tanah.",
    rating: 4.0,
    createdAt: "2026-02-28T09:12:00Z"
  },
  {
    id: "review-sub-4",
    contractorId: "user-subcon",
    reviewerId: "owner-jakpro",
    reviewerName: "PT Jakarta Propertindo (LRT Jakarta)",
    projectTitle: "Pondasi Borepile Struktur Layang LRT Jakarta Velodrome-Manggarai",
    quality: 5,
    timeliness: 5,
    communication: 4,
    safety: 5,
    reviewText: "Kecepatan pengerjaan borepile luar biasa. Unit mesin rig bore pile hidrolik sangat handal dan bersih dari tumpahan lumpur bentonit di aspal jalan arteri.",
    rating: 4.75,
    createdAt: "2026-01-14T08:30:00Z"
  },
  {
    id: "review-sub-5",
    contractorId: "user-subcon",
    reviewerId: "owner-mampang",
    reviewerName: "Dinas Bina Marga DKI Jakarta",
    projectTitle: "Secant Pile Pondasi Keliling Underpass Terowongan Mampang",
    quality: 4,
    timeliness: 3,
    communication: 4,
    safety: 4,
    reviewText: "Kerapatan interlocking secant pile beton berjalan baik. Sedikit melambat karena struktur tanah keras berbatu di kedalaman 18 meter, namun dituntaskan presisi.",
    rating: 3.75,
    createdAt: "2025-12-05T14:50:00Z"
  }
];

const INITIAL_DOCUMENTS: ContractorDocument[] = [
  {
    id: "doc-nib-1",
    contractorId: "user-contractor-1",
    type: "NIB",
    name: "NIB_WijayaKarya_Signed.pdf",
    status: "Verified",
    fileUrl: "https://example.com/docs/nib1.pdf",
    uploadedAt: "2026-01-14T09:00:00Z"
  },
  {
    id: "doc-npwp-1",
    contractorId: "user-contractor-1",
    type: "NPWP",
    name: "NPWP_WijayaKarya_Legalized.pdf",
    status: "Verified",
    fileUrl: "https://example.com/docs/npwp1.pdf",
    uploadedAt: "2026-01-14T09:15:00Z"
  },
  {
    id: "doc-cprof-1",
    contractorId: "user-contractor-1",
    type: "Company Profile",
    name: "ComProfile_PTWKP_2026.pdf",
    status: "Verified",
    fileUrl: "https://example.com/docs/cp1.pdf",
    uploadedAt: "2026-01-14T09:20:00Z"
  }
];

const INITIAL_STAFF: ContractorStaff[] = [
  {
    id: "staff-1",
    contractorId: "user-contractor-1",
    name: "Dr. Ir. Bagus Hermawan, M.T.",
    position: "Ahli Utama Struktur Jembatan",
    skaCert: "SKA-921-20912-U",
    skkCert: "SKK-1120-BUILD-U",
    validUntil: "2029-08-12",
    experienceYears: 18,
    createdAt: "2026-01-14T10:00:00Z"
  },
  {
    id: "staff-2",
    contractorId: "user-contractor-1",
    name: "Fajar Wicaksono, S.T., IPM",
    position: "Manajer K3 Kontruksi",
    skaCert: "SKA-102-12001-M",
    skkCert: "SKK-8891-K3-M",
    validUntil: "2028-11-20",
    experienceYears: 9,
    createdAt: "2026-01-14T10:05:00Z"
  },
  {
    id: "staff-3",
    contractorId: "user-contractor-2",
    name: "Yogi Pratama, S.T.",
    position: "Ahli Geoteknik & Pondasi",
    skaCert: "SKA-201-99882-M",
    skkCert: "SKK-0012-GEO-M",
    validUntil: "2027-05-15",
    experienceYears: 7,
    createdAt: "2026-01-15T11:00:00Z"
  }
];

const INITIAL_EQUIPMENT: ContractorEquipment[] = [
  {
    id: "equip-1",
    contractorId: "user-contractor-1",
    name: "Sany SCC1500A Lattice Boom Crawler Crane",
    type: "Crawler Crane",
    capacity: "150 Ton",
    year: 2021,
    status: "Ready",
    photoUrl: "https://images.unsplash.com/photo-1542156822-6924d1a71aba?auto=format&fit=crop&w=300&h=200&q=80",
    createdAt: "2026-01-14T10:30:00Z"
  },
  {
    id: "equip-2",
    contractorId: "user-contractor-1",
    name: "Caterpillar 320D Excavator Heavy",
    type: "Excavator",
    capacity: "22 Ton",
    year: 2022,
    status: "In Use",
    photoUrl: "https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=300&h=200&q=80",
    createdAt: "2026-01-14T10:45:00Z"
  },
  {
    id: "equip-3",
    contractorId: "user-contractor-2",
    name: "Komatsu D85ESS Bulldozer",
    type: "Bulldozer",
    capacity: "28 Ton",
    year: 2019,
    status: "Ready",
    photoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&h=200&q=80",
    createdAt: "2026-01-15T11:30:00Z"
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "project-1",
    code: "PJ-KNG-001",
    name: "Pembangunan Jembatan Layang Kuningan Jakarta",
    location: "Kuningan, Jakarta Selatan",
    ownerId: "user-owner",
    ownerName: "PT Pembangunan Nusantara TBK",
    budget: 85200000000, // Rp 85.2 Milyar
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    status: "Tender",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-06-16T00:00:00Z"
  },
  {
    id: "project-2",
    code: "IKN-DRN-003",
    name: "Sistem Drainase Utama Ibu Kota Nusantara (IKN)",
    location: "Penajam Paser Utara, Kalimantan Timur",
    ownerId: "user-owner",
    ownerName: "PT Pembangunan Nusantara TBK",
    budget: 142000000000, // Rp 142 Milyar
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    status: "Running",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-06-16T00:00:00Z"
  },
  {
    id: "project-3",
    code: "BGB-STL-012",
    name: "Modernisasi Puskesmas Sentul Bogor",
    location: "Sentul, Bogor, Jawa Barat",
    ownerId: "user-owner",
    ownerName: "PT Pembangunan Nusantara TBK",
    budget: 12500000000, // Rp 12.5 Milyar
    startDate: "2025-06-01",
    endDate: "2026-05-30",
    status: "Completed",
    createdAt: "2025-05-01T00:00:00Z",
    updatedAt: "2026-05-30T00:00:00Z"
  },
  {
    id: "project-4",
    code: "PLB-TPR-009",
    name: "Revitalisasi Container Terminal Tanjung Perak",
    location: "Pelabuhan Tanjung Perak, Surabaya",
    ownerId: "user-owner",
    ownerName: "PT Pembangunan Nusantara TBK",
    budget: 95000000000,
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    status: "Planning",
    createdAt: "2026-05-10T02:00:00Z",
    updatedAt: "2026-06-16T00:00:00Z"
  }
];

const INITIAL_TENDERS: Tender[] = [
  {
    id: "tender-1",
    projectId: "project-1",
    title: "Pengadaan Struktur Utama Flyover Kuningan",
    description: "Scope tender mencakup pekerjaan bore pile pondasi dalam, pembuatan pier column beton precast, erection girder baja, perkerasan aspal, serta pemasangan instrumen K3.",
    location: "Kuningan, Jakarta Selatan",
    hpsBudget: 80000000000, // HPS Rp 80 Milyar
    schedule: "15 Juni 2026 - 15 Juli 2026",
    type: "Tender Terbuka",
    status: "Open",
    docUrls: {
      tor: "TOR_Flyover_Kuningan.pdf",
      rks: "RKS_Teknis_Flyover.pdf",
      boq: "BOQ_Flyover_Kuningan.xlsx",
      drawings: "DED_Struktur_Flyover.pdf"
    },
    createdAt: "2026-06-15T08:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z"
  }
];

const INITIAL_BIDS: Bid[] = [
  {
    id: "bid-1",
    tenderId: "tender-1",
    contractorId: "user-contractor-1",
    contractorName: "PT Wijaya Karya Prakasa",
    bidAmount: 76500000000, // Rp 76.5 Milyar (Sekitar 95.6% HPS)
    durationDays: 350,
    executionMethod: "Erection girder baja segmental menggunakan metode gantry launcher untuk meminimalisasi kemacetan jalan arteri Kuningan.",
    technicalDocUrl: "Proposal_Teknis_WKP_Flyover.pdf",
    status: "Evaluasi",
    evaluationScore: 91, // Calculated automatically by rule logic
    createdAt: "2026-06-16T15:30:00Z",
    updatedAt: "2026-06-16T15:30:00Z"
  },
  {
    id: "bid-2",
    tenderId: "tender-1",
    contractorId: "user-contractor-2",
    contractorName: "PT Adhi Jaya Konstruksi",
    bidAmount: 78900000000, // Rp 78.9 Milyar
    durationDays: 360,
    executionMethod: "Penyelesaian girder menggunakan crawler crane tonase besar berseri SCC1500A pada jam malam bebas kendaraan (window-time).",
    technicalDocUrl: "TechnicalProposal_AJK_Kuningan.pdf",
    status: "Evaluasi",
    evaluationScore: 84,
    createdAt: "2026-06-16T17:10:00Z",
    updatedAt: "2026-06-16T17:10:00Z"
  }
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "contract-1",
    contractNumber: "KK-PU-IKN/2026/VIII/009",
    bidId: "bid-ikn-drainage",
    tenderId: "tender-ikn-drainage",
    projectId: "project-2",
    ownerId: "user-owner",
    contractorId: "user-contractor-1",
    details: "Kontrak pemborongan pekerjaan konstruksi saluran drainase perkotaan IKN utama sepanjang 4.2 KM lengkap dengan box culvert ukuran 3x3M dan pintu air elektrik otomatis.",
    activeValue: 135000000000,
    qrCodeUrl: "FORSDIG_SIGN_VERIFIED_PJ_IKN_918029",
    status: "Aktif",
    esignedByOwner: true,
    esignedByContractor: true,
    signedAt: "2026-02-28T09:00:00Z",
    createdAt: "2026-02-28T00:00:00Z"
  }
];

const INITIAL_PROGRESS: ProgressReport[] = [
  {
    id: "rep-1",
    projectId: "project-2",
    contractorId: "user-contractor-1",
    period: "Bulanan",
    date: "2026-06-15",
    percentComplete: 48.5,
    description: "Pekerjaan penggalian tanah trase drainase mencapai km 2.1, perakitan tulangan besi box culvert di lokasi, pengecoran lantai kerja (lean concrete) setebal 10cm.",
    photosUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=350&h=200&q=80",
    kurvaValue: 46.0, // target kurva S: 46% (contractor is ahead of schedule by +2.5%)
    createdAt: "2026-06-15T16:00:00Z"
  }
];

const INITIAL_BASTS: Bast[] = [
  {
    id: "bast-hospital",
    projectId: "project-3",
    bidId: "bid-hospital",
    bappNumber: "BAST-BGB-012/V-2026/08",
    date: "2026-05-30",
    ownerSignature: "SIGNED - Dharmawan Wijaya",
    contractorSignature: "SIGNED - Ir. Ahmad Fauzi",
    consultantSignature: "SIGNED - Prof. Dr. Ir. H. M. Syarif",
    status: "Signed",
    createdAt: "2026-05-30T10:00:00Z"
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "invoice-1",
    contractId: "contract-1",
    contractorId: "user-contractor-1",
    invoiceNumber: "INV-IKN/WKP/VI/2026-024",
    amount: 33750000000, // Termin 1 - 25% (Rp 33.75 Milyar)
    tax: 3712500000, // PPN 11%
    termNumber: 1,
    fileUrl: "https://example.com/invoices/inv1.pdf",
    status: "Dibayar",
    createdAt: "2026-06-05T09:00:00Z",
    updatedAt: "2026-06-08T14:22:00Z"
  },
  {
    id: "invoice-2",
    contractId: "contract-1",
    contractorId: "user-contractor-1",
    invoiceNumber: "INV-IKN/WKP/VI/2026-035",
    amount: 33750000000, // Termin 2 - 25%
    tax: 3712500000,
    termNumber: 2,
    fileUrl: "https://example.com/invoices/inv2.pdf",
    status: "Menunggu",
    createdAt: "2026-06-16T11:00:00Z",
    updatedAt: "2026-06-16T11:00:00Z"
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    invoiceId: "invoice-1",
    amount: 37462500000, // Amount + Tax
    transactionHash: "0x892019ab921c8120eef9110d921b02de92190184b2cd921feeffdf",
    paidAt: "2026-06-08T14:20:00Z",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "230-9182-901",
    status: "Completed",
    createdAt: "2026-06-08T14:20:00Z"
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    userId: "user-owner",
    title: "Penawaran Masuk Baru",
    message: "Kontraktor PT Wijaya Karya Prakasa telah mengirimkan penawaran tender 'Pengadaan Struktur Utama Flyover Kuningan'.",
    read: false,
    type: "Tender",
    link: "/tenders",
    createdAt: "2026-06-16T15:31:00Z"
  },
  {
    id: "notif-2",
    userId: "user-contractor-1",
    title: "Tagihan Dikirim",
    message: "Invoice Termin 2 Anda untuk Proyek Saluran Drainase IKN telah berhasil dikirim ke Finance.",
    read: true,
    type: "Invoice",
    link: "/finance",
    createdAt: "2026-06-16T11:01:00Z"
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: "audit-1",
    userId: "user-contractor-1",
    userName: "Ir. Ahmad Fauzi",
    action: "Tender Bid Submission",
    details: "PT Wijaya Karya Prakasa submitted a bid of Rp 76,500,000,000 to tender-1 'Pengadaan Struktur Utama Flyover Kuningan'",
    ipAddress: "182.1.203.24",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/124.0.0.0",
    timestamp: "2026-06-16T15:30:00Z"
  },
  {
    id: "audit-2",
    userId: "user-owner",
    userName: "Dharmawan Wijaya",
    action: "Generated Contract",
    details: "Generated agreement document for PJ-IKN-003 and initiated e-signing system.",
    ipAddress: "36.85.12.92",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    timestamp: "2026-02-28T08:44:00Z"
  }
];

// In-Memory Database with Sync fallback
class DatabaseEngine {
  private users: UserProfile[] = INITIAL_USERS;
  private contractors: Contractor[] = INITIAL_CONTRACTORS;
  private reviews: ContractorReview[] = INITIAL_REVIEWS;
  private documents: ContractorDocument[] = INITIAL_DOCUMENTS;
  private staff: ContractorStaff[] = INITIAL_STAFF;
  private equipment: ContractorEquipment[] = INITIAL_EQUIPMENT;
  private projects: Project[] = INITIAL_PROJECTS;
  private tenders: Tender[] = INITIAL_TENDERS;
  private bids: Bid[] = INITIAL_BIDS;
  private contracts: Contract[] = INITIAL_CONTRACTS;
  private progress: ProgressReport[] = INITIAL_PROGRESS;
  private basts: Bast[] = INITIAL_BASTS;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private payments: Payment[] = INITIAL_PAYMENTS;
  private notifications: SystemNotification[] = INITIAL_NOTIFICATIONS;
  private audits: AuditLog[] = INITIAL_AUDITS;

  // Active logged-in user profile simulating standard Cognito/Firebase Auth mapping
  private currentUser: UserProfile = INITIAL_USERS[1]; // Dharmawan (Owner Proyek)

  constructor() {
    this.loadFromStorage();
    this.loadFromFirestore();
  }

  private async loadFromFirestore() {
    try {
      const keys = ["projects", "tenders", "bids", "invoices", "payments"];
      for (const key of keys) {
        const querySnapshot = await getDocs(collection(firestoreDb, key));
        if (!querySnapshot.empty) {
          const items: any[] = [];
          querySnapshot.forEach((doc) => {
            items.push(doc.data());
          });
          if (items.length > 0) {
            (this as any)[key] = items;
            localStorage.setItem(`eproc_${key}`, JSON.stringify(items));
          }
        }
      }
      console.log("Loaded initial e-procurement state from Firestore successfully.");
    } catch (err) {
      console.warn("Firestore lazy loading fallback to localStorage state:", err);
    }
  }

  private loadFromStorage() {
    try {
      const keys = [
        "users", "contractors", "reviews", "documents", "staff", "equipment",
        "projects", "tenders", "bids", "contracts", "progress", "basts",
        "invoices", "payments", "notifications", "audits", "currentUser"
      ];
      keys.forEach(key => {
        const stored = localStorage.getItem(`eproc_${key}`);
        if (stored) {
          (this as any)[key] = JSON.parse(stored);
        }
      });
    } catch (e) {
      console.warn("Storage fallback failed", e);
    }
  }

  private async syncCollectionToFirestore(key: string) {
    try {
      const data = (this as any)[key];
      if (Array.isArray(data)) {
        const batch = writeBatch(firestoreDb);
        let count = 0;
        data.forEach(item => {
          const id = item.id || item.uid;
          if (id) {
            const docRef = doc(firestoreDb, key, id);
            batch.set(docRef, item, { merge: true });
            count++;
          }
        });
        if (count > 0) {
          await batch.commit();
          console.log(`Synced ${count} items of ${key} to Firestore.`);
        }
      } else if (data && typeof data === "object") {
        const id = data.id || data.uid;
        if (id) {
          const docRef = doc(firestoreDb, key, id);
          await setDoc(docRef, data, { merge: true });
          console.log(`Synced single object of ${key} to Firestore.`);
        }
      }
    } catch (err) {
      console.warn(`Firestore sync background error for key ${key}:`, err);
    }
  }

  private saveToStorage() {
    try {
      const keys = [
        "users", "contractors", "reviews", "documents", "staff", "equipment",
        "projects", "tenders", "bids", "contracts", "progress", "basts",
        "invoices", "payments", "notifications", "audits", "currentUser"
      ];
      keys.forEach(key => {
        localStorage.setItem(`eproc_${key}`, JSON.stringify((this as any)[key]));
        // Asynchronously mirror writes to Firestore
        this.syncCollectionToFirestore(key);
      });
    } catch (e) {
      console.warn("Save to storage failed", e);
    }
  }

  // Current logged in user config
  getCurrentUser() {
    return this.currentUser;
  }

  switchUser(role: UserRole) {
    const matched = this.users.find(u => u.role === role);
    if (matched) {
      this.currentUser = matched;
      this.logAudit(matched.uid, matched.name, "Switched Role Access", `User changed session perspective to ${role}`);
      this.saveToStorage();
    }
    return this.currentUser;
  }

  getUsers() { return this.users; }
  getContractors() { return this.contractors; }
  getReviews(contractorId?: string) {
    if (contractorId) return this.reviews.filter(r => r.contractorId === contractorId);
    return this.reviews;
  }
  getDocuments(contractorId?: string) {
    if (contractorId) return this.documents.filter(d => d.contractorId === contractorId);
    return this.documents;
  }
  getStaff(contractorId?: string) {
    if (contractorId) return this.staff.filter(s => s.contractorId === contractorId);
    return this.staff;
  }
  getEquipment(contractorId?: string) {
    if (contractorId) return this.equipment.filter(e => e.contractorId === contractorId);
    return this.equipment;
  }
  getProjects() { return this.projects; }
  getTenders() { return this.tenders; }
  getBids(tenderId?: string) {
    if (tenderId) return this.bids.filter(b => b.tenderId === tenderId);
    return this.bids;
  }
  getContracts() { return this.contracts; }
  getProgress(projectId?: string) {
    if (projectId) return this.progress.filter(p => p.projectId === projectId);
    return this.progress;
  }
  getBasts() { return this.basts; }
  getInvoices() { return this.invoices; }
  getPayments() { return this.payments; }
  getNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  getAudits() { return this.audits; }

  // Mutations
  addProject(proj: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    const newProj: Project = {
      ...proj,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.unshift(newProj);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Created Project", `Added new project: ${proj.name}`);
    this.saveToStorage();
    return newProj;
  }

  addTender(tender: Omit<Tender, "id" | "createdAt" | "updatedAt">) {
    const newTender: Tender = {
      ...tender,
      id: `tender-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tenders.unshift(newTender);
    // Update project state to 'Tender'
    const projIdx = this.projects.findIndex(p => p.id === tender.projectId);
    if (projIdx !== -1) {
      this.projects[projIdx].status = "Tender";
    }
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Created Tender Offer", `Created tender bid invite: ${tender.title}`);
    this.saveToStorage();
    return newTender;
  }

  addBid(bid: Omit<Bid, "id" | "createdAt" | "updatedAt">) {
    const newBid: Bid = {
      ...bid,
      id: `bid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.bids.unshift(newBid);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Submitted Bid Proposal", `Contractor bid Rp ${bid.bidAmount.toLocaleString("id-ID")} to tender: ${bid.tenderId}`);
    
    // Notify Owner
    this.addNotification("user-owner", "Penawaran Masuk Baru", `${bid.contractorName} mengirimkan penawaran tender senilai Rp ${bid.bidAmount.toLocaleString("id-ID")}`, "Tender", "/tenders");

    this.saveToStorage();
    return newBid;
  }

  evaluateBid(bidId: string, score: number, status: "Submitted" | "Evaluasi" | "Menang" | "Kalah") {
    const idx = this.bids.findIndex(b => b.id === bidId);
    if (idx !== -1) {
      const oldBid = this.bids[idx];
      this.bids[idx].evaluationScore = score;
      this.bids[idx].status = status;
      this.logAudit(this.currentUser.uid, this.currentUser.name, "Evaluated Tender Bid", `Set bid score of ${score} for ${oldBid.contractorName} with status ${status}`);

      if (status === "Menang") {
        this.addNotification(oldBid.contractorId, "Selamat! Tender Dinobatkan Menang", `Bidding Anda untuk tender ${oldBid.tenderId} dinyatakan Lolos Evaluasi Utama.`, "Tender", "/tenders");
      } else if (status === "Kalah") {
        this.addNotification(oldBid.contractorId, "Pengumuman Tender Selesai", `Mohon maaf, penawaran Anda untuk tender ${oldBid.tenderId} belum lolos seleksi.`, "Tender", "/tenders");
      }
      this.saveToStorage();
    }
  }

  signContract(contractId: string, userType: "owner" | "contractor") {
    const idx = this.contracts.findIndex(c => c.id === contractId);
    if (idx !== -1) {
      if (userType === "owner") {
        this.contracts[idx].esignedByOwner = true;
      } else {
        this.contracts[idx].esignedByContractor = true;
      }
      
      if (this.contracts[idx].esignedByOwner && this.contracts[idx].esignedByContractor) {
        this.contracts[idx].status = "Aktif";
        this.contracts[idx].signedAt = new Date().toISOString();
        
        // Update Project to Running
        const projId = this.contracts[idx].projectId;
        const pIdx = this.projects.findIndex(p => p.id === projId);
        if (pIdx !== -1) {
          this.projects[pIdx].status = "Running";
        }
      }
      this.logAudit(this.currentUser.uid, this.currentUser.name, "E-Signed Contract", `Recorded e-signature of ${userType} for Contract: ${this.contracts[idx].contractNumber}`);
      this.saveToStorage();
    }
  }

  createContractFromAward(bidId: string, tenderId: string, projectId: string, activeValue: number) {
    const bid = this.bids.find(b => b.id === bidId);
    const proj = this.projects.find(p => p.id === projectId);
    if (!bid || !proj) return;

    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      contractNumber: `KK-EPROC/${new Date().getFullYear()}/IX/${Math.floor(100 + Math.random() * 900)}`,
      bidId,
      tenderId,
      projectId,
      ownerId: proj.ownerId,
      contractorId: bid.contractorId,
      details: `Kontrak kerja konstruksi berskala nasional untuk pelaksanaan paket pekerjaan terkait ${bid.executionMethod}`,
      activeValue,
      qrCodeUrl: `FORSDIG_VERIFY_CONTRACT_${Date.now()}`,
      status: "Draft",
      esignedByOwner: false,
      esignedByContractor: false,
      createdAt: new Date().toISOString()
    };

    this.contracts.unshift(newContract);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Generated Contract Draft", `Draft generated for Contractor: ${bid.contractorName}`);
    this.saveToStorage();
    return newContract;
  }

  addReport(report: Omit<ProgressReport, "id" | "createdAt">) {
    const newReport: ProgressReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.progress.unshift(newReport);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Submitted Site progress", `Added ${report.period} report: Completed ${report.percentComplete}%`);
    this.saveToStorage();
    return newReport;
  }

  addInvoice(inv: Omit<Invoice, "id" | "createdAt" | "updatedAt">) {
    const newInv: Invoice = {
      ...inv,
      id: `invoice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.invoices.unshift(newInv);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Submitted Invoice Claims", `Billed Termin ${inv.termNumber} value Rp ${inv.amount.toLocaleString()}`);
    this.addNotification("user-finance", "Pengajuan Invoice Baru", `Kontraktor mengajukan pencairan invoice Termin ${inv.termNumber} senilai Rp ${inv.amount.toLocaleString()}`, "Invoice", "/finance");
    this.saveToStorage();
    return newInv;
  }

  verifyInvoice(invoiceId: string, status: InvoiceStatus) {
    const idx = this.invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      this.invoices[idx].status = status;
      this.invoices[idx].updatedAt = new Date().toISOString();
      this.logAudit(this.currentUser.uid, this.currentUser.name, "Processed Invoice Action", `Set invoice state to ${status}`);
      
      const invObj = this.invoices[idx];
      this.addNotification(invObj.contractorId, "Status Tagihan Diupdate", `Pencairan tagihan ${invObj.invoiceNumber} status Anda menjadi: ${status}`, "Invoice", "/finance");
      
      this.saveToStorage();
    }
  }

  payInvoice(invoiceId: string, bank: string, accNum: string) {
    const idx = this.invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      this.invoices[idx].status = "Dibayar";
      this.invoices[idx].updatedAt = new Date().toISOString();
      const invObj = this.invoices[idx];

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        invoiceId: invoiceId,
        amount: invObj.amount + invObj.tax,
        transactionHash: "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join(""),
        paidAt: new Date().toISOString(),
        bankName: bank,
        accountNumber: accNum,
        status: "Completed",
        createdAt: new Date().toISOString()
      };

      this.payments.unshift(newPayment);
      this.logAudit(this.currentUser.uid, this.currentUser.name, "Disbursed Payment Transfer", `Transferred fund of Rp ${(invObj.amount + invObj.tax).toLocaleString()} to contractor account.`);
      this.addNotification(invObj.contractorId, "Pencairan Finansial Sukses", `Pembayaran tagihan ${invObj.invoiceNumber} telah dilunasi via transfer Bank.`, "Termin", "/finance");
      this.saveToStorage();
    }
  }

  addBast(bast: Omit<Bast, "id" | "createdAt" | "status">) {
    const newBast: Bast = {
      ...bast,
      id: `bast-${Date.now()}`,
      status: "Review",
      createdAt: new Date().toISOString()
    };
    this.basts.unshift(newBast);
    this.logAudit(this.currentUser.uid, this.currentUser.name, "Initiated BAST File", `Logged BAST delivery for project ${bast.projectId}`);
    this.saveToStorage();
    return newBast;
  }

  approveBast(bastId: string, signature: string, signType: "owner" | "contractor" | "consultant") {
    const idx = this.basts.findIndex(b => b.id === bastId);
    if (idx !== -1) {
      if (signType === "owner") this.basts[idx].ownerSignature = `SIGNED - ${signature}`;
      if (signType === "contractor") this.basts[idx].contractorSignature = `SIGNED - ${signature}`;
      if (signType === "consultant") this.basts[idx].consultantSignature = `SIGNED - ${signature}`;

      const b = this.basts[idx];
      if (b.ownerSignature && b.contractorSignature && b.consultantSignature) {
        this.basts[idx].status = "Signed";
        
        // Mark project as Completed
        const pIdx = this.projects.findIndex(p => p.id === b.projectId);
        if (pIdx !== -1) {
          this.projects[pIdx].status = "Completed";
        }
      }
      this.logAudit(this.currentUser.uid, this.currentUser.name, "Co-signed BAST Official", `Affixed digital signature on BAST: ${b.bappNumber}`);
      this.saveToStorage();
    }
  }

  registerContractor(contractor: Omit<Contractor, "id" | "rating" | "ratingCount" | "score" | "createdAt" | "status" | "email">) {
    const newId = `user-contractor-${Date.now()}`;
    
    // Add User Profile
    const newUser: UserProfile = {
      uid: newId,
      email: `${contractor.name.toLowerCase().replace(/\s+/g, "")}@forsdig.id`,
      role: "Kontraktor",
      name: contractor.pic,
      phone: contractor.whatsapp,
      companyName: contractor.name,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);

    // Add Contractor Profile
    const newContractor: Contractor = {
      ...contractor,
      id: newId,
      email: newUser.email,
      rating: 0,
      ratingCount: 0,
      score: 65, // Initial basic scoring based on legal uploads
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    this.contractors.push(newContractor);
    
    this.logAudit(newUser.uid, newUser.name, "Online Contractor Registration", `Registered business legal entity: ${contractor.name}`);
    this.addNotification("user-procurement", "Pendaftaran Kontraktor Baru", `Kontraktor ${contractor.name} mengajukan pendaftaran NIB: ${contractor.nib}`, "General", "/contractors");
    this.saveToStorage();
    return newContractor;
  }

  updateContractorStatus(id: string, status: ContractorStatus) {
    const idx = this.contractors.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.contractors[idx].status = status;
      this.logAudit(this.currentUser.uid, this.currentUser.name, "Modified Vendor Sourcing status", `Changed contractor ${this.contractors[idx].name} status to ${status}`);
      this.saveToStorage();
    }
  }

  addStaff(st: Omit<ContractorStaff, "id" | "createdAt">) {
    const newStaff: ContractorStaff = {
      ...st,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.staff.push(newStaff);
    this.saveToStorage();
    return newStaff;
  }

  addEquipment(eq: Omit<ContractorEquipment, "id" | "createdAt">) {
    const newEq: ContractorEquipment = {
      ...eq,
      id: `equip-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.equipment.push(newEq);
    this.saveToStorage();
    return newEq;
  }

  addReview(rv: Omit<ContractorReview, "id" | "createdAt" | "reviewerName" | "reviewerId">) {
    const newReview: ContractorReview = {
      ...rv,
      id: `review-${Date.now()}`,
      reviewerId: this.currentUser.uid,
      reviewerName: this.currentUser.companyName || this.currentUser.name,
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);
    
    // Recalculate contractor visual rating
    const cIdx = this.contractors.findIndex(c => c.id === rv.contractorId);
    if (cIdx !== -1) {
      const activeReviews = this.reviews.filter(r => r.contractorId === rv.contractorId);
      const avg = activeReviews.reduce((sum, current) => sum + current.rating, 0) / activeReviews.length;
      this.contractors[cIdx].rating = parseFloat(avg.toFixed(1));
      this.contractors[cIdx].ratingCount = activeReviews.length;
    }

    this.logAudit(this.currentUser.uid, this.currentUser.name, "Contractor Performance grading", `Rated contractor performance rating: ${rv.rating}/5 stars`);
    this.saveToStorage();
    return newReview;
  }

  // Auditing logging utils (indestructible client events)
  logAudit(userId: string, userName: string, action: string, details: string) {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId,
      userName,
      action,
      details,
      ipAddress: "127.0.0.1",
      userAgent: window.navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    this.audits.unshift(newLog);
    this.saveToStorage();
  }

  private addNotification(userId: string, title: string, message: string, type: "Tender" | "Invoice" | "Termin" | "Kontrak" | "General", link: string) {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      read: false,
      type,
      link,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage();
  }
}

export const db = new DatabaseEngine();
