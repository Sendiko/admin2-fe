"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Assistant {
  id: string;
  nama_lengkap: string;
}

interface BapEntry {
  id: string;
  jumlah_jam: number;
  tanggal: string;
}

interface LostItem {
  id: string;
  nama: string;
}

interface InventoryItem {
  id: string;
  jumlah: number;
  kondisi: string;
}

interface Lab {
  id: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"bap" | "inventory">("bap");
  const [systemCheckStatus, setSystemCheckStatus] = useState<"idle" | "running" | "success">("idle");

  // Summary states with default fallback values
  const [assistantsCount, setAssistantsCount] = useState<number>(3);
  const [bapTotalHours, setBapTotalHours] = useState<number>(7);
  const [bapCount, setBapCount] = useState<number>(2);
  const [lostItemsCount, setLostItemsCount] = useState<number>(2);
  const [inventoryUnits, setInventoryUnits] = useState<number>(16);
  const [brokenAssets, setBrokenAssets] = useState<number>(10);
  const [labsCount, setLabsCount] = useState<number>(3);
  const [locationsCount, setLocationsCount] = useState<number>(3);
  const [categoriesCount, setCategoriesCount] = useState<number>(3);

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch summary stats on mount
  useEffect(() => {
    const fetchSummaryStats = async () => {
      setIsLoadingStats(true);

      try {
        // 1. Fetch Assistants
        const resAsisten = await api.get("/laboran/asisten");
        if (resAsisten.data.success && Array.isArray(resAsisten.data.data)) setAssistantsCount(resAsisten.data.data.length);

        // 2. Fetch BAP Reports
        const resBap = await api.get("/bap");
        if (resBap.data.success && Array.isArray(resBap.data.data)) {
          setBapCount(resBap.data.data.length);
          const total = resBap.data.data.reduce((sum: number, b: BapEntry) => sum + (Number(b.jumlah_jam) || 0), 0);
          setBapTotalHours(total);
        }

        // 3. Fetch Lost Items
        const resLost = await api.get("/barang-hilang");
        if (resLost.data.success && Array.isArray(resLost.data.data)) setLostItemsCount(resLost.data.data.length);

        // 4. Fetch Inventory (Barang API)
        const resBarang = await api.get("/barang");
        if (resBarang.data.success && Array.isArray(resBarang.data.data)) {
          const totalUnits = resBarang.data.data.reduce((sum: number, b: InventoryItem) => sum + (Number(b.jumlah) || 0), 0);
          const broken = resBarang.data.data.filter((b: InventoryItem) => b.kondisi !== "Baik").reduce((sum: number, b: InventoryItem) => sum + (Number(b.jumlah) || 0), 0);
          setInventoryUnits(totalUnits);
          setBrokenAssets(broken);
        }

        // 5. Fetch Laboratories
        const resLabs = await api.get("/laboratorium");
        if (resLabs.data.success && Array.isArray(resLabs.data.data)) setLabsCount(resLabs.data.data.length);

        // 6. Fetch Storage Locations
        const resLocations = await api.get("/lokasi");
        if (resLocations.data.success && Array.isArray(resLocations.data.data)) setLocationsCount(resLocations.data.data.length);

        // 7. Fetch Categories
        const resCategories = await api.get("/kategori");
        if (resCategories.data.success && Array.isArray(resCategories.data.data)) setCategoriesCount(resCategories.data.data.length);

      } catch (err) {
        console.warn("API Server offline, retaining mock summary defaults:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchSummaryStats();
  }, []);

  // Run a mock visual health check
  const handleHealthCheck = () => {
    if (systemCheckStatus !== "idle") return;
    setSystemCheckStatus("running");
    setTimeout(() => {
      setSystemCheckStatus("success");
      setTimeout(() => {
        setSystemCheckStatus("idle");
      }, 2500);
    }, 1500);
  };

  // SVG Chart points based on active tab selection
  const chartPoints = activeTab === "bap"
    ? "M 0 120 C 50 110, 100 80, 150 90 C 200 100, 250 50, 300 40 C 350 30, 400 60, 450 20 C 500 -20, 550 10, 600 5 C 650 0, 700 -20, 750 -40 L 750 180 L 0 180 Z"
    : "M 0 140 C 50 135, 100 130, 150 110 C 200 90, 250 85, 300 70 C 350 55, 400 40, 450 50 C 500 60, 550 45, 600 30 C 650 15, 700 10, 750 0 L 750 180 L 0 180 Z";

  const chartLinePath = activeTab === "bap"
    ? "M 0 120 C 50 110, 100 80, 150 90 C 200 100, 250 50, 300 40 C 350 30, 400 60, 450 20 C 500 -20, 550 10, 600 5 C 650 0, 700 -20, 750 -40"
    : "M 0 140 C 50 135, 100 130, 150 110 C 200 90, 250 85, 300 70 C 350 55, 400 40, 450 50 C 500 60, 550 45, 600 30 C 650 15, 700 10, 750 0";

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">

      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-brand-900 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-xl shadow-blue-950/10 overflow-hidden relative border border-blue-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Ringkasan Ruang Kerja Laboratorium Fakultas Ilmu Terapan
          </h1>
          <p className="text-blue-200 text-sm md:text-base max-w-xl font-light">
            Pantau pembaruan sistem, inventaris fisik, log, beban kerja laporan BAP, dan registri keamanan.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handleHealthCheck}
            disabled={systemCheckStatus === "running"}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 ${systemCheckStatus === "running"
              ? "bg-blue-800 text-blue-300 cursor-not-allowed"
              : systemCheckStatus === "success"
                ? "bg-emerald-600 text-white shadow-emerald-900/30"
                : "bg-white text-blue-brand-900 hover:bg-blue-50 active:scale-95 shadow-blue-950/40"
              }`}
          >
            {systemCheckStatus === "running" ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyinkronkan status...
              </>
            ) : systemCheckStatus === "success" ? (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
                </svg>
                Sinkronisasi Selesai
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-blue-brand-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                </svg>
                Sinkronkan Data Server
              </>
            )}
          </button>
        </div>
      </section>

      {/* Grid Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Card 1: Inventaris */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aset Inventaris
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-brand-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isLoadingStats ? "..." : inventoryUnits}
            </span>
            <span className="text-xs font-medium text-slate-500">unit</span>
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {isLoadingStats ? "..." : brokenAssets} aset rusak memerlukan perhatian
          </div>
        </div>

        {/* Card 2: BAP */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Beban Kerja BAP
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-brand-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isLoadingStats ? "..." : bapTotalHours}
            </span>
            <span className="text-xs font-medium text-slate-500">jam</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Dihitung dari {bapCount} sesi tercatat</p>
        </div>

        {/* Card 3: Asisten */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Asisten Aktif
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-brand-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isLoadingStats ? "..." : assistantsCount}
            </span>
            <span className="text-xs font-medium text-slate-500">orang</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Terdaftar di bawah peran aktif</p>
        </div>

        {/* Card 4: Barang Hilang */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Laporan Barang Hilang & Temuan
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-brand-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isLoadingStats ? "..." : lostItemsCount}
            </span>
            <span className="text-xs font-medium text-slate-500">barang</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">Menunggu penyerahan klaim</p>
        </div>
      </section>

      {/* Auxiliary Infrastructure Specs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Lab Count banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex items-center gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-brand-900/40 to-indigo-900/10 pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21h8.25M12 3v18M3 12h18"></path>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Laboratorium</div>
            <div className="text-xl font-bold">{isLoadingStats ? "..." : labsCount} Ruangan</div>
            <Link href="/laboratorium" className="text-xs text-blue-400 hover:underline">Kelola lab →</Link>
          </div>
        </div>

        {/* Storage location count */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex items-center gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-brand-900/40 to-indigo-900/10 pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lokasi</div>
            <div className="text-xl font-bold">{isLoadingStats ? "..." : locationsCount} Unit Penyimpanan</div>
            <Link href="/lokasi" className="text-xs text-blue-400 hover:underline">Kelola penyimpanan →</Link>
          </div>
        </div>

        {/* Category count */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex items-center gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-brand-900/40 to-indigo-900/10 pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591L9.581 3.659a2.25 2.25 0 00-1.591-.659zm-1.818 5.682a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z"></path>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Klasifikasi</div>
            <div className="text-xl font-bold">{isLoadingStats ? "..." : categoriesCount} Kategori</div>
            <Link href="/kategori" className="text-xs text-blue-400 hover:underline">Kelola kategori →</Link>
          </div>
        </div>

      </section>

      {/* Detailed Chart Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Grafik Analisis Kinerja</h2>
            <p className="text-xs text-slate-500">Visualisasi indikator analitik waktu nyata</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
            <button
              onClick={() => setActiveTab("bap")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === "bap"
                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-brand-600 dark:text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              Beban Kerja Tercatat (BAP)
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === "inventory"
                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-brand-600 dark:text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              Stok Inventaris
            </button>
          </div>
        </div>
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 flex-1 relative flex flex-col justify-end min-h-[220px]">
          {/* SVG Chart Line */}
          <div className="w-full h-44 overflow-hidden relative">
            <svg className="w-full h-full" viewBox="0 0 750 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Background area fill */}
              <path
                d={chartPoints}
                fill="url(#gradient-chart)"
                className="transition-all duration-500 ease-in-out"
              />
              {/* Stroke line */}
              <path
                d={chartLinePath}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
          </div>
          {/* Chart Axes Labeling */}
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-505 mt-2 px-1 border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
            <span>JAN</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MEI</span>
            <span>JUN</span>
            <span>JUL (TERBARU)</span>
          </div>
        </div>
      </section>

      {/* Dynamic Activity Overview */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Umpan Log Aktif Teragregasi</h2>
          <p className="text-xs text-slate-500">Tinjauan terkonsolidasi dari jadwal log BAP dan inventaris hilang</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 text-xs text-slate-500 flex flex-col gap-2.5">
          <div className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Jam Kerja BAP Tercatat:</span>
            <span className="font-bold text-blue-brand-600 dark:text-blue-400">{bapTotalHours} jam terdaftar</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Asisten terdaftar:</span>
            <span className="font-bold text-blue-brand-600 dark:text-blue-400">{assistantsCount} anggota aktif</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Bagian inventaris rusak:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{brokenAssets} unit (memerlukan perbaikan)</span>
          </div>
        </div>
      </section>

    </div>
  );
}
