"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface BapEntry {
  id: string;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  jumlah_jam: number;
  deskripsi_pekerjaan: string;
  paraf: number; // 0 or 1
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

export default function BapPage() {
  const [baps, setBaps] = useState<BapEntry[]>(mockBaps);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchBaps = async () => {
      try {
        const response = await api.get("/bap");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setBaps(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching BAPs, using mock database fallback:", err);
      }
    };
    fetchBaps();
  }, []);

  const filteredBaps = useMemo(() => {
    return baps.filter((b) => {
      const term = searchQuery.toLowerCase();
      return (
        b.deskripsi_pekerjaan.toLowerCase().includes(term) ||
        b.tanggal.includes(term) ||
        b.type.toLowerCase().includes(term)
      );
    });
  }, [baps, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/bap/${id}`);
      setBaps(baps.filter((b) => b.id !== id));
      setSuccessMsg("BAP berhasil dihapus.");
    } catch (err) {
      setBaps(baps.filter((b) => b.id !== id));
      setSuccessMsg("BAP dihapus secara lokal (API offline).");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Portal Laporan</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Berita Acara Pekerjaan (BAP)</h2>
        </div>

        <Link
          href="/bap/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Catat BAP Kegiatan
        </Link>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl text-xs flex gap-2.5 items-start">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter / Search input */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter BAP berdasarkan deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400"
        />
      </div>

      {/* Tables list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Slot Waktu</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Deskripsi Pekerjaan</th>
                <th className="py-3 px-4">Tipe Kategori</th>
                <th className="py-3 px-4 text-center">Paraf (Disetujui)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredBaps.length > 0 ? (
                filteredBaps.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {b.tanggal}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {b.jam_masuk.slice(0, 5)} - {b.jam_keluar.slice(0, 5)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-brand-600 dark:text-blue-400">
                      {b.jumlah_jam} jam
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-xs truncate">
                      {b.deskripsi_pekerjaan}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {b.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${b.paraf === 1
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                        }`}>
                        {b.paraf === 1 ? "Disetujui" : "Tertunda"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/bap/update/${b.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada laporan BAP yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
