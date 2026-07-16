"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface InventoryItem {
  id: string;
  nama: string;
  kode: string;
  jumlah: number;
  kondisi: string; // e.g. "Baik", "Rusak Ringan", "Rusak Berat"
  id_kategori: string;
  id_lokasi: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "barang-101",
    nama: "Osiloskop Digital GW Instek",
    kode: "GW-OSC-01",
    jumlah: 4,
    kondisi: "Baik",
    id_kategori: "kat-01",
    id_lokasi: "lok-01",
  },
  {
    id: "barang-102",
    nama: "Router Cisco ISR 4331",
    kode: "CISCO-RTR-04",
    jumlah: 2,
    kondisi: "Baik",
    id_kategori: "kat-02",
    id_lokasi: "lok-02",
  },
  {
    id: "barang-103",
    nama: "Multimeter Digital Fluke 17B+",
    kode: "FLUKE-MM-09",
    jumlah: 10,
    kondisi: "Rusak Ringan",
    id_kategori: "kat-01",
    id_lokasi: "lok-01",
  },
];

export default function InventarisPage() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get("/barang");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setItems(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching inventory, using mock list fallback:", err);
      }
    };
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const term = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(term) ||
        item.kode.toLowerCase().includes(term) ||
        item.kondisi.toLowerCase().includes(term)
      );
    });
  }, [items, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/barang/${id}`);
      setItems(items.filter((item) => item.id !== id));
      setSuccessMsg("Barang berhasil dihapus.");
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
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Manajemen Aset</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Inventaris Laboratorium (Inventaris)</h2>
        </div>

        <Link
          href="/inventaris/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Tambah Aset Inventaris
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

      {/* Search Input */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter inventaris berdasarkan nama atau kode..."
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
                <th className="py-3 px-4">Nama Barang Aset</th>
                <th className="py-3 px-4">Kode Aset</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4">UUID Kategori</th>
                <th className="py-3 px-4">UUID Lokasi</th>
                <th className="py-3 px-4">Status / Kondisi</th>
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
                    <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-500">
                      {item.kode}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-brand-600 dark:text-blue-400">
                      {item.jumlah} unit
                    </td>
                    <td className="py-3.5 px-4 text-[10px] font-mono text-slate-400">
                      {item.id_kategori}
                    </td>
                    <td className="py-3.5 px-4 text-[10px] font-mono text-slate-400">
                      {item.id_lokasi}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.kondisi === "Baik"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : item.kondisi === "Rusak Ringan"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                        }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/inventaris/update/${item.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
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
                    Tidak ada barang di dalam inventaris.
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
