"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface BapEntry {
  id: string;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  jumlah_jam: number;
  deskripsi_pekerjaan: string;
  paraf: number;
  type: string;
  id_laboratorium: string;
}

const mockBaps: BapEntry[] = [
  {
    id: "bap-1111-2222-3333",
    tanggal: "2026-07-14",
    jam_masuk: "08:00",
    jam_keluar: "12:00",
    jumlah_jam: 4,
    deskripsi_pekerjaan: "Membantu praktikum mandiri rekayasa perangkat lunak",
    paraf: 1,
    type: "kegiatan",
    id_laboratorium: "d3b07384-d113-41e9-a7e8-e21501b17a10",
  },
  {
    id: "bap-4444-5555-6666",
    tanggal: "2026-07-15",
    jam_masuk: "13:00",
    jam_keluar: "16:00",
    jumlah_jam: 3,
    deskripsi_pekerjaan: "Instalasi compiler GCC dan konfigurasi path di Linux",
    paraf: 0,
    type: "kegiatan",
    id_laboratorium: "e4c07384-e223-41e9-a7e8-e21501b17a22",
  },
];

export default function UpdateBapPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamKeluar, setJamKeluar] = useState("12:00");
  const [deskripsi, setDeskripsi] = useState("");
  const [type, setType] = useState("kegiatan");
  const [paraf, setParaf] = useState<number>(0);
  const [idLaboratorium, setIdLaboratorium] = useState("");

  // Load existing details
  useEffect(() => {
    const fetchBapDetails = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/bap/${id}`);
        const result = response.data;
        if (result.success && result.data) {
          const b = result.data;
          setTanggal(b.tanggal || "");
          setJamMasuk(b.jam_masuk?.slice(0, 5) || "08:00");
          setJamKeluar(b.jam_keluar?.slice(0, 5) || "12:00");
          setDeskripsi(b.deskripsi_pekerjaan || "");
          setType(b.type || "kegiatan");
          setParaf(b.paraf || 0);
          setIdLaboratorium(b.id_laboratorium || "");
          return;
        }
        throw new Error("Gagal memuat rincian laporan.");
      } catch (err) {
        console.warn("Failed fetching from backend, searching local mocks:", err);
        const match = mockBaps.find((b) => b.id === id);
        if (match) {
          setTanggal(match.tanggal);
          setJamMasuk(match.jam_masuk);
          setJamKeluar(match.jam_keluar);
          setDeskripsi(match.deskripsi_pekerjaan);
          setType(match.type);
          setParaf(match.paraf);
          setIdLaboratorium(match.id_laboratorium);
        } else {
          setErrorMsg("Sesi rekam BAP tidak ditemukan.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchBapDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Calculate hours duration dynamically
    const startHour = parseInt(jamMasuk.split(":")[0]);
    const startMin = parseInt(jamMasuk.split(":")[1]);
    const endHour = parseInt(jamKeluar.split(":")[0]);
    const endMin = parseInt(jamKeluar.split(":")[1]);
    let hours = endHour - startHour;
    let mins = endMin - startMin;
    if (mins < 0) {
      hours -= 1;
      mins += 60;
    }
    const duration = parseFloat((hours + mins / 60).toFixed(2)) || 1;

    try {
      const response = await api.put(`/bap/${id}`, {
        tanggal,
        jam_masuk: `${jamMasuk}:00`,
        jam_keluar: `${jamKeluar}:00`,
        jumlah_jam: duration,
        deskripsi_pekerjaan: deskripsi,
        paraf,
        type,
        id_laboratorium: idLaboratorium,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal memperbarui laporan BAP.");
      }

      setSuccessMsg("Laporan BAP berhasil diperbarui!");
      setTimeout(() => {
        router.push("/bap");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Failed to fetch")) {
        setSuccessMsg("API Offline: Perubahan BAP disimulasikan berhasil!");
        setTimeout(() => {
          router.push("/bap");
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
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Portal Laporan</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Perbarui Sesi BAP</h2>
        </div>
        <Link
          href="/bap"
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
              Tanggal Kegiatan
            </label>
            <input
              type="date"
              required
              disabled={isLoading}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Tipe Kegiatan
            </label>
            <select
              disabled={isLoading}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            >
              <option value="kegiatan">Kegiatan (Aktivitas Standar)</option>
              <option value="praktikum">Praktikum (Sesi Asisten Lab)</option>
              <option value="pemeliharaan">Pemeliharaan (Perawatan/Perbaikan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jam Masuk
            </label>
            <input
              type="time"
              required
              disabled={isLoading}
              value={jamMasuk}
              onChange={(e) => setJamMasuk(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jam Keluar
            </label>
            <input
              type="time"
              required
              disabled={isLoading}
              value={jamKeluar}
              onChange={(e) => setJamKeluar(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              UUID Laboratorium
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={idLaboratorium}
              onChange={(e) => setIdLaboratorium(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono placeholder-slate-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Deskripsi Pekerjaan Detail
            </label>
            <textarea
              required
              disabled={isLoading}
              rows={4}
              placeholder="Jelaskan tugas dan barang yang diverifikasi..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="paraf"
              disabled={isLoading}
              checked={paraf === 1}
              onChange={(e) => setParaf(e.target.checked ? 1 : 0)}
              className="w-4 h-4 bg-slate-950 border border-slate-800 rounded focus:ring-blue-500 text-blue-500"
            />
            <label htmlFor="paraf" className="text-xs text-slate-400">
              Disetujui (Tandatangani Laporan)
            </label>
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
