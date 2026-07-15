"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, Lock } from "lucide-react";

export default function AchievementsPage() {
  const router = useRouter();

  const achievements = [
    { id: 1, name: "初次相遇", desc: "第一次与AI伴侣对话", icon: "🤝", unlocked: true },
    { id: 2, name: "话匣子", desc: "累计对话100条", icon: "💬", unlocked: true },
    { id: 3, name: "记忆大师", desc: "AI记住你10件事", icon: "🧠", unlocked: true },
    { id: 4, name: "朋友圈达人", desc: "发布10条动态", icon: "📱", unlocked: false },
    { id: 5, name: "社交蝴蝶", desc: "添加10位好友", icon: "🦋", unlocked: false },
    { id: 6, name: "连续签到", desc: "连续签到7天", icon: "🔥", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">成就系统</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-4 text-white text-center">
          <Trophy size={32} className="mx-auto mb-2" />
          <div className="text-2xl font-bold">3 / 6</div>
          <div className="text-sm opacity-80">已解锁成就</div>
        </div>
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${a.unlocked ? "border-yellow-200" : "border-gray-100 opacity-60"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${a.unlocked ? "bg-yellow-100" : "bg-gray-100"}`}>
                {a.unlocked ? a.icon : <Lock size={20} className="text-gray-400" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{a.name}</div>
                <div className="text-xs text-gray-400">{a.desc}</div>
              </div>
              {a.unlocked && <span className="text-xs text-yellow-500">已获得</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
