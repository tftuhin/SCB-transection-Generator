"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSpreadsheet, Users } from "lucide-react";

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

  return (
    <aside className="w-64 bg-white border-r flex-shrink-0 flex flex-col">
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

      {/* Footer info */}
      <div className="p-4 border-t text-xs text-gray-400">
        <p>SCB Excel Generator</p>
      </div>
    </aside>
  );
}
