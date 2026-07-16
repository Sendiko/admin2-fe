"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Category {
  id: string;
  nama: string;
}

const mockCategories: Category[] = [
  { id: "kat-01", nama: "Alat Ukur Elektronik" },
  { id: "kat-02", nama: "Perangkat Jaringan Komputer" },
  { id: "kat-03", nama: "Perkakas Mekanik" },
];

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/kategori");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching categories, using mock list fallback:", err);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/kategori/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      setSuccessMsg("Kategori berhasil dihapus.");
    } catch (err) {
      setCategories(categories.filter((c) => c.id !== id));
      setSuccessMsg("Kategori dihapus secara lokal (API offline).");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Klasifikasi</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Kategori Barang (Kategori)</h2>
        </div>

        <Link
          href="/kategori/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Tambah Kategori
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
          placeholder="Filter kategori..."
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
                <th className="py-3 px-4">UUID Kategori</th>
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {cat.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {cat.nama}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/kategori/update/${cat.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
                    Tidak ada kategori terdaftar.
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
