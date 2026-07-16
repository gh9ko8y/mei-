"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

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
  { emotion: "positive", label: "开心", color: "bg-[#FEF9E7] text-[#B8860B]" },
  { emotion: "negative", label: "难过", color: "bg-[#E8F4FD] text-[#4A90D9]" },
  { emotion: "angry", label: "生气", color: "bg-[#FDEDEC] text-[#C0392B]" },
  { emotion: "cute", label: "撒娇", color: "bg-[#FCE4EC] text-[#C44569]" },
  { emotion: "daily", label: "日常", color: "bg-[#F5F5F5] text-[#666]" },
  { emotion: "playful", label: "调皮", color: "bg-[#F3E5F5] text-[#7B1FA2]" },
];

const groupContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const groupItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

interface StickerPickerProps {
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [activeGroup, setActiveGroup] = useState("positive");

  const filtered = STICKER_CATEGORIES.filter((s) => s.emotion === activeGroup);
  const activeGroupLabel = EMOTION_GROUPS.find((g) => g.emotion === activeGroup)?.label || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.06)] p-4 shadow-[0_8px_24px_rgba(45,45,58,0.12)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#E85D75]" />
          <span className="font-semibold text-sm text-[#2D2D3A]">选择表情包</span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="text-[#A0A0B0] hover:text-[#6B6B7B] p-1"
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* 情绪分组标签 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {EMOTION_GROUPS.map((g) => (
          <motion.button
            key={g.emotion}
            onClick={() => setActiveGroup(g.emotion)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeGroup === g.emotion
                ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.25)]"
                : `${g.color}`
            }`}
          >
            {g.label}
          </motion.button>
        ))}
      </div>

      {/* 表情包网格 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-gradient-to-b from-[#E85D75] to-[#F28C8C] rounded-full" />
        <span className="text-xs text-[#A0A0B0]">{activeGroupLabel}表情</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          variants={groupContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-2"
        >
          {filtered.map((sticker) => (
            <motion.button
              key={sticker.name}
              variants={groupItemVariants}
              whileHover={{ scale: 1.08, backgroundColor: "rgba(232, 93, 117, 0.08)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onSelect(sticker.name);
                onClose();
              }}
              className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-b from-[#FCE4EC]/50 to-[#FFF0F3]/50 hover:from-[#FCE4EC] hover:to-[#FFF0F3] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E85D75]/10 to-[#F28C8C]/10 flex items-center justify-center text-lg mb-1">
                {sticker.name.charAt(0)}
              </div>
              <span className="text-[10px] text-[#6B6B7B]">{sticker.desc}</span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="text-[10px] text-[#A0A0B0] text-center mt-3">点击表情即可发送</p>
    </motion.div>
  );
}
