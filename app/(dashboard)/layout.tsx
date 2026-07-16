"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    nama_lengkap: string;
    email: string;
    username: string;
    role?: {
      id: string;
      nama: string;
      name?: string;
    };
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication check and load user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user info");
      }
    } else {
      // Default fallback
      setUser({
        nama_lengkap: "Administrator",
        email: "admin@laboratory.com",
        username: "admin",
        role: {
          id: "admin-role-fallback",
          nama: "Laboran",
        },
      });
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Clear role cookie
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  // Menu lists
  const menuItems: SidebarItem[] = [
    {
      name: "Ringkasan",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
        </svg>
      ),
    },
    {
      name: "Asisten",
      href: "/asisten",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path>
        </svg>
      ),
    },
    {
      name: "BAP",
      href: "/bap",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
        </svg>
      ),
    },
    {
      name: "Barang Hilang",
      href: "/barang-hilang",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"></path>
        </svg>
      ),
    },
    {
      name: "Inventaris",
      href: "/inventaris",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path>
        </svg>
      ),
    },
    {
      name: "Kategori",
      href: "/kategori",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591L9.581 3.659a2.25 2.25 0 00-1.591-.659zm-1.818 5.682a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z"></path>
        </svg>
      ),
    },
    {
      name: "Laboratorium",
      href: "/laboratorium",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .59-.523 1.055-1.111 1.01a5.003 5.003 0 00-4.52 4.52c-.045.588.42 1.11 1.01 1.11h1.244m12.378-7.884v1.244c0 .59-.522 1.055-1.11 1.01a5.003 5.003 0 00-4.521 4.52c-.045.588.42 1.11 1.01 1.11h1.244M3.75 20.25h16.5M12 6.75a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
    },
    {
      name: "Lokasi Penyimpanan",
      href: "/lokasi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
        </svg>
      ),
    },
  ];

  // Helper to determine page title
  const getPageTitle = () => {
    const matched = menuItems.find((item) => {
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
    return matched ? matched.name : "Ruang Kerja";
  };

  const roleName = user?.role?.nama || user?.role?.name || "";

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.name === "Asisten") {
      return roleName === "Laboran";
    }
    if (item.name === "BAP") {
      return roleName !== "Laboran";
    }
    return true;
  });

  // Hide component rendering while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-blue-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Admin Lab
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                    ? "bg-blue-brand-50/80 text-blue-brand-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile and Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-blue-brand-500 flex items-center justify-center text-white font-bold text-xs">
                {user.nama_lengkap.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{user.nama_lengkap}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"></path>
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col h-full">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold text-base text-slate-800 dark:text-slate-200">Admin Lab</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
              {visibleMenuItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                        ? "bg-blue-brand-50/80 text-blue-brand-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Profile and Logout */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/50">
              {user && (
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-blue-brand-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.nama_lengkap.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{user.nama_lengkap}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"></path>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
              </svg>
            </button>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              API Aktif: {process.env.API_URL || "http://192.168.18.10:8003/api"}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>

    </div>
  );
}
