"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Image, Smile, Scissors, Shirt, Gem, Palette, Check } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360";

const categories = [
  { id: "avatar", label: "头像", icon: Image },
  { id: "face", label: "脸部", icon: Smile },
  { id: "hair", label: "发型", icon: Scissors },
  { id: "clothing", label: "服装", icon: Shirt },
  { id: "accessory", label: "配饰", icon: Gem },
  { id: "background", label: "背景", icon: Palette },
];

const faceOptions = {
  shapes: ["圆脸", "鹅蛋脸", "瓜子脸", "方脸"],
  eyes: ["大眼", "细长", "丹凤", "杏眼"],
  nose: ["小巧", "高挺", "自然"],
  mouth: ["樱桃", "薄唇", "丰满"],
};

const hairOptions = {
  styles: ["长直发", "卷发", "短发", "马尾", "双马尾", "丸子头"],
  colors: ["黑色", "棕色", "金色", "粉色", "紫色", "蓝色"],
};

const clothingOptions = {
  tops: ["T恤", "衬衫", "连衣裙", "卫衣", "西装"],
  colors: ["白色", "黑色", "粉色", "蓝色", "红色"],
};

const themeColors = [
  { id: "pink", label: "粉红", bg: "from-[#E85D75] to-[#F28C8C]" },
  { id: "purple", label: "紫罗兰", bg: "from-[#9B6DD5] to-[#B794E0]" },
  { id: "blue", label: "天空蓝", bg: "from-[#6B8DD6] to-[#8BA5E0]" },
  { id: "green", label: "薄荷绿", bg: "from-[#4CAF7A] to-[#6BC194]" },
  { id: "orange", label: "暖橙", bg: "from-[#F5A623] to-[#F7BE5E]" },
  { id: "red", label: "珊瑚红", bg: "from-[#C44569] to-[#E85D75]" },
  { id: "teal", label: "青绿", bg: "from-[#2AA876] to-[#4DC99A]" },
  { id: "rose", label: "玫瑰", bg: "from-[#D4759F] to-[#E8A0C0]" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function DressUpTab() {
  const [selectedCategory, setSelectedCategory] = useState("avatar");
  const [aiAvatar, setAiAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState("pink");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAiAvatar(reader.result as string);
      localStorage.setItem("aria_ai_avatar", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAiAvatar(null);
    } catch (e) {
      console.error("生成失败:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleOption = (category: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: prev[category] === value ? "" : value,
    }));
  };

  return (
    <motion.div
      className="p-4 bg-[#FFF8F5] min-h-[calc(100dvh-60px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-lg mb-4 text-[#2D2D3A]"
      >
        装扮
      </motion.h1>

      {/* 预览区域 */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        className="bg-gradient-to-b from-[#FCE4EC]/60 to-[#FFF0F3]/40 rounded-[20px] p-6 mb-4 border border-[rgba(0,0,0,0.03)] shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="relative group"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {aiAvatar ? (
              <img
                src={aiAvatar}
                alt="AI伴侣"
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-[0_4px_16px_rgba(232,93,117,0.2)]"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center text-6xl border-4 border-white shadow-[0_4px_16px_rgba(232,93,117,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                <Sparkles size={48} className="text-white/80" />
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-[4px]">
              <Camera size={28} className="text-white" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadAvatar}
              />
            </label>
          </motion.div>
          <p className="text-sm text-[#6B6B7B] mt-3 font-medium">AI伴侣头像</p>
          <div className="flex gap-2 mt-3">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border border-[#E5E5EB] rounded-[14px] text-sm font-medium hover:bg-[#FFF0F3] hover:border-[#E85D75] transition-all flex items-center gap-1.5 text-[#2D2D3A]"
            >
              <Camera size={14} />
              上传头像
            </motion.button>
            <motion.button
              onClick={handleGenerateAvatar}
              disabled={isGenerating}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[14px] text-sm font-medium shadow-[0_4px_16px_rgba(232,93,117,0.25)] disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Sparkles size={14} />
              )}
              {isGenerating ? "生成中..." : "AI生成"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 主题色彩 */}
      <motion.div variants={sectionVariants} initial="hidden" animate="show" className="mb-4">
        <h3 className="text-sm font-semibold text-[#2D2D3A] mb-2">主题色彩</h3>
        <div className="flex gap-2 flex-wrap">
          {themeColors.map((color) => (
            <motion.button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.bg} ${
                selectedColor === color.id
                  ? "ring-2 ring-offset-2 ring-[#E85D75] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                  : "opacity-70 hover:opacity-100"
              } transition-all`}
              title={color.label}
            />
          ))}
        </div>
      </motion.div>

      {/* 分类选择 */}
      <motion.div variants={sectionVariants} initial="hidden" animate="show" className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.25)] font-medium"
                  : "bg-white border border-[#E5E5EB] text-[#6B6B7B] hover:border-[#E85D75] hover:text-[#E85D75]"
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* 选项区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          {selectedCategory === "face" && (
            <div className="space-y-4">
              <OptionGroup label="脸型" options={faceOptions.shapes} selected={selectedOptions["face-shape"]} onSelect={(v) => toggleOption("face-shape", v)} />
              <OptionGroup label="眼睛" options={faceOptions.eyes} selected={selectedOptions["face-eyes"]} onSelect={(v) => toggleOption("face-eyes", v)} />
              <OptionGroup label="鼻子" options={faceOptions.nose} selected={selectedOptions["face-nose"]} onSelect={(v) => toggleOption("face-nose", v)} />
              <OptionGroup label="嘴巴" options={faceOptions.mouth} selected={selectedOptions["face-mouth"]} onSelect={(v) => toggleOption("face-mouth", v)} />
            </div>
          )}

          {selectedCategory === "hair" && (
            <div className="space-y-4">
              <OptionGroup label="发型" options={hairOptions.styles} selected={selectedOptions["hair-style"]} onSelect={(v) => toggleOption("hair-style", v)} />
              <OptionGroup label="发色" options={hairOptions.colors} selected={selectedOptions["hair-color"]} onSelect={(v) => toggleOption("hair-color", v)} />
            </div>
          )}

          {selectedCategory === "clothing" && (
            <div className="space-y-4">
              <OptionGroup label="上衣" options={clothingOptions.tops} selected={selectedOptions["clothing-top"]} onSelect={(v) => toggleOption("clothing-top", v)} />
              <OptionGroup label="颜色" options={clothingOptions.colors} selected={selectedOptions["clothing-color"]} onSelect={(v) => toggleOption("clothing-color", v)} />
            </div>
          )}

          {(selectedCategory === "avatar" || selectedCategory === "accessory" || selectedCategory === "background") && (
            <div className="text-center text-[#A0A0B0] py-8">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl mb-3"
              >
                {selectedCategory === "avatar" ? "✨" : selectedCategory === "accessory" ? "💍" : "🎨"}
              </motion.div>
              <p className="text-sm">
                {selectedCategory === "avatar" ? "头像区域上方可上传或生成" : selectedCategory === "accessory" ? "配饰商店即将开放" : "背景商店即将开放"}
              </p>
              <p className="text-xs text-[#A0A0B0] mt-1">敬请期待</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function OptionGroup({ label, options, selected, onSelect }: {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#2D2D3A] mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <motion.button
              key={opt}
              onClick={() => onSelect(opt)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-[14px] text-sm transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.25)] font-medium"
                  : "bg-[#F7F7F9] text-[#2D2D3A] hover:bg-[#FCE4EC] hover:text-[#E85D75]"
              }`}
            >
              <span className="flex items-center gap-1">
                {isSelected && <Check size={12} />}
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
