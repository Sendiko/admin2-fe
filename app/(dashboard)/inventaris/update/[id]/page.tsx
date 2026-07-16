"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface InventoryItem {
  id: string;
  nama: string;
  kode: string;
  jumlah: number;
  kondisi: string;
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

export default function UpdateInventarisPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [kondisi, setKondisi] = useState("Baik");
  const [idKategori, setIdKategori] = useState("");
  const [idLokasi, setIdLokasi] = useState("");

  // Load existing details
  useEffect(() => {
    const fetchItemDetails = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/barang/${id}`);
        const result = response.data;
        if (result.success && result.data) {
          const item = result.data;
          setNama(item.nama || "");
          setKode(item.kode || "");
          setJumlah(item.jumlah || 1);
          setKondisi(item.kondisi || "Baik");
          setIdKategori(item.id_kategori || "");
          setIdLokasi(item.id_lokasi || "");
          return;
        }
        throw new Error("Tidak dapat memuat detail barang.");
      } catch (err) {
        console.warn("Failed fetching from backend, searching local mocks:", err);
        const match = mockInventory.find((item) => item.id === id);
        if (match) {
          setNama(match.nama);
          setKode(match.kode);
          setJumlah(match.jumlah);
          setKondisi(match.kondisi);
          setIdKategori(match.id_kategori);
          setIdLokasi(match.id_lokasi);
        } else {
          setErrorMsg("Data barang tidak ditemukan.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchItemDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.put(`/barang/${id}`, {
        nama,
        kode,
        jumlah: Number(jumlah),
        kondisi,
        id_kategori: idKategori,
        id_lokasi: idLokasi,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal memperbarui data barang.");
      }

      setSuccessMsg("Barang inventaris berhasil diperbarui!");
      setTimeout(() => {
        router.push("/inventaris");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Failed to fetch")) {
        setSuccessMsg("API Offline: Perubahan disimulasikan berhasil!");
        setTimeout(() => {
          router.push("/inventaris");
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
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Manajemen Aset</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Perbarui Aset Inventaris</h2>
        </div>
        <Link
          href="/inventaris"
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
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nama Barang Aset
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: Osiloskop Digital GW Instek"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Serial / Kode Aset
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: GW-OSC-01"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jumlah
            </label>
            <input
              type="number"
              required
              disabled={isLoading}
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Kondisi Aset
            </label>
            <select
              disabled={isLoading}
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              UUID Kategori
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={idKategori}
              onChange={(e) => setIdKategori(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              UUID Lokasi Penyimpanan
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={idLokasi}
              onChange={(e) => setIdLokasi(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
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
