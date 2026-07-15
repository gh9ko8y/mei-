"use client";

import { useState, useRef } from "react";
import { Camera, Sparkles, RefreshCw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360";

export default function DressUpTab() {
  const [selectedCategory, setSelectedCategory] = useState("avatar");
  const [aiAvatar, setAiAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "avatar", label: "头像", icon: "🖼️" },
    { id: "face", label: "脸部", icon: "😊" },
    { id: "hair", label: "发型", icon: "💇" },
    { id: "clothing", label: "服装", icon: "👗" },
    { id: "accessory", label: "配饰", icon: "💍" },
    { id: "background", label: "背景", icon: "🎨" },
  ];

  // 上传头像
  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAiAvatar(reader.result as string);
      // 保存到localStorage
      localStorage.setItem("aria_ai_avatar", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI生成头像
  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/avatar/generate/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "cute anime girl, gentle smile, beautiful, kawaii",
          style: "anime",
          size: 512,
        }),
      });
      const data = await res.json();
      if (data.image) {
        const avatarUrl = `data:image/jpeg;base64,${data.image}`;
        setAiAvatar(avatarUrl);
        localStorage.setItem("aria_ai_avatar", avatarUrl);
      }
    } catch (e) {
      console.error("生成失败:", e);
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <div className="p-4">
      <h1 className="font-semibold text-lg mb-4">装扮</h1>

      {/* 预览区域 */}
      <div className="bg-gradient-to-b from-indigo-50 to-white rounded-2xl p-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="relative group">
            {aiAvatar ? (
              <img
                src={aiAvatar}
                alt="AI伴侣"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-6xl">
                🥰
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera size={24} className="text-white" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadAvatar}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-3">AI伴侣头像</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50"
            >
              <Camera size={16} className="inline mr-1" />
              上传头像
            </button>
            <button
              onClick={handleGenerateAvatar}
              disabled={isGenerating}
              className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm hover:bg-indigo-600 disabled:opacity-50"
            >
              <Sparkles size={16} className="inline mr-1" />
              {isGenerating ? "生成中..." : "AI生成"}
            </button>
          </div>
        </div>
      </div>

      {/* 分类选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-indigo-500 text-white"
                : "bg-white border border-gray-200 hover:border-indigo-300"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 选项区域 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {selectedCategory === "face" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">脸型</label>
              <div className="flex flex-wrap gap-2">
                {faceOptions.shapes.map((shape) => (
                  <button
                    key={shape}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">眼睛</label>
              <div className="flex flex-wrap gap-2">
                {faceOptions.eyes.map((eye) => (
                  <button
                    key={eye}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {eye}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedCategory === "hair" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">发型</label>
              <div className="flex flex-wrap gap-2">
                {hairOptions.styles.map((style) => (
                  <button
                    key={style}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">发色</label>
              <div className="flex flex-wrap gap-2">
                {hairOptions.colors.map((color) => (
                  <button
                    key={color}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedCategory === "clothing" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">上衣</label>
              <div className="flex flex-wrap gap-2">
                {clothingOptions.tops.map((top) => (
                  <button
                    key={top}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">颜色</label>
              <div className="flex flex-wrap gap-2">
                {clothingOptions.colors.map((color) => (
                  <button
                    key={color}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition-colors"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedCategory === "accessory" && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-3">💍</div>
            <p className="text-sm">配饰商店即将开放</p>
          </div>
        )}

        {selectedCategory === "background" && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm">背景商店即将开放</p>
          </div>
        )}
      </div>
    </div>
  );
}
