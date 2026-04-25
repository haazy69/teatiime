"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, ListChecks, Bell, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface BottomNavProps {
  className?: string;
  unreadCount?: number;
}

export default function BottomNav({ className = "", unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-cream border-t border-ink/10 z-40 safe-area-inset-bottom ${className}`}
    >
      <div className="max-w-[600px] mx-auto px-4">
        <div className="flex items-center justify-around">
          {/* Map */}
          <Link
            href="/home"
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              isActive("/home") ? "text-ink" : "text-ash hover:text-smoke"
            }`}
          >
            <Map className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Map</span>
          </Link>

          {/* My Requests */}
          <Link
            href="/my-requests"
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              isActive("/my-requests") ? "text-ink" : "text-ash hover:text-smoke"
            }`}
          >
            <ListChecks className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Mine</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors relative ${
              isActive("/notifications") ? "text-ink" : "text-ash hover:text-smoke"
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 mb-1" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ember text-cream text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Alerts</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              isActive("/profile") ? "text-ink" : "text-ash hover:text-smoke"
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">You</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-3 text-ash hover:text-smoke transition-colors"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}