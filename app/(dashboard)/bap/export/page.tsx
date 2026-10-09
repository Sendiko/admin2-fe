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
  paraf?: number;
  type?: string;
  id_laboratorium?: string;
  laboratorium?: { id: string; kode: string; nama: string };
  user?: { nama_lengkap?: string; username?: string; nim?: string };
}

// 19 sample records matching example spreadsheet
const SAMPLE_BAP_RECORDS: BapEntry[] = [
  { id: "s1", tanggal: "2026-08-03", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s2", tanggal: "2026-08-04", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s3", tanggal: "2026-08-05", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s4", tanggal: "2026-08-06", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s5", tanggal: "2026-08-08", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s6", tanggal: "2026-08-10", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s7", tanggal: "2026-08-11", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s8", tanggal: "2026-08-12", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s9", tanggal: "2026-08-13", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s10", tanggal: "2026-08-15", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan proses development aplikasi SIMLAB Mobile." },
  { id: "s11", tanggal: "2026-08-18", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Mempersiapkan alat dan bahan untuk proses seleksi asisten laboratorium." },
  { id: "s12", tanggal: "2026-08-19", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Mempersiapkan alat dan bahan untuk proses seleksi asisten laboratorium." },
  { id: "s13", tanggal: "2026-08-20", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Membantu proses seleksi asisten laboratorium." },
  { id: "s14", tanggal: "2026-08-21", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Membantu proses seleksi asisten laboratorium." },
  { id: "s15", tanggal: "2026-08-24", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan membongkar power supply dari komputer lama dari gudang." },
  { id: "s16", tanggal: "2026-08-25", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan membongkar power supply dari komputer lama dari gudang." },
  { id: "s17", tanggal: "2026-08-26", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan membongkar power supply dari komputer lama dari gudang." },
  { id: "s18", tanggal: "2026-08-27", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan membongkar power supply dari komputer lama dari gudang." },
  { id: "s19", tanggal: "2026-08-28", jam_masuk: "09:30:00", jam_keluar: "15:30:00", jumlah_jam: 6, deskripsi_pekerjaan: "Melanjutkan membongkar power supply dari komputer lama dari gudang." },
];

const INDONESIAN_MONTHS = [
  { value: "01", name: "JANUARI" },
  { value: "02", name: "FEBRUARI" },
  { value: "03", name: "MARET" },
  { value: "04", name: "APRIL" },
  { value: "05", name: "MEI" },
  { value: "06", name: "JUNI" },
  { value: "07", name: "JULI" },
  { value: "08", name: "AGUSTUS" },
  { value: "09", name: "SEPTEMBER" },
  { value: "10", name: "OKTOBER" },
  { value: "11", name: "NOVEMBER" },
  { value: "12", name: "DESEMBER" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function formatTime(timeStr: string) {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5).replace(":", ".");
}

export default function BapExportPage() {
  const [baps, setBaps] = useState<BapEntry[]>([]);
  const [useSampleData, setUseSampleData] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const m = new Date().getMonth() + 1;
    return String(m).padStart(2, "0");
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));
  const [selectedLabId, setSelectedLabId] = useState("ALL");
  const [labs, setLabs] = useState<{ id: string; kode: string; nama: string }[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Metadata
  const [nama, setNama] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u.nama_lengkap) return u.nama_lengkap.toUpperCase();
        }
      } catch { /* ignore */ }
    }
    return "MUHAMMAD RIZKY SENDIKO";
  });
  const [nim, setNim] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u.nim) return u.nim;
          if (u.username && /^\d+$/.test(u.username)) return u.username;
        }
      } catch { /* ignore */ }
    }
    return "707022680004";
  });
  const [namaLab, setNamaLab] = useState("BASIC PROGRAMMING & VERSATILE (BRAVE) LABORATORY");
  const [prodi, setProdi] = useState("D3 REKAYASA PERANGKAT LUNAK APLIKASI");
  const [laboran, setLaboran] = useState("Nama PIC Laboran");

  // Load labs + BAP data
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await api.get("/laboratorium");
        if (res.data.success && Array.isArray(res.data.data)) {
          setLabs(res.data.data);
        }
      } catch (err) {
        console.warn("Failed fetching labs:", err);
      }
    };

    const fetchBaps = async () => {
      try {
        const res = await api.get("/bap");
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setBaps(res.data.data);
          setUseSampleData(false);
          return;
        }
      } catch (err) {
        console.warn("Using sample BAP records:", err);
      }
      setUseSampleData(true);
    };

    fetchLabs();
    fetchBaps();
  }, []);

  // Filtered records matching selected month/year/lab
  const activeRecords = useMemo(() => {
    const source = useSampleData || baps.length === 0 ? SAMPLE_BAP_RECORDS : baps;
    return source
      .filter((b) => {
        if (!b.tanggal) return false;
        const [yr, mo] = b.tanggal.split("-");
        if (selectedYear && yr !== selectedYear) return false;
        if (selectedMonth !== "ALL" && mo !== selectedMonth) return false;
        if (selectedLabId !== "ALL" && b.id_laboratorium && b.id_laboratorium !== selectedLabId) return false;
        return true;
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [baps, useSampleData, selectedMonth, selectedYear, selectedLabId]);

  const totalJam = useMemo(() => activeRecords.reduce((s, b) => s + (Number(b.jumlah_jam) || 0), 0), [activeRecords]);

  const bulanName = useMemo(() => {
    if (selectedMonth === "ALL") return "SEMUA BULAN";
    return INDONESIAN_MONTHS.find((m) => m.value === selectedMonth)?.name ?? selectedMonth;
  }, [selectedMonth]);

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const params = new URLSearchParams({
        nama,
        nim,
        nama_lab: namaLab,
        prodi,
        bulan: selectedMonth === "ALL" ? "" : selectedMonth,
        tahun: selectedYear,
        laboran,
        records: encodeURIComponent(JSON.stringify(activeRecords)),
      });

      const res = await fetch(`/api/bap/export?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Export gagal.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BAP_${bulanName}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export gagal.";
      setExportError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <Link href="/bap" className="hover:text-blue-brand-600 transition-colors">BAP</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">Export Excel</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Export Berita Acara Pekerjaan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mengisi template <span className="font-semibold text-slate-500 dark:text-slate-400">BAP Agustus Sendiko.xlsx</span> secara otomatis
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <Link
            href="/bap"
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </Link>

          <button
            onClick={handleExportExcel}
            disabled={isExporting || activeRecords.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengekspor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Unduh .xlsx
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex gap-2 items-center">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {exportError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: Filters & Identity ──────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Period filter card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Periode Data</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Bulan</option>
                  {INDONESIAN_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Tahun</label>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Laboratorium</label>
                <select
                  value={selectedLabId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLabId(val);
                    if (val !== "ALL") {
                      const lab = labs.find((l) => l.id === val);
                      if (lab) setNamaLab(lab.nama.toUpperCase());
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Lab</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>{l.kode} - {l.nama}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setUseSampleData(!useSampleData)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 mt-1 ${
                  useSampleData
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                {useSampleData ? "✓ Data Contoh Aktif (19 Sesi)" : "Gunakan Data Contoh"}
              </button>
            </div>
          </div>

          {/* Identity card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Identitas Header</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Nama Asisten", value: nama, setter: (v: string) => setNama(v.toUpperCase()) },
                { label: "NIM", value: nim, setter: setNim },
                { label: "Nama Lab", value: namaLab, setter: (v: string) => setNamaLab(v.toUpperCase()) },
                { label: "Program Studi", value: prodi, setter: (v: string) => setProdi(v.toUpperCase()) },
                { label: "Nama PIC Laboran (tanda tangan)", value: laboran, setter: setLaboran },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Preview table ──────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Summary bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase text-slate-400">Periode</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {bulanName} {selectedYear}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Sesi Tercatat</p>
              <p className="text-sm font-bold text-blue-brand-600 dark:text-blue-400 mt-0.5">
                {activeRecords.length} Sesi
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Total Jam</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {totalJam} Jam
              </p>
            </div>
            {activeRecords.length > 20 && (
              <div className="w-full">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  ⚠ Template mendukung maksimal 20 baris. {activeRecords.length - 20} sesi terakhir tidak akan masuk ke Excel.
                </p>
              </div>
            )}
          </div>

          {/* Preview Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Pratinjau Data yang Akan Diekspor
              </p>
              <span className="text-[11px] text-slate-400 font-medium">(maks. 20 baris)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold text-[11px] bg-slate-50/60 dark:bg-slate-900">
                    <th className="py-2.5 px-3 text-center w-8">No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Jam Masuk</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Jam Keluar</th>
                    <th className="py-2.5 px-3 text-center">Jam</th>
                    <th className="py-2.5 px-3">Deskripsi Pekerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {activeRecords.length > 0 ? (
                    activeRecords.slice(0, 20).map((b, i) => (
                      <tr key={b.id} className={`transition-colors ${i >= 20 ? "opacity-40" : "hover:bg-slate-50/40 dark:hover:bg-slate-800/20"}`}>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                          {i + 1}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-medium">
                          {formatDate(b.tanggal)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {formatTime(b.jam_masuk)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {formatTime(b.jam_keluar)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-brand-600 dark:text-blue-400">
                          {b.jumlah_jam}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {b.deskripsi_pekerjaan}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada sesi BAP pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {activeRecords.length > 0 && (
              <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  {isExporting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengekspor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Unduh BAP_{bulanName}_{selectedYear}.xlsx
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Template info card */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-bold mb-1">ℹ️ Tentang Template Excel</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
              <li>Menggunakan template <strong>BAP Agustus Sendiko.xlsx</strong> — styling, logo, dan format dijaga utuh.</li>
              <li>Sel <strong>D4–D10</strong> diisi otomatis (Nama, NIM, Lab, Prodi, Bulan, Tahun, Total Jam).</li>
              <li>Baris data dimulai dari baris <strong>13</strong> hingga maks. baris <strong>32</strong> (20 sesi).</li>
              <li>Kolom <strong>Paraf Asisten</strong> dibiarkan kosong untuk tanda tangan fisik.</li>
              <li>Logo Telkom Applied Science School dan format sel <em>dipertahankan dari template</em>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
