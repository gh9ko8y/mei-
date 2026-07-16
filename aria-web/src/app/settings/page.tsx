"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function SettingsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const sections = [
    { key: "notify", title: "通知设置", icon: Bell, color: "from-[#E85D75]/10 to-[#F28C8C]/10", iconColor: "text-[#E85D75]" },
    { key: "proactive", title: "AI主动消息", icon: MessageCircle, color: "from-[#6B8DD6]/10 to-[#8BA5E0]/10", iconColor: "text-[#6B8DD6]" },
    { key: "privacy", title: "隐私设置", icon: Lock, color: "from-[#4CAF7A]/10 to-[#6BC194]/10", iconColor: "text-[#4CAF7A]" },
    { key: "appearance", title: "外观设置", icon: Palette, color: "from-[#9B6DD5]/10 to-[#B794E0]/10", iconColor: "text-[#9B6DD5]" },
    { key: "lang", title: "语言", icon: Globe, color: "from-[#F5A623]/10 to-[#F7BE5E]/10", iconColor: "text-[#F5A623]" },
    { key: "subscribe", title: "订阅管理", icon: CreditCard, color: "from-[#2AA876]/10 to-[#4DC99A]/10", iconColor: "text-[#2AA876]" },
    { key: "help", title: "帮助反馈", icon: HelpCircle, color: "from-[#6B8DD6]/10 to-[#8BA5E0]/10", iconColor: "text-[#6B8DD6]" },
    { key: "about", title: "关于Aria", icon: Info, color: "from-[#E85D75]/10 to-[#F28C8C]/10", iconColor: "text-[#E85D75]" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/72 backdrop-blur-[20px] saturate-[180%] border-b border-[rgba(0,0,0,0.05)] px-4 py-3 flex items-center gap-3">
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.9 }}
          className="text-[#6B6B7B] hover:text-[#2D2D3A] p-1 -ml-1"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <h1 className="font-bold text-lg text-[#2D2D3A]">设置</h1>
      </div>

      <div className="p-4 space-y-2.5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] overflow-hidden shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
            >
              <motion.button
                onClick={() => toggle(section.key)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <Icon size={15} className={section.iconColor} />
                  </div>
                  <span className="text-sm font-semibold text-[#2D2D3A]">{section.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: expanded === section.key ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown size={18} className="text-[#A0A0B0]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {expanded === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#F8F8F8]">
                      {section.key === "notify" && (
                        <>
                          <ToggleItem label="消息通知" desc="接收新消息提醒" defaultOn />
                          <ToggleItem label="主动关心提醒" desc="AI主动发消息时提醒你" defaultOn />
                          <ToggleItem label="朋友圈通知" desc="有人评论/点赞时提醒" defaultOn />
                          <ToggleItem label="声音" desc="消息提示音" defaultOn />
                          <ToggleItem label="震动" desc="消息震动" defaultOn />
                        </>
                      )}
                      {section.key === "proactive" && (
                        <>
                          <SelectItem label="主动消息频率" options={["每天", "每周几次", "仅特殊日子", "关闭"]} defaultValue="每天" />
                          <SelectItem label="消息时间段" options={["全天", "8:00-22:00", "9:00-18:00", "自定义"]} defaultValue="8:00-22:00" />
                          <ToggleItem label="早安/晚安" desc="AI每天早晚问候" defaultOn />
                          <ToggleItem label="情绪关心" desc="AI发现你情绪变化时关心" defaultOn />
                          <ToggleItem label="记忆触发" desc="AI想起过去的事时分享" defaultOn />
                        </>
                      )}
                      {section.key === "privacy" && (
                        <>
                          <ToggleItem label="对话加密" desc="端到端加密对话内容" defaultOn />
                          <NavItem label="记忆管理" desc="查看和删除AI记住的事" />
                          <SelectItem label="数据存储位置" options={["云端加密存储", "仅本地存储", "混合模式"]} defaultValue="云端加密存储" />
                          <ToggleItem label="匿名化" desc="数据用于改进时去除个人信息" defaultOn />
                          <DangerItem label="清除所有数据" desc="删除所有对话和记忆" />
                        </>
                      )}
                      {section.key === "appearance" && (
                        <>
                          <SelectItem label="主题" options={["浅色", "深色", "跟随系统"]} defaultValue="浅色" />
                          <SelectItem label="字体大小" options={["小", "默认", "大", "特大"]} defaultValue="默认" />
                          <SelectItem label="聊天气泡样式" options={["圆角", "方形", "气泡"]} defaultValue="圆角" />
                        </>
                      )}
                      {section.key === "lang" && (
                        <SelectItem label="界面语言" options={["简体中文", "English", "日本語", "한국어"]} defaultValue="简体中文" />
                      )}
                      {section.key === "subscribe" && (
                        <>
                          <NavItem label="当前套餐" desc="免费版" />
                          <NavItem label="升级套餐" desc="解锁更多功能" />
                          <NavItem label="账单记录" desc="查看付费历史" />
                        </>
                      )}
                      {section.key === "help" && (
                        <>
                          <NavItem label="常见问题" desc="FAQ" />
                          <NavItem label="联系客服" desc="在线客服" />
                          <NavItem label="意见反馈" desc="告诉我们你的想法" />
                        </>
                      )}
                      {section.key === "about" && (
                        <>
                          <InfoItem label="版本" value="0.1.0" />
                          <InfoItem label="更新日期" value="2026-06-27" />
                          <NavItem label="用户协议" />
                          <NavItem label="隐私政策" />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* 退出登录 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 text-[#E85D5D] font-semibold bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] hover:bg-[#FFF5F5] transition-colors shadow-[0_1px_3px_rgba(45,45,58,0.06)] mt-2"
        >
          退出登录
        </motion.button>
      </div>
    </div>
  );
}

/* ===== 子组件 ===== */

function ToggleItem({ label, desc, defaultOn = false }: {
  label: string;
  desc?: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <div className="text-sm font-medium text-[#2D2D3A]">{label}</div>
        {desc && <div className="text-xs text-[#A0A0B0] mt-0.5">{desc}</div>}
      </div>
      <motion.button
        onClick={() => setOn(!on)}
        className={`w-[50px] h-[30px] rounded-full p-[3px] transition-colors duration-200 ${
          on ? "bg-[#E85D75]" : "bg-[#E5E5EB]"
        }`}
      >
        <motion.div
          animate={{ x: on ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 bg-white rounded-full shadow-sm"
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
        <div className="text-sm font-medium text-[#2D2D3A]">{label}</div>
        {desc && <div className="text-xs text-[#A0A0B0] mt-0.5">{desc}</div>}
      </div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-sm bg-[#F7F7F9] border border-[#E5E5EB] rounded-[10px] px-3 py-1.5 outline-none focus:border-[#E85D75] transition-colors text-[#2D2D3A]"
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
    <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors">
      <div>
        <div className="text-sm font-medium text-[#2D2D3A]">{label}</div>
        {desc && <div className="text-xs text-[#A0A0B0] mt-0.5">{desc}</div>}
      </div>
      <ChevronLeft size={16} className="text-[#DDD] rotate-180" />
    </div>
  );
}

function DangerItem({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-[#FFF5F5] transition-colors">
      <div>
        <div className="text-sm font-medium text-[#E85D5D]">{label}</div>
        {desc && <div className="text-xs text-[#A0A0B0] mt-0.5">{desc}</div>}
      </div>
      <ChevronLeft size={16} className="text-[#E85D5D]/30 rotate-180" />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="text-sm font-medium text-[#2D2D3A]">{label}</div>
      <div className="text-sm text-[#A0A0B0]">{value}</div>
    </div>
  );
}
