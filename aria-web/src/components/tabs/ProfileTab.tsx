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
  CalendarCheck,
  Trophy,
  LogOut,
} from "lucide-react";

interface ProfileTabProps {
  isLoggedIn: boolean;
  userInfo: any;
  onLogin: () => void;
  onLogout: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function ProfileTab({ isLoggedIn, userInfo, onLogin, onLogout }: ProfileTabProps) {
  const router = useRouter();
  const [hasPlan] = useState(false);

  const menuItems = [
    { icon: FileText, label: "我的发布", desc: "查看发布的动态", path: "/profile/posts" },
    { icon: Star, label: "我的收藏", desc: "收藏的动态和消息", path: "/profile/favorites" },
    { icon: Eye, label: "浏览记录", desc: "最近浏览的内容", path: "/profile/history" },
    { icon: Wallet, label: "我的钱包", desc: "余额和充值", path: "/profile/wallet" },
    { icon: CalendarCheck, label: "每日签到", desc: "领取积分奖励", path: "/profile/checkin" },
    { icon: Trophy, label: "成就系统", desc: "已获得3个成就", path: "/profile/achievements" },
  ];

  return (
    <motion.div
      className="p-4 space-y-4 bg-[#FFF8F5] min-h-[calc(100dvh-60px)]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={itemVariants} className="font-bold text-lg text-[#2D2D3A]">
        我的
      </motion.h1>

      {/* 用户信息卡片 */}
      {isLoggedIn ? (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#C44569] via-[#E85D75] to-[#F28C8C] rounded-[20px] p-4 text-white shadow-[0_4px_16px_rgba(232,93,117,0.25)] relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border-2 border-white/30 shadow-lg overflow-hidden">
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold truncate">
                {userInfo?.nickname || userInfo?.username || "用户"}
              </div>
              <div className="text-sm opacity-90">
                Aria号: {userInfo?.username || "未知"}
              </div>
            </div>
            <motion.button
              onClick={() => router.push("/profile/edit")}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs hover:bg-white/30 transition-colors border border-white/20"
            >
              编辑资料
            </motion.button>
          </div>
          <div className="relative flex justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold">890</div>
              <div className="text-xs opacity-80">积分</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">47</div>
              <div className="text-xs opacity-80">天数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">3</div>
              <div className="text-xs opacity-80">成就</div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#FFF0F3] to-[#FCE4EC] rounded-[20px] p-6 text-center border border-[rgba(232,93,117,0.1)]"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
          >
            <User size={32} className="text-white" />
          </motion.div>
          <p className="text-[#6B6B7B] mb-4">登录后享受更多功能</p>
          <motion.button
            onClick={onLogin}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[16px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
          >
            登录 / 注册
          </motion.button>
        </motion.div>
      )}

      {/* 套餐/会员信息 */}
      {isLoggedIn && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-[#FEF9E7] to-[#FFF5E1] rounded-[20px] border border-[#F5DEB3] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          {hasPlan ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#F7BE5E] flex items-center justify-center">
                  <Crown size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#8B6914]">会员套餐</div>
                  <div className="text-xs text-[#A0843C]">到期时间：2026-12-31</div>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F5A623] to-[#F7BE5E] text-white rounded-full text-xs font-medium shadow-[0_2px_8px_rgba(245,166,35,0.25)]"
              >
                续费
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#F7BE5E] flex items-center justify-center">
                  <Gift size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#8B6914]">开通会员套餐</div>
                  <div className="text-xs text-[#A0843C]">解锁更多功能</div>
                </div>
              </div>
              <motion.button
                onClick={() => router.push("/profile/wallet")}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F5A623] to-[#F7BE5E] text-white rounded-full text-xs font-medium shadow-[0_2px_8px_rgba(245,166,35,0.25)]"
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
        className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] overflow-hidden shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
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
              whileHover={{ backgroundColor: "rgba(232, 93, 117, 0.04)" }}
              className={`w-full flex items-center justify-between p-3.5 transition-colors ${
                i > 0 ? "border-t border-[#F8F8F8]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E85D75]/10 to-[#F28C8C]/10 flex items-center justify-center">
                  <Icon size={16} className="text-[#E85D75]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[#2D2D3A]">{item.label}</div>
                  <div className="text-[11px] text-[#A0A0B0]">{item.desc}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#DDD]" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* 设置按钮 */}
      {isLoggedIn && (
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => router.push("/settings")}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] hover:bg-[rgba(232,93,117,0.02)] transition-colors shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B6B7B]/10 to-[#999]/10 flex items-center justify-center">
              <Settings size={16} className="text-[#6B6B7B]" />
            </div>
            <span className="text-sm font-medium text-[#2D2D3A]">设置</span>
            <ChevronRight size={18} className="text-[#DDD] ml-auto" />
          </motion.button>
        </motion.div>
      )}

      {/* 退出登录 */}
      {isLoggedIn && (
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={onLogout}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 text-[#E85D5D] font-semibold bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] hover:bg-[#FFF5F5] transition-colors shadow-[0_1px_3px_rgba(45,45,58,0.06)] flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            退出登录
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
