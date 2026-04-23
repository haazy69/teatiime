"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, User, LogOut, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

interface BottomNavProps {
  unreadCount?: number;
  className?: string;
}

export default function BottomNav({ unreadCount = 0, className = "" }: BottomNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-bone border-t border-ink/10 safe-bottom ${className}`}>
      <div className="max-w-[440px] mx-auto px-0 flex justify-around">
        <Link
          href="/home"
          className={`flex-1 py-4 flex flex-col items-center gap-2 transition-colors relative ${
            isActive("/home") ? "text-ink" : "text-ash hover:text-ink"
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-medium">Map</span>
        </Link>

        <Link
          href="/my-requests"
          className={`flex-1 py-4 flex flex-col items-center gap-2 transition-colors ${
            isActive("/my-requests") ? "text-ink" : "text-ash hover:text-ink"
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium">My Requests</span>
        </Link>

        <Link
          href="/notifications"
          className={`flex-1 py-4 flex flex-col items-center gap-2 transition-colors relative ${
            isActive("/notifications") ? "text-ink" : "text-ash hover:text-ink"
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ember text-[9px] font-bold text-cream flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>

        <Link
          href="/profile"
          className={`flex-1 py-4 flex flex-col items-center gap-2 transition-colors ${
            isActive("/profile") ? "text-ink" : "text-ash hover:text-ink"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex-1 py-4 flex flex-col items-center gap-2 transition-colors text-ash hover:text-ink"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
