"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, Menu, X, Landmark } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "لوحة التحكم",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "المشاريع",
      href: "/projects",
      icon: FolderKanban,
    },
    {
      name: "أعضاء الفريق",
      href: "/team",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative top-0 right-0 h-screen w-64 bg-white border-l border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Landmark size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-800 tracking-wide leading-none">ProjectFlow</h1>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">إدارة المشاريع الذكية</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold text-center">ProjectFlow Manager v1.0</p>
            <p className="text-[10px] text-slate-400 text-center mt-0.5">يعمل محلياً بالكامل</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
}
