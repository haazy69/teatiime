export type Activity = "tea" | "coffee" | "smoke" | "lunch" | "snacks" | "walk";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_emoji: string | null;
  bio: string | null;
  office_id: string | null;
  role: "corporate" | "student" | "other";
  interests: string[];
  is_available: boolean;
}

export interface Office {
  id: string;
  name: string;
  address: string | null;
  kind: "office" | "college" | "coworking" | "other";
  distance_m?: number;
}

export interface NearbyPerson {
  id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  role: string;
  office_name: string | null;
  interests: string[];
  distance_m: number;
  last_seen_at: string;
}

export interface NearbyRequest {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  activity: Activity;
  note: string | null;
  location_label: string | null;
  lat: number;
  lng: number;
  distance_m: number;
  expires_at: string;
  participant_count: number;
}

export interface AppNotification {
  id: string;
  user_id: string;
  request_id: string | null;
  kind: "new_request" | "accepted" | "cancelled" | "reminder";
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

export const ACTIVITIES: { key: Activity; label: string; emoji: string; color: string }[] = [
  { key: "tea", label: "Tea", emoji: "🍵", color: "#8db580" },
  { key: "coffee", label: "Coffee", emoji: "☕", color: "#6f4e37" },
  { key: "smoke", label: "Smoke", emoji: "🚬", color: "#6b6b6b" },
  { key: "lunch", label: "Lunch", emoji: "🍱", color: "#ff5722" },
  { key: "snacks", label: "Snacks", emoji: "🥟", color: "#c1440e" },
  { key: "walk", label: "Walk", emoji: "🚶", color: "#4a7c59" },
];
