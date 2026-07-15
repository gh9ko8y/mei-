"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, MessageSquare } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();

  const favorites = [
    { id: 1, author: "温柔女友", content: "想你了~", time: "昨天", type: "message" },
    { id: 2, author: "小明", content: "推荐一本好书", time: "3天前", type: "post" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">我的收藏</h1>
      </div>
      <div className="p-4 space-y-3">
        {favorites.map((fav) => (
          <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                {fav.type === "message" ? "消息" : "动态"}
              </span>
              <span className="text-xs text-gray-400">{fav.author}</span>
            </div>
            <p className="text-sm mb-2">{fav.content}</p>
            <span className="text-xs text-gray-400">{fav.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
