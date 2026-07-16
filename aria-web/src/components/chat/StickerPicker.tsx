/**
 * 表情选择器 - 聊天时选择发送的表情
 * 深色玻璃拟态风格，使用 Lucide 图标代替 emoji
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smile,
  Heart,
  Frown,
  Zap,
  Sun,
  Moon,
  Star,
  Flame,
  Ghost,
  Coffee,
  Music,
  ThumbsUp,
  Droplets,
} from "lucide-react";

// 表情项接口
interface StickerItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// 表情分组接口
interface StickerGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: StickerItem[];
}

// 表情分组数据 — 全部使用 Lucide 图标
const STICKER_GROUPS: StickerGroup[] = [
  {
    id: "happy",
    label: "开心",
    icon: Smile,
    items: [
      { id: "smile", label: "微笑", icon: Smile },
      { id: "heart", label: "喜欢", icon: Heart },
      { id: "star", label: "星星", icon: Star },
      { id: "thumbs", label: "点赞", icon: ThumbsUp },
      { id: "sun", label: "阳光", icon: Sun },
      { id: "music", label: "音乐", icon: Music },
    ],
  },
  {
    id: "sad",
    label: "难过",
    icon: Frown,
    items: [
      { id: "frown", label: "难过", icon: Frown },
      { id: "rain", label: "下雨", icon: Droplets },
      { id: "moon", label: "月夜", icon: Moon },
      { id: "coffee", label: "咖啡", icon: Coffee },
    ],
  },
  {
    id: "energy",
    label: "活力",
    icon: Zap,
    items: [
      { id: "zap", label: "闪电", icon: Zap },
      { id: "flame", label: "火焰", icon: Flame },
      { id: "ghost", label: "调皮", icon: Ghost },
    ],
  },
];

interface StickerPickerProps {
  onSelect: (stickerId: string) => void;
  onClose: () => void;
}

// 动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

const stickerItemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const groupTransitionVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

export default function StickerPicker({
  onSelect,
  onClose,
}: StickerPickerProps) {
  const [activeGroup, setActiveGroup] = useState("happy");

  const currentGroup = STICKER_GROUPS.find((g) => g.id === activeGroup);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-[#14141E] rounded-[20px] border border-[rgba(255,255,255,0.08)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm text-[#E8E6E3]">
          选择表情
        </span>
        <motion.button
          onClick={onClose}
          className="text-[#5A5854] hover:text-[#8A8880] transition-colors p-1 rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
          whileTap={{ scale: 0.95 }}
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* 分组标签 — pill 形状 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {STICKER_GROUPS.map((g) => {
          const GroupIcon = g.icon;
          const isActive = activeGroup === g.id;
          return (
            <motion.button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#D4A574] to-[#C9956A] text-[#0C0C14] shadow-[0_2px_8px_rgba(212,165,116,0.25)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#8A8880] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#E8E6E3]"
              }`}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <GroupIcon size={12} />
              {g.label}
            </motion.button>
          );
        })}
      </div>

      {/* 表情网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          className="grid grid-cols-4 gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {currentGroup?.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className="flex flex-col items-center p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150 border border-transparent hover:border-[rgba(255,255,255,0.08)]"
                variants={stickerItemVariants}
                whileTap={{ scale: 0.92 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgba(212,165,116,0.15)] to-[rgba(201,149,106,0.08)] flex items-center justify-center mb-1 shadow-[0_1px_3px_rgba(212,165,116,0.1)]">
                  <ItemIcon size={18} className="text-[#D4A574]" />
                </div>
                <span className="text-[10px] text-[#8A8880] font-medium">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
