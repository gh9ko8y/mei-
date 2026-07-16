"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  Bell,
  MessageCircle,
  Lock,
  Palette,
  Globe,
  CreditCard,
  HelpCircle,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <div
      className="min-h-screen max-w-md mx-auto"
      style={{ background: "#0C0C14" }}
    >
      {/* 顶部导航 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          background: "rgba(12, 12, 20, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <motion.button
          onClick={() => router.back()}
          className="text-[#8A8880] p-1"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <h1 className="font-semibold text-lg text-[#E8E6E3]">设置</h1>
      </div>

      <div className="p-4 space-y-3">
        {/* 通知设置 */}
        <SettingsSection
          title="通知设置"
          icon={Bell}
          expanded={expanded === "notify"}
          onToggle={() => toggle("notify")}
        >
          <ToggleItem label="消息通知" desc="接收新消息提醒" defaultOn />
          <ToggleItem label="主动关心提醒" desc="AI主动发消息时提醒你" defaultOn />
          <ToggleItem label="朋友圈通知" desc="有人评论/点赞时提醒" defaultOn />
          <ToggleItem label="声音" desc="消息提示音" defaultOn />
          <ToggleItem label="震动" desc="消息震动" defaultOn />
        </SettingsSection>

        {/* AI主动消息 */}
        <SettingsSection
          title="AI主动消息"
          icon={MessageCircle}
          expanded={expanded === "proactive"}
          onToggle={() => toggle("proactive")}
        >
          <SelectItem label="主动消息频率" options={["每天", "每周几次", "仅特殊日子", "关闭"]} defaultValue="每天" />
          <SelectItem label="消息时间段" options={["全天", "8:00-22:00", "9:00-18:00", "自定义"]} defaultValue="8:00-22:00" />
          <ToggleItem label="早安/晚安" desc="AI每天早晚问候" defaultOn />
          <ToggleItem label="情绪关心" desc="AI发现你情绪变化时关心" defaultOn />
          <ToggleItem label="记忆触发" desc="AI想起过去的事时分享" defaultOn />
        </SettingsSection>

        {/* 隐私设置 */}
        <SettingsSection
          title="隐私设置"
          icon={Lock}
          expanded={expanded === "privacy"}
          onToggle={() => toggle("privacy")}
        >
          <ToggleItem label="对话加密" desc="端到端加密对话内容" defaultOn />
          <NavItem label="记忆管理" desc="查看和删除AI记住的事" />
          <SelectItem label="数据存储位置" options={["云端加密存储", "仅本地存储", "混合模式"]} defaultValue="云端加密存储" />
          <ToggleItem label="匿名化" desc="数据用于改进时去除个人信息" defaultOn />
          <DangerItem label="清除所有数据" desc="删除所有对话和记忆" />
        </SettingsSection>

        {/* 外观设置 */}
        <SettingsSection
          title="外观设置"
          icon={Palette}
          expanded={expanded === "appearance"}
          onToggle={() => toggle("appearance")}
        >
          <SelectItem label="主题" options={["浅色", "深色", "跟随系统"]} defaultValue="深色" />
          <SelectItem label="字体大小" options={["小", "默认", "大", "特大"]} defaultValue="默认" />
          <SelectItem label="聊天气泡样式" options={["圆角", "方形", "气泡"]} defaultValue="圆角" />
        </SettingsSection>

        {/* 语言 */}
        <SettingsSection
          title="语言"
          icon={Globe}
          expanded={expanded === "lang"}
          onToggle={() => toggle("lang")}
        >
          <SelectItem label="界面语言" options={["简体中文", "English", "日本語", "한국어"]} defaultValue="简体中文" />
        </SettingsSection>

        {/* 订阅管理 */}
        <SettingsSection
          title="订阅管理"
          icon={CreditCard}
          expanded={expanded === "subscribe"}
          onToggle={() => toggle("subscribe")}
        >
          <NavItem label="当前套餐" desc="免费版" />
          <NavItem label="升级套餐" desc="解锁更多功能" />
          <NavItem label="账单记录" desc="查看付费历史" />
        </SettingsSection>

        {/* 帮助反馈 */}
        <SettingsSection
          title="帮助反馈"
          icon={HelpCircle}
          expanded={expanded === "help"}
          onToggle={() => toggle("help")}
        >
          <NavItem label="常见问题" desc="FAQ" />
          <NavItem label="联系客服" desc="在线客服" />
          <NavItem label="意见反馈" desc="告诉我们你的想法" />
        </SettingsSection>

        {/* 关于Aria */}
        <SettingsSection
          title="关于Aria"
          icon={Info}
          expanded={expanded === "about"}
          onToggle={() => toggle("about")}
        >
          <InfoItem label="版本" value="0.1.0" />
          <InfoItem label="更新日期" value="2026-06-27" />
          <NavItem label="用户协议" />
          <NavItem label="隐私政策" />
        </SettingsSection>

        {/* 退出登录 */}
        <motion.button
          className="w-full py-3.5 font-medium rounded-[20px] text-sm mt-4"
          style={{
            background: "rgba(155, 91, 91, 0.08)",
            border: "1px solid rgba(155, 91, 91, 0.15)",
            color: "#9B5B5B",
          }}
          whileHover={{ background: "rgba(155, 91, 91, 0.12)" }}
          whileTap={{ scale: 0.98 }}
        >
          退出登录
        </motion.button>
      </div>
    </div>
  );
}

// ============================================
// 子组件
// ============================================

function SettingsSection({ title, icon: Icon, expanded, onToggle, children }: {
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(212, 165, 116, 0.08)" }}
          >
            <Icon size={15} className="text-[#D4A574]" />
          </div>
          <span className="text-sm font-medium text-[#E8E6E3]">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown size={18} className="text-[#5A5854]" />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="divide-y"
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                borderColor: "rgba(255, 255, 255, 0.04)",
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <div className="text-sm font-medium text-[#E8E6E3]">{label}</div>
        {desc && <div className="text-[11px] text-[#8A8880] mt-0.5">{desc}</div>}
      </div>
      <motion.button
        onClick={() => setOn(!on)}
        className="relative rounded-full shrink-0"
        style={{
          width: 50,
          height: 30,
          background: on ? "#D4A574" : "rgba(255, 255, 255, 0.1)",
        }}
        animate={{ background: on ? "#D4A574" : "rgba(255, 255, 255, 0.1)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-[3px] w-6 h-6 rounded-full"
          animate={{ left: on ? 23 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            background: on ? "#0C0C14" : "#8A8880",
            boxShadow: on ? "0 1px 4px rgba(212, 165, 116, 0.3)" : "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
      </motion.button>
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
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <div className="text-sm font-medium text-[#E8E6E3]">{label}</div>
        {desc && <div className="text-[11px] text-[#8A8880] mt-0.5">{desc}</div>}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-sm rounded-[12px] px-3 py-1.5 outline-none appearance-none pr-8 cursor-pointer font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#E8E6E3",
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#1A1A24", color: "#E8E6E3" }}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A5854] pointer-events-none"
        />
      </div>
    </div>
  );
}

function NavItem({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)]">
      <div>
        <div className="text-sm font-medium text-[#E8E6E3]">{label}</div>
        {desc && <div className="text-[11px] text-[#8A8880] mt-0.5">{desc}</div>}
      </div>
      <ChevronDown size={16} className="text-[#5A5854] -rotate-90" />
    </div>
  );
}

function DangerItem({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors hover:bg-[rgba(155,91,91,0.05)]">
      <div>
        <div className="text-sm font-medium text-[#9B5B5B]">{label}</div>
        {desc && <div className="text-[11px] text-[#8A8880] mt-0.5">{desc}</div>}
      </div>
      <ChevronDown size={16} className="text-[#5A5854] -rotate-90" />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="text-sm font-medium text-[#E8E6E3]">{label}</div>
      <div className="text-sm text-[#8A8880]">{value}</div>
    </div>
  );
}