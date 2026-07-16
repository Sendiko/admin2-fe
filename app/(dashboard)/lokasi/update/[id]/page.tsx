"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface Location {
  id: string;
  nama: string;
}

const mockLocations: Location[] = [
  { id: "lok-01", nama: "Locker Utama Asisten E1" },
  { id: "lok-02", nama: "Rak Lemari Penyimpanan E2" },
  { id: "lok-03", nama: "Laci Toolkit Meja Dosen" },
];

export default function UpdateLokasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState("");

  // Load existing details
  useEffect(() => {
    const fetchLocationDetails = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/lokasi/${id}`);
        const result = response.data;
        if (result.success && result.data) {
          setNama(result.data.nama || "");
          return;
        }
        throw new Error("Tidak dapat memuat rincian lokasi.");
      } catch (err) {
        console.warn("Failed fetching from backend, searching local mocks:", err);
        const match = mockLocations.find((loc) => loc.id === id);
        if (match) {
          setNama(match.nama);
        } else {
          setErrorMsg("Data lokasi tidak ditemukan.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchLocationDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.put(`/lokasi/${id}`, { nama });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal memperbarui lokasi penyimpanan.");
      }

      setSuccessMsg("Lokasi penyimpanan berhasil diperbarui!");
      setTimeout(() => {
        router.push("/lokasi");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Failed to fetch")) {
        setSuccessMsg("API Offline: Perubahan disimulasikan berhasil!");
        setTimeout(() => {
          router.push("/lokasi");
        }, 1500);
      } else {
        setErrorMsg(err.message || "Error saat mengirim perubahan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Infrastruktur</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Perbarui Lokasi Penyimpanan</h2>
        </div>
        <Link
          href="/lokasi"
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Loker/Laci
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: Locker Utama Asisten E1"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-3 bg-blue-brand-600 hover:bg-blue-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Menyimpan perubahan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
