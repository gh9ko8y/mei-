/**
 * 表情包选择器 - 聊天时选择发送的表情包
 */

"use client";

import { useState } from "react";

interface StickerCategory {
  name: string;
  emotion: string;
  desc: string;
}

const STICKER_CATEGORIES: StickerCategory[] = [
  { name: "撒花", emotion: "positive", desc: "庆祝" },
  { name: "比心", emotion: "positive", desc: "喜欢" },
  { name: "偷笑", emotion: "positive", desc: "好笑" },
  { name: "委屈", emotion: "negative", desc: "小委屈" },
  { name: "哭泣", emotion: "negative", desc: "伤心" },
  { name: "抱抱", emotion: "negative", desc: "安慰" },
  { name: "哼", emotion: "angry", desc: "不满" },
  { name: "歪头", emotion: "cute", desc: "可爱" },
  { name: "嘟嘴", emotion: "cute", desc: "撒娇" },
  { name: "蹭蹭", emotion: "cute", desc: "亲近" },
  { name: "早安", emotion: "daily", desc: "问候" },
  { name: "晚安", emotion: "daily", desc: "道别" },
  { name: "吐舌头", emotion: "playful", desc: "调皮" },
  { name: "偷看", emotion: "playful", desc: "好奇" },
];

const EMOTION_GROUPS = [
  { emotion: "positive", label: "开心", color: "bg-yellow-100 text-yellow-700" },
  { emotion: "negative", label: "难过", color: "bg-blue-100 text-blue-700" },
  { emotion: "angry", label: "生气", color: "bg-red-100 text-red-700" },
  { emotion: "cute", label: "撒娇", color: "bg-pink-100 text-pink-700" },
  { emotion: "daily", label: "日常", color: "bg-gray-100 text-gray-700" },
  { emotion: "playful", label: "调皮", color: "bg-purple-100 text-purple-700" },
];

interface StickerPickerProps {
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [activeGroup, setActiveGroup] = useState("positive");

  const filtered = STICKER_CATEGORIES.filter((s) => s.emotion === activeGroup);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm">选择表情包</span>
        <button onClick={onClose} className="text-gray-400 text-sm">关闭</button>
      </div>

      {/* 情绪分组 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {EMOTION_GROUPS.map((g) => (
          <button
            key={g.emotion}
            onClick={() => setActiveGroup(g.emotion)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              activeGroup === g.emotion
                ? "bg-purple-500 text-white"
                : g.color
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 表情包网格 */}
      <div className="grid grid-cols-4 gap-2">
        {filtered.map((sticker) => (
          <button
            key={sticker.name}
            onClick={() => {
              onSelect(sticker.name);
              onClose();
            }}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg mb-1">
              {sticker.name.charAt(0)}
            </div>
            <span className="text-[10px] text-gray-600">{sticker.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
