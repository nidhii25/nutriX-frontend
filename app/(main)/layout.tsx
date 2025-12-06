"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  User,
  Leaf,
  LogOut
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("nutrix_user");
    localStorage.removeItem("nutrix_profile");
    router.push("/");
  };

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Plan", icon: UtensilsCrossed, href: "/dashboard/plan" },
    { label: "Profile", icon: User, href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-nutrix-gray-light/30 flex flex-col md:flex-row">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-nutrix-gray-light flex-col fixed h-screen left-0 top-0 z-20">
        <div className="p-6 flex items-center gap-2 text-nutrix-green-deep border-b border-nutrix-gray-light/50">
          <div className="bg-nutrix-green p-1.5 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">NutriX</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all border-l-2
                ${
                  isActive
                    ? "bg-nutrix-green/5 text-nutrix-green-deep border-nutrix-green"
                    : "text-nutrix-gray-dark border-transparent hover:bg-nutrix-gray-light/60 hover:text-nutrix-green-deep"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    isActive ? "text-nutrix-green" : "text-nutrix-gray-medium"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-nutrix-gray-light/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-semibold text-nutrix-red hover:bg-nutrix-red/5"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-nutrix-gray-light flex justify-around p-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full ${
                isActive ? "text-nutrix-green-deep" : "text-nutrix-gray-medium"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
