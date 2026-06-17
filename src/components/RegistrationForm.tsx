/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ShieldCheck, Mail, Phone, Globe, Building2, FileText, MapPin } from "lucide-react";
import { useState } from "react";
import { db } from "../lib/db";

const registrationSchema = z.object({
  name: z.string().min(3, "Nama perusahaan minimal harus 3 karakter."),
  nib: z.string().regex(/^\d{13}$/, "NIB harus bernilai tepat 13 digit angka."),
  npwp: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, "NPWP wajib berformat XX.XXX.XXX.X-XXX.XXX (15 digit)."),
  sbu: z.string().min(5, "Informasi sertifikasi SBU wajib diunggah."),
  siujk: z.string().min(5, "Nomor SIUJK wajib dicantumkan."),
  address: z.string().min(10, "Alamat utama minimal harus 10 karakter."),
  city: z.string().min(3, "Nama kota administratif wajib diisi."),
  province: z.string().min(3, "Provinsi operasional wajib dicantumkan."),
  pic: z.string().min(3, "Nama PIC direktur utama minimal 3 karakter."),
  email: z.string().email("Tulis alamat email operasional yang sah."),
  whatsapp: z.string().regex(/^\+?62\d{9,13}$/, "Nomor WhatsApp wajib diawali format +62 / 62 diikuti 9-13 digit."),
  website: z.string().url("Sertakan URL website yang valid (misal: https://...)").optional().or(z.literal("")),
  companyProfile: z.string().min(20, "Deskripsi company profile singkat minimal 20 karakter.")
});

type RegistrationInputs = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSuccess: (data: any) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationInputs>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      nib: "",
      npwp: "",
      sbu: "",
      siujk: "",
      address: "",
      city: "",
      province: "",
      pic: "",
      email: "",
      whatsapp: "628",
      website: "",
      companyProfile: ""
    }
  });

  const onSubmitForm = async (data: RegistrationInputs) => {
    // Register the contractor inside our database engine
    const newContractor = db.registerContractor({
      ...data,
      website: data.website || "",
      logo: "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&h=120&q=80",
      cover: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&h=300&q=80",
      yearFounded: new Date().getFullYear(),
      employeeCount: 25,
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    onSuccess(newContractor);
    setCreatedProfile(newContractor);
    setIsSuccess(true);
    reset();
  };

  if (isSuccess && createdProfile) {
    return (
      <div className="bg-[#1E293B]/40 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto font-sans shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">Pendaftaran Berhasil Dikirim!</h3>
        <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
          PT {createdProfile.name} telah berhasil terdaftar di sistem E-PROC. Berkas legalitas Anda sedang dalam proses verifikasi antrian otomatis oleh Divisi Procurement.
        </p>

        <div className="mt-6 bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Nomor Registrasi (ID):</span>
            <span className="text-blue-400 font-semibold font-mono uppercase">EPROC-{Math.floor(1000 + Math.random()*9000)}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-900 pb-2 mb-1">
            <span className="text-slate-500">Email Akses Log In:</span>
            <span className="text-emerald-400 font-mono font-bold select-all">{createdProfile.email}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-900 pb-2 mb-1">
            <span className="text-slate-500">Kata Sandi Default:</span>
            <span className="text-slate-300 font-mono">password123 (atau email apa saja)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Nomor Induk Berusaha:</span>
            <span className="text-slate-300 font-mono">{createdProfile.nib}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Alamat Perusahaan:</span>
            <span className="text-slate-300">{createdProfile.city}, {createdProfile.province}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-500">Status Awal:</span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">PENDING VERIFICATION</span>
          </div>
        </div>

        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs px-5 py-2.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
        >
          Form Registrasi Baru
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B]/40 backdrop-blur-md p-7 rounded-2xl border border-slate-700/50 shadow-xl max-w-4xl mx-auto font-sans">
      <div className="mb-6 flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <Building2 className="w-5 h-5 text-blue-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-wide text-left">Registrasi Rekanan Kontraktor Baru</h2>
          <p className="text-xs text-slate-400 text-left mt-0.5">Isi detail kelengkapan legalitas dan identitas usaha Anda sesuai akta sah Kemenkumham.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 text-left">
        {/* Identitas Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nama Resmi Badan Usaha</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                {...register("name")}
                placeholder="cth: PT Wijaya Karya Prakasa"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nama PIC / Direktur Utama</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                {...register("pic")}
                placeholder="cth: Ir. Ahmad Fauzi"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            {errors.pic && <p className="text-[10px] text-rose-500 mt-1">{errors.pic.message}</p>}
          </div>
        </div>

        {/* Legalitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nomor Induk Berusaha (NIB - 13 digit)</label>
            <input
              {...register("nib")}
              placeholder="cth: 9120301410294"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
            {errors.nib && <p className="text-[10px] text-rose-500 mt-1">{errors.nib.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">NPWP Badan Usaha (15 digit)</label>
            <input
              {...register("npwp")}
              placeholder="cth: 01.234.567.8-012.000"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
            {errors.npwp && <p className="text-[10px] text-rose-500 mt-1">{errors.npwp.message}</p>}
          </div>
        </div>

        {/* SIUJK & SBU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nomor Sertifikat SBU (Spesialisasi KBLI)</label>
            <input
              {...register("sbu")}
              placeholder="cth: BG009 - Gedung Fasilitas Kesehatan"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
            {errors.sbu && <p className="text-[10px] text-rose-500 mt-1">{errors.sbu.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Izin Operasional SIUJK</label>
            <input
              {...register("siujk")}
              placeholder="cth: SIUJK-1-12001-91203"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
            {errors.siujk && <p className="text-[10px] text-rose-500 mt-1">{errors.siujk.message}</p>}
          </div>
        </div>

        {/* Alamat Teritorial */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Alamat Lengkap Kantor Pusat</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              {...register("address")}
              placeholder="cth: Gedung Grha Nusantara Lt 4, Jl. DI Panjaitan Kav. 10"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          {errors.address && <p className="text-[10px] text-rose-500 mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kota / Kabupaten Administratif</label>
            <input
              {...register("city")}
              placeholder="cth: Jakarta Selatan"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
            {errors.city && <p className="text-[10px] text-rose-500 mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Provinsi Operasional</label>
            <input
              {...register("province")}
              placeholder="cth: DKI Jakarta"
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
            {errors.province && <p className="text-[10px] text-rose-500 mt-1">{errors.province.message}</p>}
          </div>
        </div>

        {/* Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">WhatsApp / Telepon Kantor</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                {...register("whatsapp")}
                placeholder="cth: 62812345678"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
            {errors.whatsapp && <p className="text-[10px] text-rose-500 mt-1">{errors.whatsapp.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Operasional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                {...register("email")}
                placeholder="cth: tender@wijayakarya.co.id"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Website Resmi (Opsional)</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                {...register("website")}
                placeholder="cth: https://wijayakarya.co.id"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            {errors.website && <p className="text-[10px] text-rose-500 mt-1">{errors.website.message}</p>}
          </div>
        </div>

        {/* Deskripsi Profile singkat */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company Profile Singkat (Pengalaman & Kapabilitas)</label>
          <textarea
            {...register("companyProfile")}
            rows={3}
            placeholder="Deklarasikan track record, spesialisasi peralatan konstruksi, ketersediaan tenaga ahli SKA Utama, serta volume pengerjaan proyek berskala makro..."
            className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-550 transition-all"
          />
          {errors.companyProfile && <p className="text-[10px] text-rose-500 mt-1">{errors.companyProfile.message}</p>}
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-900 flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
          >
            {isSubmitting ? (
              <span>Mengunggah Berkas...</span>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Submit Registrasi Legalitas</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
