"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  ChevronRight,
  Crown,
  Gift,
  User,
  FileText,
  Star,
  Eye,
  Wallet,
  Trophy,
  LogOut,
} from "lucide-react";

interface ProfileTabProps {
  isLoggedIn: boolean;
  userInfo: any;
  onLogin: () => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: FileText, label: "我的发布", desc: "查看发布的动态", path: "/profile/posts" },
  { icon: Star, label: "我的收藏", desc: "收藏的动态和消息", path: "/profile/favorites" },
  { icon: Eye, label: "浏览记录", desc: "最近浏览的内容", path: "/profile/history" },
  { icon: Wallet, label: "我的钱包", desc: "余额和充值", path: "/profile/wallet" },
  { icon: Gift, label: "每日签到", desc: "领取积分奖励", path: "/profile/checkin" },
  { icon: Trophy, label: "成就系统", desc: "已获得3个成就", path: "/profile/achievements" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function ProfileTab({ isLoggedIn, userInfo, onLogin, onLogout }: ProfileTabProps) {
  const router = useRouter();
  const [hasPlan, setHasPlan] = useState(false);

  return (
    <motion.div
      className="p-4 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 用户信息卡片 */}
      {isLoggedIn ? (
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4 text-[#E8E6E3]"
          style={{
            background: "linear-gradient(135deg, #1A1510 0%, #141218 100%)",
            border: "1px solid rgba(212, 165, 116, 0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: "rgba(212, 165, 116, 0.3)" }}
            >
              <User size={28} className="text-[#D4A574]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-bold leading-tight">
                {userInfo?.nickname || userInfo?.username || "用户"}
              </div>
              <div className="text-[13px] text-[#8A8880] mt-0.5">
                Aria号: {userInfo?.username || "未知"}
              </div>
            </div>
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-colors shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                color: "#D4A574",
              }}
            >
              编辑资料
            </button>
          </div>
          <div
            className="flex justify-around mt-4 pt-4"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-[#D4A574]">890</div>
              <div className="text-[11px] text-[#8A8880]">积分</div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-6 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(212, 165, 116, 0.15)",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <User size={36} className="text-[#D4A574]" />
          </motion.div>
          <p className="text-[#8A8880] mb-4 text-[15px]">登录后享受更多功能</p>
          <motion.button
            onClick={onLogin}
            className="px-8 py-3 rounded-[14px] font-semibold text-[15px] text-[#0C0C14]"
            style={{
              background: "linear-gradient(135deg, #D4A574, #C9956A)",
              boxShadow: "0 4px 16px rgba(212, 165, 116, 0.25)",
            }}
            whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(212, 165, 116, 0.35)" }}
            whileTap={{ scale: 0.97 }}
          >
            登录 / 注册
          </motion.button>
        </motion.div>
      )}

      {/* 套餐/会员信息 */}
      {isLoggedIn && (
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "linear-gradient(135deg, #1A1814 0%, #141210 100%)",
            border: "1px solid #3A3020",
          }}
        >
          {hasPlan ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C4956A, #D4A574)" }}
                >
                  <Crown size={20} className="text-[#0C0C14]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#E8E6E3]">会员套餐</div>
                  <div className="text-xs text-[#8A8880]">到期时间：2026-12-31</div>
                </div>
              </div>
              <motion.button
                className="px-4 py-1.5 text-[#0C0C14] rounded-full text-xs font-medium"
                style={{ background: "linear-gradient(135deg, #D4A574, #C9956A)" }}
                whileTap={{ scale: 0.95 }}
              >
                续费
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C4956A, #D4A574)" }}
                >
                  <Gift size={20} className="text-[#0C0C14]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#E8E6E3]">开通会员套餐</div>
                  <div className="text-xs text-[#8A8880]">解锁更多功能</div>
                </div>
              </div>
              <motion.button
                onClick={() => router.push("/profile/wallet")}
                className="px-4 py-1.5 text-[#0C0C14] rounded-full text-xs font-medium"
                style={{ background: "linear-gradient(135deg, #D4A574, #C9956A)" }}
                whileTap={{ scale: 0.95 }}
              >
                查看套餐
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* 菜单列表 */}
      <motion.div
        variants={itemVariants}
        className="rounded-[20px] overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              onClick={() => {
                if (!isLoggedIn) {
                  onLogin();
                  return;
                }
                router.push(item.path);
              }}
              className="w-full flex items-center justify-between p-3.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              style={i > 0 ? { borderTop: "1px solid rgba(255, 255, 255, 0.04)" } : {}}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(212, 165, 116, 0.08)" }}
                >
                  <Icon size={16} className="text-[#D4A574]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[#E8E6E3]">{item.label}</div>
                  <div className="text-[11px] text-[#8A8880]">{item.desc}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#5A5854]" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* 设置按钮 */}
      {isLoggedIn && (
        <motion.button
          variants={itemVariants}
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-3 p-4 rounded-[20px] transition-colors hover:bg-[rgba(255,255,255,0.03)]"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
          whileTap={{ scale: 0.99 }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(212, 165, 116, 0.08)" }}
          >
            <Settings size={16} className="text-[#D4A574]" />
          </div>
          <span className="text-sm font-medium text-[#E8E6E3]">设置</span>
          <ChevronRight size={18} className="text-[#5A5854] ml-auto" />
        </motion.button>
      )}

      {/* 退出登录 */}
      {isLoggedIn && (
        <motion.button
          variants={itemVariants}
          onClick={onLogout}
          className="w-full py-3.5 font-medium rounded-[20px] text-sm flex items-center justify-center gap-2 transition-colors"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#9B5B5B",
          }}
          whileHover={{ background: "rgba(155, 91, 91, 0.05)" }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={16} />
          退出登录
        </motion.button>
      )}
    </motion.div>
  );
}