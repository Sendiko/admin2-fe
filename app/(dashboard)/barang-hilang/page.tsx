"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface LostItem {
  id: string;
  nama: string;
  lokasi_penemuan: string;
  ditemukan_oleh: string;
  tanggal_ditemukan: string;
  lokasi_penyimpanan: string;
}

const mockLostItems: LostItem[] = [
  {
    id: "lost-1111",
    nama: "Kalkulator Casio fx-991EX",
    lokasi_penemuan: "Meja Lab B2 (Computer Network)",
    ditemukan_oleh: "Tono Wijaya",
    tanggal_ditemukan: "2026-07-14",
    lokasi_penyimpanan: "Loker B2",
  },
  {
    id: "lost-2222",
    nama: "Flashdisk SanDisk 64GB",
    lokasi_penemuan: "Keyboard PC-08 Lab E1",
    ditemukan_oleh: "Riri Safitri",
    tanggal_ditemukan: "2026-07-15",
    lokasi_penyimpanan: "Meja Asisten E1",
  },
];

export default function BarangHilangPage() {
  const [items, setItems] = useState<LostItem[]>(mockLostItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await api.get("/barang-hilang");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setItems(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching lost items, using mock list fallback:", err);
      }
    };
    fetchLostItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const term = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(term) ||
        item.lokasi_penemuan.toLowerCase().includes(term) ||
        item.ditemukan_oleh.toLowerCase().includes(term) ||
        item.lokasi_penyimpanan.toLowerCase().includes(term)
      );
    });
  }, [items, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/barang-hilang/${id}`);
      setItems(items.filter((item) => item.id !== id));
      setSuccessMsg("Laporan barang hilang berhasil dihapus.");
    } catch (err) {
      setItems(items.filter((item) => item.id !== id));
      setSuccessMsg("Barang dihapus secara lokal (API offline).");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Keamanan Inventaris</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Log Temuan Barang Hilang</h2>
        </div>

        <Link
          href="/barang-hilang/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Laporkan Barang Hilang
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
          placeholder="Filter barang hilang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400"
        />
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">Lokasi Temuan</th>
                <th className="py-3 px-4">Dilaporkan Oleh</th>
                <th className="py-3 px-4">Tanggal Ditemukan</th>
                <th className="py-3 px-4">Laci Penyimpanan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.nama}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-xs">
                      {item.lokasi_penemuan}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      {item.ditemukan_oleh}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-400">
                      {item.tanggal_ditemukan}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-brand-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40">
                        {item.lokasi_penyimpanan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/barang-hilang/update/${item.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
                        >
                          Klaim
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada barang hilang yang dilaporkan.
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
