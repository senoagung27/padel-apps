"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LayoutDashboard, CalendarDays, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/operator/dashboard", icon: LayoutDashboard },
  { label: "Booking", href: "/operator/bookings", icon: CalendarDays },
];

export function DashboardSidebar({ role = "operator" }: { role?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = role === "superadmin"
    ? [
        { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
        { label: "Venues", href: "/superadmin/venues", icon: () => <span className="text-lg">🏟️</span> },
        { label: "Operator", href: "/superadmin/operators", icon: () => <span className="text-lg">👤</span> },
        { label: "Booking", href: "/superadmin/bookings", icon: CalendarDays },
        { label: "Settings", href: "/superadmin/settings", icon: () => <span className="text-lg">⚙️</span> },
      ]
    : navItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {!collapsed && <span className="text-lg font-bold text-white">PadelBook</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-500/20 text-brand-400"
                  : "text-navy-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => { signOut(); window.location.href = "/login"; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-navy-900 text-white shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-navy-950 animate-slide-in-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-navy-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-navy-950 border-r border-white/5 h-screen sticky top-0 transition-all ${collapsed ? "w-16" : "w-64"}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
