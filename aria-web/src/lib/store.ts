/**
 * Aria状态管理
 */

import { create } from "zustand";
import type { ChatResponse, EmotionState, MemoryStats } from "./api";

// 用户状态
interface UserState {
  userId: number | null;
  nickname: string;
  mbti: string | null;
  zodiac: string | null;
  isLoggedIn: boolean;

  setLogin: (userId: number, nickname: string, mbti?: string, zodiac?: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  nickname: "",
  mbti: null,
  zodiac: null,
  isLoggedIn: false,

  setLogin: (userId, nickname, mbti, zodiac) =>
    set({ userId, nickname, mbti: mbti || null, zodiac: zodiac || null, isLoggedIn: true }),
  logout: () =>
    set({ userId: null, nickname: "", mbti: null, zodiac: null, isLoggedIn: false }),
}));

// AI伴侣状态
interface AIPartnerState {
  name: string;
  mbti: string;
  zodiac: string;
  emotion: EmotionState | null;
  memoryStats: MemoryStats | null;
  daysTogether: number;
  closeness: number;

  setPartner: (name: string, mbti: string, zodiac: string) => void;
  setEmotion: (emotion: EmotionState) => void;
  setMemoryStats: (stats: MemoryStats) => void;
}

export const useAIPartnerStore = create<AIPartnerState>((set) => ({
  name: "",
  mbti: "",
  zodiac: "",
  emotion: null,
  memoryStats: null,
  daysTogether: 0,
  closeness: 0,

  setPartner: (name, mbti, zodiac) => set({ name, mbti, zodiac }),
  setEmotion: (emotion) => set({ emotion }),
  setMemoryStats: (stats) => set({ memoryStats: stats }),
}));

// 聊天状态
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
  sticker: string | null;
  emotionLabel: string | null;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;

  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  sessionId: `session_${Date.now()}`,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setMessages: (msgs) => set({ messages: msgs }),
  clearMessages: () => set({ messages: [], sessionId: `session_${Date.now()}` }),
}));
