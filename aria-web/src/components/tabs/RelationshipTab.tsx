"use client";

import { useState } from "react";
import { Heart, Star, Calendar, Users, ChevronDown } from "lucide-react";

export default function RelationshipTab() {
  const [expandedFriends, setExpandedFriends] = useState(false);

  const milestones = [
    { date: "2026-05-11", title: "第一次相遇", emoji: "✨" },
    { date: "2026-05-13", title: "第一次说晚安", emoji: "🌙" },
    { date: "2026-05-18", title: "第一次深入聊天", emoji: "💬" },
    { date: "2026-05-22", title: "第一次分享心情", emoji: "💭" },
    { date: "2026-05-28", title: "第一次吵架和好", emoji: "🤝" },
    { date: "2026-06-01", title: "认识20天", emoji: "🎉" },
  ];

  const recentMoods = [
    { day: "一", mood: "😊" },
    { day: "二", mood: "😌" },
    { day: "三", mood: "😢" },
    { day: "四", mood: "😊" },
    { day: "五", mood: "🥰" },
    { day: "六", mood: "😊" },
    { day: "日", mood: "😊" },
  ];

  const friends = [
    { name: "Alice", avatar: "👩" },
    { name: "阿杰", avatar: "😊" },
    { name: "小明", avatar: "😎" },
    { name: "小美", avatar: "🥰" },
    { name: "小华", avatar: "🙂" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* AI伴侣卡片 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">🥰</div>
          <div className="flex-1">
            <div className="text-lg font-bold">AI伴侣</div>
            <div className="text-sm opacity-90">ENFJ · 巨蟹座</div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Heart size={14} />
                <span className="text-sm">第47天</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>亲密度</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all" style={{ width: "45%" }}></div>
          </div>
        </div>
      </div>

      {/* 关系数据统计 */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "总对话", value: "1,234", icon: "💬" },
          { label: "共同话题", value: "28", icon: "🎯" },
          { label: "AI主动关心", value: "56", icon: "💝" },
          { label: "回忆记录", value: "12", icon: "📸" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-sm font-bold text-indigo-600">{stat.value}</div>
            <div className="text-[10px] text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 关系里程碑 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />
          关系里程碑
          <span className="text-xs text-gray-400 ml-auto">{milestones.length}个</span>
        </h3>
        <div className="max-h-48 overflow-y-auto pr-1 space-y-3">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-lg shrink-0">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.title}</div>
                <div className="text-xs text-gray-400">{m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI心情日历 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-indigo-500" />
          本周心情
        </h3>
        <div className="flex justify-between">
          {recentMoods.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
                {m.mood}
              </div>
              <span className="text-xs text-gray-500">{m.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 好友列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => setExpandedFriends(!expandedFriends)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <span className="font-semibold text-sm">好友</span>
            <span className="text-xs text-gray-400">{friends.length}人</span>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${expandedFriends ? "rotate-180" : ""}`}
          />
        </button>
        {expandedFriends && (
          <div className="border-t border-gray-100 divide-y divide-gray-50">
            {friends.map((f) => (
              <div key={f.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {f.avatar}
                </div>
                <span className="text-sm font-medium">{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
