/**
 * 捏脸系统状态管理
 */

import { create } from "zustand";
import { type AvatarConfig, DEFAULT_AVATAR } from "./types";

interface AvatarState {
  config: AvatarConfig;
  isEditing: boolean;
  generatedImage: string | null;  // base64编码的生成图片

  // 更新配置
  updateConfig: (partial: Partial<AvatarConfig>) => void;

  // 重置为默认
  resetConfig: () => void;

  // 加载预设
  loadPreset: (preset: AvatarConfig) => void;

  // 设置编辑状态
  setEditing: (editing: boolean) => void;

  // 设置生成的图片
  setGeneratedImage: (image: string | null) => void;

  // 获取完整配置
  getConfig: () => AvatarConfig;
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  config: { ...DEFAULT_AVATAR },
  isEditing: false,
  generatedImage: null,

  updateConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  resetConfig: () =>
    set({ config: { ...DEFAULT_AVATAR }, generatedImage: null }),

  loadPreset: (preset) =>
    set({ config: { ...preset } }),

  setEditing: (editing) =>
    set({ isEditing: editing }),

  setGeneratedImage: (image) =>
    set({ generatedImage: image }),

  getConfig: () => get().config,
}));
