"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, MessageSquare } from "lucide-react";

export default function MyPostsPage() {
  const router = useRouter();

  const posts = [
    { id: 1, content: "今天天气真好，出去走了走~", time: "2小时前", likes: 12, comments: 3 },
    { id: 2, content: "刚看完一部电影，推荐给大家！", time: "昨天", likes: 8, comments: 5 },
    { id: 3, content: "周末快乐！", time: "3天前", likes: 15, comments: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">我的发布</h1>
      </div>
      <div className="p-4 space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm mb-3">{post.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{post.time}</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
