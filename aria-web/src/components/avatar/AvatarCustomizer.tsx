/**
 * 捏脸控制面板 - 让用户调整虚拟恋人形象
 */

"use client";

import { useState } from "react";
import { useAvatarStore } from "../../lib/avatar/store";
import {
  FACE_SHAPES, EYE_SHAPES, EYE_COLORS, NOSE_SHAPES, MOUTH_SHAPES, BROW_SHAPES,
  HAIR_STYLES, HAIR_COLORS, HEIGHTS, BODY_TYPES, TOP_STYLES, BOTTOM_STYLES,
  SHOE_STYLES, ACCESSORIES, BACKGROUNDS, CLOTHING_COLORS,
  type FaceShape, type EyeShape, type EyeColor, type NoseShape, type MouthShape,
  type BrowShape, type HairStyle, type HairColor, type Height, type BodyType,
  type TopStyle, type BottomStyle, type ShoeStyle, type Accessory, type Background,
} from "../../lib/avatar/types";
import AvatarRenderer from "./AvatarRenderer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360";

const SECTIONS = [
  { id: "face", label: "脸部", icon: "😊" },
  { id: "hair", label: "发型", icon: "💇" },
  { id: "body", label: "身材", icon: "👤" },
  { id: "clothing", label: "装扮", icon: "👗" },
  { id: "background", label: "背景", icon: "🎨" },
];

export default function AvatarCustomizer() {
  const { config, updateConfig, generatedImage, setGeneratedImage } = useAvatarStore();
  const [activeSection, setActiveSection] = useState("face");
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/avatar/generate/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: config,
          size: 512,
        }),
      });
      const data = await res.json();
      if (data.image) {
        setGeneratedImage(`data:image/jpeg;base64,${data.image}`);
      }
    } catch (e) {
      console.error("Generate failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/avatar/generate/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          style: "anime",
          size: 512,
        }),
      });
      const data = await res.json();
      if (data.image) {
        setGeneratedImage(`data:image/jpeg;base64,${data.image}`);
      }
    } catch (e) {
      console.error("Generate failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 左侧：实时预览 */}
      <div className="lg:w-1/3">
        <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl p-6 flex flex-col items-center">
          <h3 className="font-semibold text-sm mb-4">实时预览</h3>

          {/* 显示生成的图片或CSS头像 */}
          {generatedImage ? (
            <div className="relative">
              <img
                src={generatedImage}
                alt="AI伴侣"
                className="w-[180px] h-[180px] object-cover rounded-2xl"
              />
              <button
                onClick={() => setGeneratedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <AvatarRenderer config={config} size={180} />
          )}

          <p className="text-xs text-gray-500 mt-4">你的AI伴侣</p>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中...
              </span>
            ) : (
              "✨ 生成AI立绘"
            )}
          </button>
        </div>

        {/* 自定义提示词 */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100">
          <label className="text-sm font-medium text-gray-700 mb-2 block">自定义描述</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要的形象，如：粉色长发，温柔微笑，穿着白色连衣裙..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
            rows={3}
          />
          <button
            onClick={handleGenerateFromPrompt}
            disabled={isGenerating || !prompt.trim()}
            className="mt-2 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors"
          >
            根据描述生成
          </button>
        </div>
      </div>

      {/* 右侧：参数调节 */}
      <div className="lg:w-2/3 space-y-4">
        {/* 分类选择 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? "bg-purple-500 text-white"
                  : "bg-white border border-gray-200 hover:border-purple-300"
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* 脸部设置 */}
        {activeSection === "face" && (
          <div className="space-y-4">
            <OptionGroup label="脸型" options={FACE_SHAPES} value={config.faceShape}
              onChange={(v) => updateConfig({ faceShape: v as FaceShape })} />
            <OptionGroup label="眼睛" options={EYE_SHAPES} value={config.eyeShape}
              onChange={(v) => updateConfig({ eyeShape: v as EyeShape })} />
            <OptionGroup label="眼睛颜色" options={EYE_COLORS} value={config.eyeColor}
              onChange={(v) => updateConfig({ eyeColor: v as EyeColor })} />
            <OptionGroup label="鼻子" options={NOSE_SHAPES} value={config.noseShape}
              onChange={(v) => updateConfig({ noseShape: v as NoseShape })} />
            <OptionGroup label="嘴巴" options={MOUTH_SHAPES} value={config.mouthShape}
              onChange={(v) => updateConfig({ mouthShape: v as MouthShape })} />
            <OptionGroup label="眉毛" options={BROW_SHAPES} value={config.browShape}
              onChange={(v) => updateConfig({ browShape: v as BrowShape })} />
          </div>
        )}

        {/* 发型设置 */}
        {activeSection === "hair" && (
          <div className="space-y-4">
            <OptionGroup label="发型" options={HAIR_STYLES} value={config.hairStyle}
              onChange={(v) => updateConfig({ hairStyle: v as HairStyle })} />
            <ColorGroup label="发色" colors={Object.entries(HAIR_COLORS).map(([k, v]) => ({ value: k, label: v }))}
              value={config.hairColor} onChange={(v) => updateConfig({ hairColor: v as HairColor })} />
          </div>
        )}

        {/* 身材设置 */}
        {activeSection === "body" && (
          <div className="space-y-4">
            <OptionGroup label="身高" options={HEIGHTS} value={config.height}
              onChange={(v) => updateConfig({ height: v as Height })} />
            <OptionGroup label="体型" options={BODY_TYPES} value={config.bodyType}
              onChange={(v) => updateConfig({ bodyType: v as BodyType })} />
          </div>
        )}

        {/* 装扮设置 */}
        {activeSection === "clothing" && (
          <div className="space-y-4">
            <OptionGroup label="上衣" options={TOP_STYLES} value={config.top}
              onChange={(v) => updateConfig({ top: v as TopStyle })} />
            <ColorGroup label="上衣颜色" colors={CLOTHING_COLORS.map((c) => ({ value: c, label: c }))}
              value={config.topColor} onChange={(v) => updateConfig({ topColor: v })} />
            <OptionGroup label="下装" options={BOTTOM_STYLES} value={config.bottom}
              onChange={(v) => updateConfig({ bottom: v as BottomStyle })} />
            <ColorGroup label="下装颜色" colors={CLOTHING_COLORS.map((c) => ({ value: c, label: c }))}
              value={config.bottomColor} onChange={(v) => updateConfig({ bottomColor: v })} />
            <OptionGroup label="鞋子" options={SHOE_STYLES} value={config.shoes}
              onChange={(v) => updateConfig({ shoes: v as ShoeStyle })} />
            <OptionGroup label="配饰" options={ACCESSORIES} value={config.accessory}
              onChange={(v) => updateConfig({ accessory: v as Accessory })} />
          </div>
        )}

        {/* 背景设置 */}
        {activeSection === "background" && (
          <div className="space-y-4">
            <OptionGroup label="背景" options={BACKGROUNDS} value={config.background}
              onChange={(v) => updateConfig({ background: v as Background })} />
            {config.background === "custom" && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">自定义背景功能开发中...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 选项组组件
function OptionGroup({ label, options, value, onChange }: {
  label: string;
  options: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              value === key
                ? "bg-purple-500 text-white"
                : "bg-white border border-gray-200 hover:border-purple-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 颜色选择组件
function ColorGroup({ label, colors, value, onChange }: {
  label: string;
  colors: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${
              value === color.value
                ? "border-purple-500 scale-110"
                : "border-gray-200 hover:border-purple-300"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.label}
          />
        ))}
      </div>
    </div>
  );
}
