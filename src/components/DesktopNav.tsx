"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, Bell, User, LogOut } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

function NavLink({ href, icon: Icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-ink text-cream"
          : "text-ink hover:bg-ink/5"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function DesktopNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", icon: Map, label: "Map" },
    { href: "/my-requests", icon: Heart, label: "My Requests" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="hidden lg:flex w-64 bg-bone border-r border-ink/10 flex-col p-6 space-y-8 fixed left-0 top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-cream text-lg">
          ☕
        </div>
        <h1 className="font-display text-lg">Teatime</h1>
      </div>

      {/* Navigation */}
      <div className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>

      {/* Logout */}
      <button className="btn-ghost w-full justify-center gap-2 flex items-center">
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </nav>
  );
}
