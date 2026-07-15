"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">设置</h1>
      </div>

      <div className="p-4 space-y-2">
        {/* 通知设置 */}
        <SettingsSection title="通知设置" icon="🔔" expanded={expanded === "notify"} onToggle={() => toggle("notify")}>
          <ToggleItem label="消息通知" desc="接收新消息提醒" defaultOn />
          <ToggleItem label="主动关心提醒" desc="AI主动发消息时提醒你" defaultOn />
          <ToggleItem label="朋友圈通知" desc="有人评论/点赞时提醒" defaultOn />
          <ToggleItem label="声音" desc="消息提示音" defaultOn />
          <ToggleItem label="震动" desc="消息震动" defaultOn />
        </SettingsSection>

        {/* AI主动消息 */}
        <SettingsSection title="AI主动消息" icon="💬" expanded={expanded === "proactive"} onToggle={() => toggle("proactive")}>
          <SelectItem label="主动消息频率" options={["每天", "每周几次", "仅特殊日子", "关闭"]} defaultValue="每天" />
          <SelectItem label="消息时间段" options={["全天", "8:00-22:00", "9:00-18:00", "自定义"]} defaultValue="8:00-22:00" />
          <ToggleItem label="早安/晚安" desc="AI每天早晚问候" defaultOn />
          <ToggleItem label="情绪关心" desc="AI发现你情绪变化时关心" defaultOn />
          <ToggleItem label="记忆触发" desc="AI想起过去的事时分享" defaultOn />
        </SettingsSection>

        {/* 隐私设置 */}
        <SettingsSection title="隐私设置" icon="🔒" expanded={expanded === "privacy"} onToggle={() => toggle("privacy")}>
          <ToggleItem label="对话加密" desc="端到端加密对话内容" defaultOn />
          <NavItem label="记忆管理" desc="查看和删除AI记住的事" />
          <SelectItem label="数据存储位置" options={["云端加密存储", "仅本地存储", "混合模式"]} defaultValue="云端加密存储" />
          <ToggleItem label="匿名化" desc="数据用于改进时去除个人信息" defaultOn />
          <DangerItem label="清除所有数据" desc="删除所有对话和记忆" />
        </SettingsSection>

        {/* 外观设置 */}
        <SettingsSection title="外观设置" icon="🎨" expanded={expanded === "appearance"} onToggle={() => toggle("appearance")}>
          <SelectItem label="主题" options={["浅色", "深色", "跟随系统"]} defaultValue="浅色" />
          <SelectItem label="字体大小" options={["小", "默认", "大", "特大"]} defaultValue="默认" />
          <SelectItem label="聊天气泡样式" options={["圆角", "方形", "气泡"]} defaultValue="圆角" />
        </SettingsSection>

        {/* 语言 */}
        <SettingsSection title="语言" icon="🌍" expanded={expanded === "lang"} onToggle={() => toggle("lang")}>
          <SelectItem label="界面语言" options={["简体中文", "English", "日本語", "한국어"]} defaultValue="简体中文" />
        </SettingsSection>

        {/* 订阅管理 */}
        <SettingsSection title="订阅管理" icon="💳" expanded={expanded === "subscribe"} onToggle={() => toggle("subscribe")}>
          <NavItem label="当前套餐" desc="免费版" />
          <NavItem label="升级套餐" desc="解锁更多功能" />
          <NavItem label="账单记录" desc="查看付费历史" />
        </SettingsSection>

        {/* 帮助反馈 */}
        <SettingsSection title="帮助反馈" icon="❓" expanded={expanded === "help"} onToggle={() => toggle("help")}>
          <NavItem label="常见问题" desc="FAQ" />
          <NavItem label="联系客服" desc="在线客服" />
          <NavItem label="意见反馈" desc="告诉我们你的想法" />
        </SettingsSection>

        {/* 关于 */}
        <SettingsSection title="关于Aria" icon="ℹ️" expanded={expanded === "about"} onToggle={() => toggle("about")}>
          <InfoItem label="版本" value="0.1.0" />
          <InfoItem label="更新日期" value="2026-06-27" />
          <NavItem label="用户协议" />
          <NavItem label="隐私政策" />
        </SettingsSection>

        {/* 退出登录 */}
        <button className="w-full py-3 text-red-500 font-medium bg-white rounded-xl border border-gray-100 hover:bg-red-50 mt-4">
          退出登录
        </button>
      </div>
    </div>
  );
}

// ============================================
// 组件
// ============================================

function SettingsSection({ title, icon, expanded, onToggle, children }: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

function ToggleItem({ label, desc, defaultOn = false }: {
  label: string;
  desc?: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-gray-400">{desc}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full transition-colors ${on ? "bg-purple-500" : "bg-gray-300"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SelectItem({ label, desc, options, defaultValue }: {
  label: string;
  desc?: string;
  options: string[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-gray-400">{desc}</div>}
      </div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function NavItem({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-gray-400">{desc}</div>}
      </div>
      <span className="text-gray-300">→</span>
    </div>
  );
}

function DangerItem({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-red-50">
      <div>
        <div className="text-sm font-medium text-red-500">{label}</div>
        {desc && <div className="text-xs text-gray-400">{desc}</div>}
      </div>
      <span className="text-red-300">→</span>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-gray-500">{value}</div>
    </div>
  );
}
