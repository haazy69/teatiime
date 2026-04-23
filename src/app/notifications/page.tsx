"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import BottomNav from "@/components/BottomNav";
import { Loader, Trash2 } from "lucide-react";
import type { AppNotification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const notificationEmojis: Record<string, string> = {
    new_request: "🔔",
    accepted: "✅",
    cancelled: "❌",
    reminder: "⏰",
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-6 safe-top">
      <div className="max-w-[440px] mx-auto">
        <h1 className="text-3xl font-display tracking-tight text-ink mb-2">Notifications</h1>
        <p className="text-smoke text-sm mb-6">When someone accepts or replies to your requests.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-ink" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-smoke text-sm mb-3">No notifications yet.</p>
            <p className="text-xs text-ash">When people respond to your posts, you'll see them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                className={`card p-4 cursor-pointer transition-colors ${
                  notif.read ? "opacity-60" : "bg-smoke/5 border-smoke/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl flex-shrink-0">
                      {notificationEmojis[notif.kind] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${notif.read ? "text-smoke" : "text-ink"}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-ash mt-1 line-clamp-2">{notif.body}</p>
                      )}
                      <p className="text-[11px] text-ash mt-2">
                        {new Date(notif.created_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="p-2 hover:bg-smoke/20 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-smoke" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
