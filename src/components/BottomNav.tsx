"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Plus,
  MessageCircle,
  User,
  Home,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-smoke/10 z-40 safe-area-inset-bottom">
      <div className="max-w-[600px] mx-auto px-4">
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/")
                ? "text-ink"
                : "text-ash hover:text-smoke"
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Map */}
          <Link
            href="/map"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/map")
                ? "text-ink"
                : "text-ash hover:text-smoke"
            }`}
          >
            <MapPin className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Map</span>
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/messages")
                ? "text-ink"
                : "text-ash hover:text-smoke"
            }`}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/profile")
                ? "text-ink"
                : "text-ash hover:text-smoke"
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">You</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}