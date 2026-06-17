/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | "Super Admin"
  | "Owner Proyek"
  | "Procurement"
  | "Project Manager"
  | "Finance"
  | "Kontraktor"
  | "Subkontraktor"
  | "Konsultan"
  | "Auditor";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  companyName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContractorStatus = "Pending" | "Verified" | "Rejected" | "Blacklist";

export interface Contractor {
  id: string; // matches user uid
  name: string;
  nib: string;
  npwp: string;
  sbu: string;
  siujk: string;
  address: string;
  city: string;
  province: string;
  pic: string;
  email: string;
  whatsapp: string;
  website: string;
  logo: string;
  cover: string;
  companyProfile: string;
  yearFounded: number;
  employeeCount: number;
  rating: number;
  ratingCount: number;
  status: ContractorStatus;
  score: number; // 0 to 100 calculated by the AI engine
  createdAt: string;
}

export interface ContractorReview {
  id: string;
  contractorId: string;
  reviewerId: string;
  reviewerName: string;
  projectTitle: string;
  quality: number; // 1-5
  timeliness: number; // 1-5
  communication: number; // 1-5
  safety: number; // 1-5
  reviewText: string;
  rating: number; // average
  createdAt: string;
}

export interface ContractorDocument {
  id: string;
  contractorId: string;
  type: "NIB" | "NPWP" | "Sertifikat SBU" | "Company Profile" | "Laporan Keuangan" | "Portofolio";
  name: string;
  status: "Pending" | "Verified" | "Rejected";
  fileUrl: string;
  uploadedAt: string;
}

export interface ContractorStaff {
  id: string;
  contractorId: string;
  name: string;
  position: string;
  skaCert: string; // SKA Certificate Number
  skkCert: string; // SKK Certificate Number
  validUntil: string;
  experienceYears: number;
  createdAt: string;
}

export interface ContractorEquipment {
  id: string;
  contractorId: string;
  name: string;
  type: string;
  capacity: string;
  year: number;
  status: "Ready" | "In Use" | "Maintenance";
  photoUrl: string;
  createdAt: string;
}

export type ProjectStatus = "Planning" | "Tender" | "Running" | "Hold" | "Completed";

export interface Project {
  id: string;
  code: string;
  name: string;
  location: string;
  ownerId: string;
  ownerName: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
}

export type TenderType = "Tender Terbuka" | "Tender Terbatas" | "Penunjukan Langsung";
export type TenderStatus = "Draft" | "Open" | "Evaluating" | "Awarded" | "Cancelled";

export interface Tender {
  id: string;
  projectId: string;
  title: string;
  description: string;
  location: string;
  hpsBudget: number;
  schedule: string; // Date range or text
  type: TenderType;
  status: TenderStatus;
  docUrls: {
    tor: string;
    rks: string;
    boq: string;
    drawings: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type BidStatus = "Draft" | "Submitted" | "Evaluasi" | "Menang" | "Kalah";

export interface Bid {
  id: string;
  tenderId: string;
  contractorId: string;
  contractorName: string;
  bidAmount: number;
  durationDays: number;
  executionMethod: string;
  technicalDocUrl: string;
  status: BidStatus;
  evaluationScore?: number; // Calculated autonomously or manually
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = "Draft" | "Aktif" | "Selesai" | "Diputus";

export interface Contract {
  id: string;
  contractNumber: string;
  bidId: string;
  tenderId: string;
  projectId: string;
  ownerId: string;
  contractorId: string;
  details: string;
  activeValue: number;
  qrCodeUrl: string;
  status: ContractStatus;
  esignedByOwner: boolean;
  esignedByContractor: boolean;
  signedAt?: string;
  createdAt: string;
}

export interface ProgressReport {
  id: string;
  projectId: string;
  contractorId: string;
  period: "Harian" | "Mingguan" | "Bulanan";
  date: string;
  percentComplete: number; // e.g. 45.2 for 45.2%
  description: string;
  photosUrl: string;
  kurvaValue: number; // Target reference for curves
  createdAt: string;
}

export type BastStatus = "Draft" | "Review" | "Approved" | "Signed";

export interface Bast {
  id: string;
  projectId: string;
  bidId: string;
  bappNumber: string;
  date: string;
  ownerSignature: string; // base64 or status
  contractorSignature: string;
  consultantSignature: string;
  status: BastStatus;
  createdAt: string;
}

export type InvoiceStatus = "Menunggu" | "Diverifikasi" | "Disetujui" | "Dibayar";

export interface Invoice {
  id: string;
  contractId: string;
  contractorId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  termNumber: number; // 1, 2, 3, 4 (Final)
  fileUrl: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  transactionHash: string;
  paidAt: string;
  bankName: string;
  accountNumber: string;
  status: "Completed";
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "Tender" | "Invoice" | "Termin" | "Kontrak" | "General";
  link: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g. "User Login", "Submitted Bid", "Approved Invoice"
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
