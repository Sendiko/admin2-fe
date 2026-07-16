"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Request feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Submit handler targeting local api or running in mock mode
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.post("/auth/login", {
        login: loginIdentifier,
        password: password,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal melakukan autentikasi.");
      }

      // Save user & tokens to localStorage
      if (result.data) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        if (result.data.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
          // Save role name into cookies
          const roleName = result.data.user.role?.nama || result.data.user.role?.name || "";
          if (roleName) {
            document.cookie = `role=${encodeURIComponent(roleName)}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
      }

      setSuccessMsg("Berhasil masuk! Mengalihkan...");

      // Navigate to dashboard home page
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      console.error("Login request error:", err);
      if (err.message.includes("Failed to fetch")) {
        setErrorMsg("Koneksi gagal: Server API sedang offline. Gunakan 'Bypass Masuk' untuk menguji antarmuka.");
      } else {
        setErrorMsg(err.message || "Kredensial tidak valid. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill fields with demo account credentials from documentation
  const handleUseDemo = () => {
    setLoginIdentifier("lab_manager");
    setPassword("securePassword123");
    setErrorMsg(null);
  };

  // Pre-populate dummy tokens in localStorage and bypass API for quick developer testing
  const handleBypassDemoLogin = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    setTimeout(() => {
      // Set mock token details
      localStorage.setItem("token", "mock_jwt_access_token_blue_theme");
      localStorage.setItem("refreshToken", "mock_jwt_refresh_token_blue_theme");
      const mockUser = {
        id: "7ac67c7e-b6e9-4e78-831e-15104d4f8fb2",
        username: "lab_manager",
        email: "manager@admin.com",
        nama_lengkap: "Budi Santoso (Demo User)",
        profileUrl: "https://example.com/profiles/budi.jpg",
        nomor_telepon: "081234567890",
        createdAt: "2026-07-14T07:10:00.000Z",
        updatedAt: "2026-07-14T07:10:00.000Z",
        role: {
          id: "mock-role-id",
          nama: "Laboran",
        },
      };
      localStorage.setItem("user", JSON.stringify(mockUser));
      document.cookie = `role=${encodeURIComponent("Laboran")}; path=/; max-age=86400; SameSite=Lax`;

      setSuccessMsg("Masuk Demo berhasil! Mengalihkan ke ruang kerja...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden font-sans px-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col gap-6 animate-fade-in-up">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-brand-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-extrabold text-2xl mb-2">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Laboratorium
          </h1>
          <p className="text-slate-400 text-xs max-w-xs">
            Autentikasi untuk mengelola BAP, barang hilang, dan pendaftaran asisten.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-200 px-4 py-3 rounded-2xl text-xs flex gap-2.5 items-start">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 px-4 py-3 rounded-2xl text-xs flex gap-2.5 items-start">
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-400 font-medium text-xs mb-1.5 uppercase tracking-wider">
              Username atau Email
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Contoh: lab_manager"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-slate-400 font-medium text-xs uppercase tracking-wider">
                Kata Sandi
              </label>
            </div>
            <input
              type="password"
              required
              disabled={isLoading}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-blue-brand-600 hover:bg-blue-brand-700 disabled:bg-blue-800 disabled:opacity-60 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Demo Account Helpers */}
        <div className="border-t border-slate-800/80 pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Butuh validasi pengembang segera?</span>
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Isi Kredensial Demo
            </button>
          </div>
          <button
            type="button"
            onClick={handleBypassDemoLogin}
            disabled={isLoading}
            className="w-full py-2 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 font-semibold text-xs rounded-2xl active:scale-[0.98] transition-all"
          >
            Bypass ke Dashboard Admin (Mode Mock Offline)
          </button>
        </div>

      </div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-slate-600 text-xs relative z-10">
        <p>© 2026 Admin Laboratorium. Antarmuka Web Sapphire.</p>
      </footer>
    </div>
  );
}
