"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex items-center justify-between mb-10 bg-white/5 border border-white/10 rounded-3xl px-6 py-4">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
        <p className="text-gray-400">Track goals and employee performance.</p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          placeholder="Search..."
          className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
        />

        <button
          onClick={() => router.push("/notifications")}
          aria-label="Notifications"
          className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl"
        >
          🔔
        </button>

        <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">A</div>
      </div>
    </div>
  );
}