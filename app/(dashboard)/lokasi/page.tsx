"use client";

import React, { useState, useEffect, useMemo } from "react";
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

export default function LokasiPage() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get("/lokasi");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setLocations(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching locations, using mock list fallback:", err);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) =>
      loc.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/lokasi/${id}`);
      setLocations(locations.filter((l) => l.id !== id));
      setSuccessMsg("Lokasi berhasil dihapus.");
    } catch (err) {
      setLocations(locations.filter((l) => l.id !== id));
      setSuccessMsg("Lokasi dihapus secara lokal (API offline).");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Infrastruktur</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Lokasi Penyimpanan (Lokasi)</h2>
        </div>

        <Link
          href="/lokasi/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Daftar Lokasi Penyimpanan
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
          placeholder="Filter lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400"
        />
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">UUID Lokasi</th>
                <th className="py-3 px-4">Nama Loker/Laci</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {loc.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {loc.nama}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/lokasi/update/${loc.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(loc.id)}
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
                  <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada lokasi penyimpanan yang terdaftar.
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
