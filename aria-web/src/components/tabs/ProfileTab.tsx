"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ChevronRight, Crown, Gift } from "lucide-react";

interface ProfileTabProps {
  isLoggedIn: boolean;
  userInfo: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function ProfileTab({ isLoggedIn, userInfo, onLogin, onLogout }: ProfileTabProps) {
  const router = useRouter();
  const [hasPlan, setHasPlan] = useState(false); // 模拟是否有套餐

  const menuItems = [
    { icon: "📝", label: "我的发布", desc: "查看发布的动态", path: "/profile/posts" },
    { icon: "⭐", label: "我的收藏", desc: "收藏的动态和消息", path: "/profile/favorites" },
    { icon: "👀", label: "浏览记录", desc: "最近浏览的内容", path: "/profile/history" },
    { icon: "💰", label: "我的钱包", desc: "余额和充值", path: "/profile/wallet" },
    { icon: "🎁", label: "每日签到", desc: "领取积分奖励", path: "/profile/checkin" },
    { icon: "🏆", label: "成就系统", desc: "已获得3个成就", path: "/profile/achievements" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-semibold text-lg mb-4">我的</h1>

      {/* 用户信息卡片 */}
      {isLoggedIn ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">😊</div>
            <div className="flex-1">
              <div className="text-lg font-bold">{userInfo?.nickname || userInfo?.username || "用户"}</div>
              <div className="text-sm opacity-90">Aria号: {userInfo?.username || "未知"}</div>
            </div>
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-3 py-1.5 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
            >
              编辑资料
            </button>
          </div>
          <div className="flex justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold">890</div>
              <div className="text-xs opacity-80">积分</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-4">
            👤
          </div>
          <p className="text-gray-500 mb-4">登录后享受更多功能</p>
          <button
            onClick={onLogin}
            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
          >
            登录 / 注册
          </button>
        </div>
      )}

      {/* 套餐/会员信息 */}
      {isLoggedIn && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
          {hasPlan ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown size={20} className="text-amber-500" />
                <div>
                  <div className="text-sm font-medium text-amber-700">会员套餐</div>
                  <div className="text-xs text-amber-600">到期时间：2026-12-31</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs">
                续费
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift size={20} className="text-amber-500" />
                <div>
                  <div className="text-sm font-medium text-amber-700">开通会员套餐</div>
                  <div className="text-xs text-amber-600">解锁更多功能</div>
                </div>
              </div>
              <button 
                onClick={() => router.push("/profile/wallet")}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs"
              >
                查看套餐
              </button>
            </div>
          )}
        </div>
      )}

      {/* 菜单列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => {
              if (!isLoggedIn) {
                onLogin();
                return;
              }
              router.push(item.path);
            }}
            className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 ${
              i > 0 ? "border-t border-gray-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* 设置按钮 */}
      {isLoggedIn && (
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50"
        >
          <Settings size={20} className="text-gray-600" />
          <span className="text-sm font-medium">设置</span>
          <ChevronRight size={18} className="text-gray-300 ml-auto" />
        </button>
      )}

      {/* 退出登录 */}
      {isLoggedIn && (
        <button
          onClick={onLogout}
          className="w-full py-3 text-red-500 font-medium bg-white rounded-2xl border border-gray-100 hover:bg-red-50"
        >
          退出登录
        </button>
      )}
    </div>
  );
}
