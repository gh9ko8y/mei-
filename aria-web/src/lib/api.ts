/**
 * Aria API客户端
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// ============================================
// 类型定义
// ============================================

export interface ChatResponse {
  reply: string;
  emotion_label: string;
  event_id: number;
  sticker: string | null;
}

export interface PersonaPreset {
  desc: string;
  mbti: string;
  zodiac: string;
}

export interface PersonaResponse {
  name: string;
  mbti: string;
  zodiac: string;
  system_prompt: string;
}

export interface CompatibilityResult {
  level: string;
  label: string;
  desc: string;
  details: [string, { level: string }][];
}

export interface EmotionState {
  valence: number;
  arousal: number;
  dominance: number;
  emotion_label: string;
  created_at: string;
}

export interface MemoryStats {
  total_events: number;
  valid_events: number;
  invalidated: number;
  emotions_recorded: number;
}

export interface ChatEvent {
  id: number;
  user_id: number;
  role: string;
  content: string;
  content_type: string;
  valid_start: string | null;
  is_valid: boolean;
  session_id: string;
}

// ============================================
// API函数
// ============================================

// 人格
export async function getPresets(): Promise<Record<string, PersonaPreset>> {
  return request("/personality/presets");
}

export async function createPersona(
  userId: number,
  presetName?: string,
  customConfig?: Record<string, unknown>
): Promise<PersonaResponse> {
  return request("/personality/create", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      preset_name: presetName,
      custom_config: customConfig,
    }),
  });
}

// 对话
export async function sendMessage(
  userId: number,
  content: string,
  sessionId: string = "default"
): Promise<ChatResponse> {
  return request("/chat/send", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      content,
      session_id: sessionId,
    }),
  });
}

export async function getHistory(
  userId: number,
  sessionId?: string,
  limit: number = 50
): Promise<ChatEvent[]> {
  const params = new URLSearchParams({ user_id: String(userId), limit: String(limit) });
  if (sessionId) params.set("session_id", sessionId);
  return request(`/chat/history?${params}`);
}

// 情绪
export async function getCurrentEmotion(userId: number): Promise<EmotionState> {
  return request(`/emotion/current?user_id=${userId}`);
}

// 记忆
export async function getMemoryStats(userId: number): Promise<MemoryStats> {
  return request(`/memory/stats?user_id=${userId}`);
}

// 适配
export async function checkCompatibility(
  userMbti?: string,
  aiMbti?: string,
  userZodiac?: string,
  aiZodiac?: string
): Promise<CompatibilityResult> {
  return request("/compatibility", {
    method: "POST",
    body: JSON.stringify({
      user_mbti: userMbti,
      ai_mbti: aiMbti,
      user_zodiac: userZodiac,
      ai_zodiac: aiZodiac,
    }),
  });
}

// 健康检查
export async function healthCheck(): Promise<{ status: string; model: string }> {
  return request("/health");
}

// TTS语音合成
export async function synthesizeSpeech(text: string, voice: string = "alloy"): Promise<Blob> {
  const url = `${API_BASE}/tts/synthesize`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) throw new Error("TTS failed");
  return res.blob();
}

// 表情包列表
export interface StickerItem {
  id: number;
  name: string;
  url: string;
  category: string;
}

export async function getStickers(category?: string): Promise<StickerItem[]> {
  const params = category ? `?category=${category}` : "";
  return request(`/stickers/pick${params}`);
}

// 图片上传（返回base64）
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
