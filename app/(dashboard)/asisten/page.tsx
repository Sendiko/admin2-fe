"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Assistant {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  profileUrl: string;
  nomor_telepon: string;
  id_laboratorium?: string;
  laboratorium?: {
    id: string;
    kode: string;
    nama: string;
  };
}

const mockAssistants: Assistant[] = [
  {
    id: "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
    username: "asisten_tono",
    email: "tono@admin.com",
    nama_lengkap: "Tono Wijaya M.T.",
    profileUrl: "https://example.com/profiles/tono.jpg",
    nomor_telepon: "089876543210",
    id_laboratorium: "d3b07384-d113-41e9-a7e8-e21501b17a10",
    laboratorium: {
      id: "d3b07384-d113-41e9-a7e8-e21501b17a10",
      kode: "E1",
      nama: "Laboratorium E1"
    }
  },
  {
    id: "3c9a7c6f-b9de-4b13-ba14-5d51381dead1",
    username: "asisten_riri",
    email: "riri.s@admin.com",
    nama_lengkap: "Riri Safitri",
    profileUrl: "",
    nomor_telepon: "081298765432",
    id_laboratorium: "e4c07384-e223-41e9-a7e8-e21501b17a22",
    laboratorium: {
      id: "e4c07384-e223-41e9-a7e8-e21501b17a22",
      kode: "E2",
      nama: "Laboratorium E2"
    }
  },
  {
    id: "4d9a7c6f-c9de-4b13-ba14-5d51381deae2",
    username: "asisten_fandi",
    email: "fandi.a@admin.com",
    nama_lengkap: "Fandi Ahmad",
    profileUrl: "",
    nomor_telepon: "082345678901",
    id_laboratorium: "d3b07384-d113-41e9-a7e8-e21501b17a10",
    laboratorium: {
      id: "d3b07384-d113-41e9-a7e8-e21501b17a10",
      kode: "E1",
      nama: "Laboratorium E1"
    }
  },
];

export default function AssistantPage() {
  const [assistants, setAssistants] = useState<Assistant[]>(mockAssistants);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [labs, setLabs] = useState<{ id: string; kode: string; nama: string }[]>([]);

  // Load list from backend if online
  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await api.get("/laboran/asisten");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setAssistants(result.data);
        }
      } catch (err) {
        console.warn("Failed fetching from server, falling back to mock data:", err);
      }
    };
    fetchAssistants();
  }, []);

  // Load list of laboratories
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await api.get("/laboratorium");
        const result = response.data;
        if (result.success && Array.isArray(result.data)) {
          setLabs(result.data);
          return;
        }
      } catch (err) {
        console.warn("Failed fetching labs, falling back to mock data:", err);
      }

      // Fallback
      setLabs([
        {
          id: "d3b07384-d113-41e9-a7e8-e21501b17a10",
          kode: "E1",
          nama: "Laboratorium E1",
        },
        {
          id: "e4c07384-e223-41e9-a7e8-e21501b17a22",
          kode: "E2",
          nama: "Laboratorium E2",
        },
      ]);
    };
    fetchLabs();
  }, []);

  // Handle laboratory assignment change
  const handleLabChange = async (assistantId: string, labId: string | null) => {
    // Optimistically update local state
    setAssistants((prev) =>
      prev.map((a) => {
        if (a.id === assistantId) {
          const matchingLab = labs.find((l) => l.id === labId);
          return {
            ...a,
            id_laboratorium: labId || undefined,
            laboratorium: matchingLab
              ? { id: matchingLab.id, kode: matchingLab.kode, nama: matchingLab.nama }
              : undefined,
          };
        }
        return a;
      })
    );

    try {
      const response = await api.put(`/laboran/asisten/${assistantId}/laboratorium`, {
        id_laboratorium: labId,
      });

      const result = response.data;
      if (result.success) {
        setSuccessMsg("Laboratorium asisten berhasil diperbarui.");
      } else {
        throw new Error(result.message || "Failed to update laboratory on server");
      }
    } catch (err: any) {
      console.warn("Failed to update laboratory on server, fell back to local change:", err);
      setSuccessMsg("Laboratorium asisten diperbarui secara lokal (API offline/error).");
    }
  };

  const filteredAssistants = useMemo(() => {
    return assistants.filter((asisten) => {
      const term = searchQuery.toLowerCase();
      return (
        asisten.nama_lengkap.toLowerCase().includes(term) ||
        asisten.username.toLowerCase().includes(term) ||
        asisten.email.toLowerCase().includes(term) ||
        asisten.nomor_telepon.includes(term)
      );
    });
  }, [assistants, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/laboran/asisten/${id}`);
      setAssistants(assistants.filter((a) => a.id !== id));
      setSuccessMsg("Asisten berhasil dihapus.");
    } catch (err) {
      setAssistants(assistants.filter((a) => a.id !== id));
      setSuccessMsg("Asisten dihapus secara lokal (API offline).");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Title / Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Portal Laboran</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Registrasi Asisten</h2>
        </div>

        <Link
          href="/asisten/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-brand-600 hover:bg-blue-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all self-start active:scale-95 animate-pulse-subtle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          Tambah Asisten
        </Link>
      </div>

      {/* Success alert */}
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
          placeholder="Cari asisten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-slate-400"
        />
      </div>

      {/* List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">Profil Asisten</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Telepon Kontak</th>
                <th className="py-3 px-4">Lab Ditugaskan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredAssistants.length > 0 ? (
                filteredAssistants.map((asisten) => (
                  <tr key={asisten.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-brand-500 text-white flex items-center justify-center font-bold text-xs">
                        {asisten.nama_lengkap.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AS"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{asisten.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-400">{asisten.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      @{asisten.username}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {asisten.nomor_telepon}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={asisten.id_laboratorium || asisten.laboratorium?.id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleLabChange(asisten.id, val === "" ? null : val);
                        }}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer max-w-[200px]"
                      >
                        <option value="" className="text-slate-500 dark:text-slate-400">
                          -- Belum Ditugaskan --
                        </option>
                        {labs.map((lab) => (
                          <option key={lab.id} value={lab.id} className="text-slate-900 dark:text-slate-100">
                            {lab.kode} - {lab.nama}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/asisten/update/${asisten.id}`}
                          className="text-xs text-blue-brand-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => handleDelete(asisten.id)}
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
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada asisten ditemukan dalam log pencarian.
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
