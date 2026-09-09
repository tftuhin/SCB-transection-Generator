"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSpreadsheet, Users, Menu, X, LogOut } from "lucide-react";

const navItems = [
  {
    name: "Generator",
    href: "/",
    icon: FileSpreadsheet,
  },
  {
    name: "Vendor Pool",
    href: "/vendors",
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="md:hidden bg-white border-b h-16 px-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            SCB
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">SCB Transection</h1>
            <p className="text-[10px] text-gray-500 font-medium">Generator</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Slide-Over Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
          onClick={closeMobile}
        >
          {/* Drawer Content */}
          <aside
            className="w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                  SCB
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight">SCB Transection</h2>
                  <p className="text-[10px] text-gray-500 font-medium">Generator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1.5 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`group flex items-center px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500/15"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 transition-colors ${
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t flex items-center justify-between text-xs text-gray-400">
              <span>SCB Banking Tool</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                title="Lock Workspace"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r flex-shrink-0 flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              SCB
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">SCB Transection</h1>
              <p className="text-[11px] text-gray-500 font-medium">Generator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs ring-1 ring-blue-500/15"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t flex items-center justify-between text-xs text-gray-400">
          <span>SCB Banking Tool</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            title="Lock Workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </aside>
    </>
  );
}
