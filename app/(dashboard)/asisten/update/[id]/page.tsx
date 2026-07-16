"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface Assistant {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  profileUrl: string;
  nomor_telepon: string;
  id_laboratorium?: string;
}

const mockAssistants: Assistant[] = [
  {
    id: "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
    username: "asisten_tono",
    email: "tono@admin.com",
    nama_lengkap: "Tono Wijaya M.T.",
    profileUrl: "https://example.com/profiles/tono.jpg",
    nomor_telepon: "089876543210",
    id_laboratorium: "d3b07384-d113-41e9-a7e8-e21501b17a10",
  },
  {
    id: "3c9a7c6f-b9de-4b13-ba14-5d51381dead1",
    username: "asisten_riri",
    email: "riri.s@admin.com",
    nama_lengkap: "Riri Safitri",
    profileUrl: "",
    nomor_telepon: "081298765432",
    id_laboratorium: "e4c07384-e223-41e9-a7e8-e21501b17a22",
  },
  {
    id: "4d9a7c6f-c9de-4b13-ba14-5d51381deae2",
    username: "asisten_fandi",
    email: "fandi.a@admin.com",
    nama_lengkap: "Fandi Ahmad",
    profileUrl: "",
    nomor_telepon: "082345678901",
    id_laboratorium: "d3b07384-d113-41e9-a7e8-e21501b17a10",
  },
];

export default function UpdateAssistantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [idLaboratorium, setIdLaboratorium] = useState("");

  // Load existing details
  useEffect(() => {
    const fetchAssistantDetails = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/laboran/asisten/${id}`);
        const result = response.data;
        if (result.success && result.data) {
          const u = result.data;
          setUsername(u.username || "");
          setEmail(u.email || "");
          setNamaLengkap(u.nama_lengkap || "");
          setProfileUrl(u.profileUrl || "");
          setNomorTelepon(u.nomor_telepon || "");
          setIdLaboratorium(u.id_laboratorium || "");
          return;
        }
        throw new Error("Tidak dapat memuat detail asisten.");
      } catch (err) {
        console.warn("Failed fetching detail from server, seeking in local mocks:", err);
        const match = mockAssistants.find((a) => a.id === id);
        if (match) {
          setUsername(match.username);
          setEmail(match.email);
          setNamaLengkap(match.nama_lengkap);
          setProfileUrl(match.profileUrl);
          setNomorTelepon(match.nomor_telepon);
          setIdLaboratorium(match.id_laboratorium || "");
        } else {
          setErrorMsg("Data asisten tidak ditemukan.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchAssistantDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.put("/asisten/profile", {
        nama_lengkap: namaLengkap,
        nomor_telepon: nomorTelepon,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal memperbarui profil asisten.");
      }

      setSuccessMsg("Asisten berhasil diperbarui!");
      setTimeout(() => {
        router.push("/asisten");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Failed to fetch")) {
        setSuccessMsg("API Offline: Perubahan disimulasikan berhasil secara lokal!");
        setTimeout(() => {
          router.push("/asisten");
        }, 1500);
      } else {
        setErrorMsg(err.message || "Error saat mengirim perubahan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Portal Laboran</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Perbarui Detail Asisten</h2>
        </div>
        <Link
          href="/asisten"
          className="text-xs font-bold text-blue-brand-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
          </svg>
          Kembali ke Daftar
        </Link>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-6">
        {errorMsg && (
          <div className="bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-xl text-xs flex gap-2.5 items-start mb-4">
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl text-xs flex gap-2.5 items-start mb-4">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: Tono Wijaya"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Username (Hanya-Baca)
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={username}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Alamat Email (Hanya-Baca)
            </label>
            <input
              type="email"
              readOnly
              disabled
              value={email}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nomor Telepon
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: 081234567890"
              value={nomorTelepon}
              onChange={(e) => setNomorTelepon(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              URL Foto Profil
            </label>
            <input
              type="url"
              disabled={isLoading}
              placeholder="Contoh: https://example.com/profiles/tono.jpg"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="sm:col-span-2 mt-4 w-full py-3 bg-blue-brand-600 hover:bg-blue-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Menyimpan perubahan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
