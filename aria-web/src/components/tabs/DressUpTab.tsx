"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shirt,
  Palette,
  Sparkles,
  Crown,
  User,
  Check,
  RotateCcw,
  Save,
  Lock,
  Smile,
  Scissors,
  Flower2,
  Glasses,
  Image,
  Wand2,
  type LucideIcon,
} from "lucide-react";

// Types
interface DressUpItem {
  id: string;
  name: string;
  icon: LucideIcon;
  unlocked: boolean;
}

interface DressUpCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: DressUpItem[];
}

interface AvatarConfig {
  face: string;
  hair: string;
  outfit: string;
  accessory: string;
  background: string;
  color: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const optionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Color options - dark glassmorphism theme
const colorOptions = [
  { id: "amber", value: "#D4A574", label: "琥珀" },
  { id: "coral", value: "#C9956A", label: "珊瑚" },
  { id: "rose", value: "#C44569", label: "玫瑰" },
  { id: "lavender", value: "#B8A9C9", label: "薰衣草" },
  { id: "sky", value: "#7EC8E3", label: "天空" },
  { id: "mint", value: "#6B9B7A", label: "薄荷" },
  { id: "slate", value: "#8A8880", label: "岩灰" },
  { id: "gold", value: "#D4A574", label: "金黄" },
];

// Dark theme bg gradients
const bgGradients: Record<string, string> = {
  amber: "radial-gradient(circle at center, rgba(212,165,116,0.08) 0%, transparent 70%)",
  coral: "radial-gradient(circle at center, rgba(201,149,106,0.08) 0%, transparent 70%)",
  rose: "radial-gradient(circle at center, rgba(196,69,105,0.08) 0%, transparent 70%)",
  lavender: "radial-gradient(circle at center, rgba(184,169,201,0.06) 0%, transparent 70%)",
  sky: "radial-gradient(circle at center, rgba(126,200,227,0.06) 0%, transparent 70%)",
  mint: "radial-gradient(circle at center, rgba(107,155,122,0.06) 0%, transparent 70%)",
  slate: "radial-gradient(circle at center, rgba(138,136,128,0.06) 0%, transparent 70%)",
  gold: "radial-gradient(circle at center, rgba(212,165,116,0.08) 0%, transparent 70%)",
};

// Mock categories data - Lucide icons instead of emoji
const defaultCategories: DressUpCategory[] = [
  {
    id: "face",
    label: "面容",
    icon: User,
    items: [
      { id: "face1", name: "标准脸", icon: Smile, unlocked: true },
      { id: "face2", name: "圆脸", icon: User, unlocked: true },
      { id: "face3", name: "瓜子脸", icon: Sparkles, unlocked: true },
      { id: "face4", name: "酷酷脸", icon: Crown, unlocked: false },
      { id: "face5", name: "萌萌脸", icon: Smile, unlocked: true },
    ],
  },
  {
    id: "hair",
    label: "发型",
    icon: Sparkles,
    items: [
      { id: "hair1", name: "短发", icon: Scissors, unlocked: true },
      { id: "hair2", name: "长发", icon: Sparkles, unlocked: true },
      { id: "hair3", name: "双马尾", icon: Flower2, unlocked: true },
      { id: "hair4", name: "丸子头", icon: Crown, unlocked: false },
      { id: "hair5", name: "波浪卷", icon: Sparkles, unlocked: true },
      { id: "hair6", name: "公主切", icon: Crown, unlocked: false },
    ],
  },
  {
    id: "outfit",
    label: "服装",
    icon: Shirt,
    items: [
      { id: "outfit1", name: "连衣裙", icon: Shirt, unlocked: true },
      { id: "outfit2", name: "校服", icon: Shirt, unlocked: true },
      { id: "outfit3", name: "和服", icon: Sparkles, unlocked: false },
      { id: "outfit4", name: "休闲装", icon: Shirt, unlocked: true },
      { id: "outfit5", name: "礼服", icon: Crown, unlocked: false },
    ],
  },
  {
    id: "accessory",
    label: "配饰",
    icon: Crown,
    items: [
      { id: "acc1", name: "眼镜", icon: Glasses, unlocked: true },
      { id: "acc2", name: "蝴蝶结", icon: Flower2, unlocked: true },
      { id: "acc3", name: "项链", icon: Sparkles, unlocked: true },
      { id: "acc4", name: "皇冠", icon: Crown, unlocked: false },
      { id: "acc5", name: "耳机", icon: Sparkles, unlocked: true },
    ],
  },
  {
    id: "background",
    label: "背景",
    icon: Palette,
    items: [
      { id: "bg1", name: "樱花", icon: Flower2, unlocked: true },
      { id: "bg2", name: "星空", icon: Sparkles, unlocked: true },
      { id: "bg3", name: "海洋", icon: Image, unlocked: true },
      { id: "bg4", name: "森林", icon: Flower2, unlocked: false },
      { id: "bg5", name: "城市", icon: Image, unlocked: true },
    ],
  },
];

export default function DressUpTab() {
  const [categories, setCategories] = useState<DressUpCategory[]>(defaultCategories);
  const [activeCategory, setActiveCategory] = useState("face");
  const [config, setConfig] = useState<AvatarConfig>({
    face: "face1",
    hair: "hair1",
    outfit: "outfit1",
    accessory: "acc1",
    background: "bg1",
    color: "amber",
  });
  const [originalConfig, setOriginalConfig] = useState<AvatarConfig>(config);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem("aria_avatar_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
        setOriginalConfig((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("解析装扮配置失败:", e);
      }
    }

    // Fetch from API if logged in
    const token = localStorage.getItem("aria_token");
    if (token) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/avatar/config`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("获取失败");
        })
        .then((data) => {
          if (data) {
            setConfig((prev) => ({ ...prev, ...data }));
            setOriginalConfig((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(console.error);
    }
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(
      JSON.stringify(config) !== JSON.stringify(originalConfig)
    );
  }, [config, originalConfig]);

  const handleSelect = (categoryId: string, itemId: string) => {
    setConfig((prev) => ({ ...prev, [categoryId]: itemId }));
  };

  const handleColorChange = (colorId: string) => {
    setConfig((prev) => ({ ...prev, color: colorId }));
  };

  const handleReset = () => {
    setConfig(originalConfig);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("aria_avatar_config", JSON.stringify(config));

      const token = localStorage.getItem("aria_token");
      if (token) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/avatar/config`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(config),
          }
        );
      }

      setOriginalConfig(config);
      setHasChanges(false);
    } catch (e) {
      console.error("保存失败:", e);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedItem = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return null;
    return cat.items.find((i) => i.id === (config as any)[categoryId]);
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);
  const activeColor = colorOptions.find((c) => c.id === config.color);

  return (
    <motion.div
      className="min-h-[calc(100vh-60px)] bg-[#0C0C14] pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Preview Area */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div
          className="relative overflow-hidden rounded-[20px] p-6 flex flex-col items-center border border-[rgba(255,255,255,0.06)]"
          style={{
            background: "#0C0C14",
            backgroundImage:
              bgGradients[config.color] || bgGradients.amber,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          {/* Decorative elements */}
          <div
            className="absolute top-3 left-3 w-8 h-8 rounded-full"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
          <div
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full"
            style={{ background: "rgba(255,255,255,0.02)" }}
          />
          <div
            className="absolute top-8 right-6 w-4 h-4 rounded-full"
            style={{ background: "rgba(212,165,116,0.06)" }}
          />

          {/* Avatar Preview */}
          <motion.div
            className="relative z-10"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${
                  activeColor?.value || "#D4A574"
                } 0%, transparent 70%)`,
                transform: "scale(1.3)",
              }}
            />
            <div
              className="relative w-[144px] h-[144px] rounded-full flex items-center justify-center border-2 shadow-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                borderColor: "rgba(212,165,116,0.2)",
              }}
            >
              <Sparkles
                size={56}
                className="text-[#D4A574]"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(212,165,116,0.3))",
                }}
              />
            </div>
            {/* Status indicator */}
            <div
              className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 shadow-md"
              style={{
                background: "#6B9B7A",
                borderColor: "#0C0C14",
              }}
            />
          </motion.div>

          {/* Avatar name */}
          <div className="relative z-10 mt-4 text-center">
            <h3 className="text-[16px] font-bold text-[#E8E6E3]">
              我的AI伴侣
            </h3>
            <p className="text-[12px] text-[#8A8880] mt-0.5">
              {getSelectedItem("face")?.name} ·{" "}
              {getSelectedItem("hair")?.name} ·{" "}
              {getSelectedItem("outfit")?.name}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="relative z-10 flex gap-3 mt-4">
            <motion.button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-[12px] font-medium text-[#8A8880] disabled:opacity-40 transition-opacity border border-[rgba(255,255,255,0.06)]"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={14} />
              重置
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-[12px] text-[12px] font-semibold text-[#0C0C14] disabled:opacity-50 transition-all"
              style={{
                background: "linear-gradient(135deg, #D4A574, #C9956A)",
                boxShadow: "0 2px 8px rgba(212, 165, 116, 0.25)",
              }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -1 }}
            >
              <Save size={14} />
              {saving ? "保存中..." : "保存"}
            </motion.button>
          </div>

          {/* AI Generate Button */}
          <motion.button
            className="relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-semibold text-[#0C0C14] mt-3"
            style={{
              background: "linear-gradient(135deg, #D4A574, #C9956A)",
              boxShadow: "0 2px 12px rgba(212, 165, 116, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(212, 165, 116, 0.4)" }}
          >
            <Wand2 size={14} />
            AI生成
          </motion.button>
        </div>
      </motion.div>

      {/* Color Selector */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-[#D4A574]" />
          <span className="text-[15px] font-semibold text-[#E8E6E3]">
            主题色彩
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {colorOptions.map((color) => (
            <motion.button
              key={color.id}
              onClick={() => handleColorChange(color.id)}
              className="relative flex flex-col items-center gap-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-shadow duration-200 ${
                  config.color === color.id
                    ? "shadow-[0_0_0_3px_#0C0C14,0_0_0_5px_#D4A574]"
                    : "shadow-md hover:shadow-lg"
                }`}
                style={{ backgroundColor: color.value }}
              >
                {config.color === color.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                  >
                    <Check size={16} className="text-[#0C0C14]" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
              <span className="text-[10px] text-[#5A5854]">{color.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Category Selector - Pill shaped with amber gradient active */}
      <motion.div variants={itemVariants} className="mx-4 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-[#0C0C14]"
                    : "text-[#8A8880] border border-[rgba(255,255,255,0.06)] hover:text-[#D4A574]"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #D4A574, #C9956A)",
                        boxShadow: "0 2px 8px rgba(212, 165, 116, 0.25)",
                        border: "none",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                      }
                }
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={15} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Options Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="mx-4 mt-3"
          variants={optionVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <div className="grid grid-cols-3 gap-2.5">
            {currentCategory?.items.map((item, index) => {
              const isSelected = (config as any)[activeCategory] === item.id;
              const ItemIcon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() =>
                    item.unlocked && handleSelect(activeCategory, item.id)
                  }
                  className={`relative flex flex-col items-center gap-2 p-3.5 rounded-[14px] transition-all duration-200 border ${
                    isSelected
                      ? "border-[rgba(212,165,116,0.3)]"
                      : item.unlocked
                      ? "border-[rgba(255,255,255,0.04)] hover:border-[rgba(212,165,116,0.15)]"
                      : "border-[rgba(255,255,255,0.04)] opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    background: isSelected
                      ? "rgba(212,165,116,0.08)"
                      : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.04,
                    ease: [0.25, 0.1, 0.25, 1] as const,
                  }}
                  whileHover={item.unlocked ? { y: -2 } : {}}
                  whileTap={item.unlocked ? { scale: 0.96 } : {}}
                >
                  <ItemIcon
                    size={24}
                    className={
                      isSelected ? "text-[#D4A574]" : item.unlocked ? "text-[#8A8880]" : "text-[#5A5854]"
                    }
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      isSelected
                        ? "text-[#D4A574]"
                        : item.unlocked
                        ? "text-[#E8E6E3]"
                        : "text-[#5A5854]"
                    }`}
                  >
                    {item.name}
                  </span>
                  {!item.unlocked && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-[14px]"
                      style={{ background: "rgba(12,12,20,0.5)" }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <Lock size={12} className="text-[#5A5854]" />
                      </div>
                    </div>
                  )}
                  {isSelected && item.unlocked && (
                    <motion.div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #D4A574, #C9956A)" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      <Check size={10} className="text-[#0C0C14]" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom padding */}
      <div className="h-6" />
    </motion.div>
  );
}