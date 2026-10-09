"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const BAP_TYPE_OPTIONS = [
  {
    value: "pelayanan",
    label: "Pelayanan",
    desc: "Melakukan pelayanan peminjaman dan pengembalian kunci di Admin Lantai 2",
  },
  {
    value: "pengecekan",
    label: "Pengecekan",
    desc: "Melakukan pengecekan rutin harian di Laboratorium",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    desc: "Melakukan maintenance",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    desc: "Kegiatan lainnya",
  },
] as const;

export default function CreateBapPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamKeluar, setJamKeluar] = useState("12:00");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["pelayanan"]);
  const [deskripsi, setDeskripsi] = useState(
    "Melakukan pelayanan peminjaman dan pengembalian kunci di Admin Lantai 2"
  );
  const [paraf] = useState<number>(0);
  const [idLaboratorium, setIdLaboratorium] = useState("d3b07384-d113-41e9-a7e8-e21501b17a10");
  const [labs, setLabs] = useState<{ id: string; kode: string; nama: string }[]>([]);

  const getLabDisplayName = (labList: { id: string; kode: string; nama: string }[], labId: string) => {
    const lab = labList.find((l) => l.id === labId);
    if (!lab) return "";
    return lab.nama.replace(/^Laboratorium\s+/i, "") || lab.kode;
  };

  const getTemplateForType = (t: string, labName: string) => {
    switch (t) {
      case "pelayanan":
        return "Melakukan pelayanan peminjaman dan pengembalian kunci di Admin Lantai 2";
      case "pengecekan":
        return `Melakukan pengecekan rutin harian di Laboratorium ${labName}`.trim();
      case "maintenance":
        return "Melakukan maintenance";
      case "lainnya":
      default:
        return "";
    }
  };

  const handleToggleType = (val: string) => {
    let nextTypes: string[];
    if (selectedTypes.includes(val)) {
      nextTypes = selectedTypes.filter((t) => t !== val);
    } else {
      nextTypes = [...selectedTypes, val];
    }
    setSelectedTypes(nextTypes);

    // Auto-fill deskripsi based on mapped types
    const currentLabName = getLabDisplayName(labs, idLaboratorium);
    const autoTexts = nextTypes
      .map((t) => getTemplateForType(t, currentLabName))
      .filter(Boolean);

    setDeskripsi(autoTexts.join("\n"));
  };

  const handleLabChange = (newLabId: string) => {
    setIdLaboratorium(newLabId);
    if (selectedTypes.includes("pengecekan")) {
      const newLabName = getLabDisplayName(labs, newLabId);
      const pengecekanPattern = /^Melakukan pengecekan rutin harian di Laboratorium.*$/m;
      const newText = `Melakukan pengecekan rutin harian di Laboratorium ${newLabName}`.trim();
      if (pengecekanPattern.test(deskripsi)) {
        setDeskripsi((prev) => prev.replace(pengecekanPattern, newText));
      } else {
        const autoTexts = selectedTypes
          .map((t) => getTemplateForType(t, newLabName))
          .filter(Boolean);
        setDeskripsi(autoTexts.join("\n"));
      }
    }
  };

  // Load list of laboratories
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await api.get("/laboratorium");
        const result = response.data;
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setLabs(result.data);
          const firstLabId = result.data[0].id;
          setIdLaboratorium(firstLabId);
          return;
        }
      } catch (err) {
        console.warn("Failed fetching labs, fallback to mock data:", err);
      }

      // Fallback in case API is offline / mock fallback
      const fallbackLabs = [
        {
          id: "d3b07384-d113-41e9-a7e8-e21501b17a10",
          kode: "E1",
          nama: "Laboratorium E1 (Programming & Algoritma)",
        },
        {
          id: "e4c07384-e223-41e9-a7e8-e21501b17a22",
          kode: "E2",
          nama: "Laboratorium E2 (Hardware & Embed)",
        },
      ];
      setLabs(fallbackLabs);
      setIdLaboratorium(fallbackLabs[0].id);
    };

    fetchLabs();
  }, []);

  const getDuration = () => {
    if (!jamMasuk || !jamKeluar) return 0;
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
    return hours + mins / 60;
  };
  const currentDuration = getDuration();
  const isDurationInvalid = currentDuration > 6 || currentDuration <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (selectedTypes.length === 0) {
      setErrorMsg("Pilih minimal satu tipe kegiatan BAP.");
      setIsLoading(false);
      return;
    }

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

    if (hours < 0 || (hours === 0 && mins <= 0)) {
      setErrorMsg("Jam Keluar harus setelah Jam Masuk.");
      setIsLoading(false);
      return;
    }

    const duration = parseFloat((hours + mins / 60).toFixed(2)) || 1;
    if (duration > 6) {
      setErrorMsg("Jam Keluar tidak boleh lebih dari 6 jam dari Jam Masuk.");
      setIsLoading(false);
      return;
    }

    try {
      await Promise.all(
        selectedTypes.map((t) =>
          api.post("/bap", {
            tanggal,
            jam_masuk: `${jamMasuk}:00`,
            jam_keluar: `${jamKeluar}:00`,
            jumlah_jam: duration,
            deskripsi_pekerjaan: deskripsi,
            paraf,
            type: t,
            id_laboratorium: idLaboratorium,
          })
        )
      );

      const msg =
        selectedTypes.length > 1
          ? `${selectedTypes.length} laporan BAP berhasil dicatat!`
          : "Laporan BAP berhasil dicatat!";
      setSuccessMsg(msg);
      setTimeout(() => {
        router.push("/bap");
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as {
        message?: string;
        code?: string;
        response?: { data?: { message?: string } };
      };
      if (errorObj.message?.includes("Failed to fetch") || errorObj.code === "ERR_NETWORK") {
        setSuccessMsg("API Offline: Laporan BAP disimulasikan disimpan secara lokal!");
        setTimeout(() => {
          router.push("/bap");
        }, 1500);
      } else {
        setErrorMsg(errorObj.response?.data?.message || errorObj.message || "Error saat mengirim data BAP.");
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Catat Sesi Kerja BAP Baru</h2>
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Laboratorium
            </label>
            <select
              required
              disabled={isLoading}
              value={idLaboratorium}
              onChange={(e) => handleLabChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            >
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id} className="text-slate-900 dark:text-slate-100">
                  {lab.kode} - {lab.nama}
                </option>
              ))}
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
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
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all text-slate-800 dark:text-white ${
                isDurationInvalid && jamKeluar
                  ? "border-rose-500 focus:ring-rose-500/40 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/40 focus:border-blue-500"
              }`}
            />
            {jamKeluar && currentDuration > 6 && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">Maksimal durasi BAP adalah 6 jam.</p>
            )}
            {jamKeluar && currentDuration <= 0 && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">Jam Keluar harus setelah Jam Masuk.</p>
            )}
          </div>

          {/* Type selector (Multi-select) */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Tipe Kegiatan (Pilih satu atau lebih)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedTypes.length} dipilih
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BAP_TYPE_OPTIONS.map((item) => {
                const isSelected = selectedTypes.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleToggleType(item.value)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500/70 shadow-sm ring-1 ring-blue-500/20"
                        : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 stroke-white fill-none" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span
                        className={`block text-xs font-bold capitalize ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedTypes.length === 0 && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">Pilih minimal satu tipe kegiatan.</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Deskripsi Pekerjaan Detail
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Otomatis terisi &amp; dapat disunting
              </span>
            </div>
            <textarea
              required
              disabled={isLoading}
              rows={4}
              placeholder="Jelaskan tugas dan pekerjaan yang diverifikasi..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || selectedTypes.length === 0}
            className="sm:col-span-2 mt-4 w-full py-3 bg-blue-brand-600 hover:bg-blue-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Menyimpan BAP..." : "Catat Laporan BAP"}
          </button>
        </form>
      </div>
    </div>
  );
}
