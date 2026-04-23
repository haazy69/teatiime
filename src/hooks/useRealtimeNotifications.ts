"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { AppNotification } from "@/types";

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [latest, setLatest] = useState<AppNotification | null>(null);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    // initial fetch
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setNotifications(data as AppNotification[]);
      });

    // realtime subscribe
    const channel = supabase
      .channel("notif:" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setNotifications((prev) => [n, ...prev]);
          setLatest(n);
          // browser notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(n.title, { body: n.body ?? "", icon: "/icon.png" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismissLatest = () => setLatest(null);

  return { notifications, latest, markRead, dismissLatest };
}
