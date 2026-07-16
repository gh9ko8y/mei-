"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (aria_id: string, password: string) => void;
  onRegister: (data: RegisterData) => void;
  onForgotPassword: (email: string) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  code: string;
}

type ModalView = "login" | "register" | "forgot";

// 动画配置
const overlayVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
}: LoginModalProps) {
  const [view, setView] = useState<ModalView>("login");
  const [ariaId, setAriaId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!email) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360"}/auth/send-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.code) {
        setCodeSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (e) {
      console.error("发送验证码失败:", e);
    }
  };

  const handleCaptchaClick = () => {
    setCaptchaVerified(true);
  };

  const handleLogin = () => {
    if (!ariaId || !password) return;
    onLogin(ariaId, password);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !code) return;
    if (password !== confirmPassword) {
      alert("两次密码不一致");
      return;
    }
    if (!captchaVerified) {
      alert("请完成人机验证");
      return;
    }
    onRegister({ username, email, password, code });
  };

  const handleForgotPassword = () => {
    if (!email) return;
    onForgotPassword(email);
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setCodeSent(false);
    setCountdown(0);
    setCaptchaVerified(false);
  };

  const switchView = (newView: ModalView) => {
    resetForm();
    setView(newView);
  };

  // 输入框通用样式
  const inputClass =
    "w-full px-4 py-3 bg-[rgba(255,255,255,0.06)] rounded-[14px] text-sm outline-none text-[#E8E6E3] placeholder:text-[#5A5854] border border-[rgba(255,255,255,0.08)] transition-all duration-200 focus:border-[#D4A574] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(212,165,116,0.1)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-[12px] flex items-center justify-center z-50 p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-[#14141E] rounded-[24px] w-full max-w-sm p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] relative overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部装饰条 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4A574] to-[#C9956A]" />

            {/* 关闭按钮 */}
            <div className="flex justify-end mb-2">
              <motion.button
                onClick={onClose}
                className="text-[#5A5854] hover:text-[#8A8880] transition-colors p-1"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.25 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* 标题 */}
            <h2 className="text-[18px] font-semibold text-center mb-6 text-[#E8E6E3]">
              {view === "login"
                ? "登录"
                : view === "register"
                  ? "注册"
                  : "忘记密码"}
            </h2>

            {/* 表单内容 */}
            <AnimatePresence mode="wait">
              {/* 登录表单 */}
              {view === "login" && (
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Aria号"
                    value={ariaId}
                    onChange={(e) => setAriaId(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <motion.button
                    onClick={handleLogin}
                    className="w-full py-3 bg-gradient-to-r from-[#D4A574] to-[#C9956A] text-[#0C0C14] rounded-[14px] font-semibold text-sm shadow-[0_4px_16px_rgba(212,165,116,0.2)] hover:shadow-[0_6px_20px_rgba(212,165,116,0.3)] transition-shadow"
                    whileTap={{ scale: 0.98 }}
                  >
                    登录
                  </motion.button>
                  <div className="flex justify-between text-sm pt-1">
                    <motion.button
                      onClick={() => switchView("register")}
                      className="text-[#D4A574] font-medium hover:bg-[rgba(212,165,116,0.08)] px-2 py-1 rounded-lg transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      注册账号
                    </motion.button>
                    <motion.button
                      onClick={() => switchView("forgot")}
                      className="text-[#8A8880] hover:text-[#E8E6E3] px-2 py-1 rounded-lg transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      忘记密码？
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* 注册表单 */}
              {view === "register" && (
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="用户名（昵称）"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />

                  {/* 人机验证 */}
                  <motion.div
                    onClick={handleCaptchaClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[14px] cursor-pointer transition-all duration-200 border ${
                      captchaVerified
                        ? "bg-[rgba(107,155,154,0.08)] border-[rgba(107,155,154,0.3)]"
                        : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)]"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        captchaVerified
                          ? "border-[#6B9B9A] bg-[#6B9B9A]"
                          : "border-[#5A5854]"
                      }`}
                    >
                      {captchaVerified && (
                        <Check size={12} strokeWidth={3} className="text-white" />
                      )}
                    </div>
                    <Shield
                      size={16}
                      className={
                        captchaVerified ? "text-[#6B9B9A]" : "text-[#5A5854]"
                      }
                    />
                    <span
                      className={`text-sm ${
                        captchaVerified
                          ? "text-[#6B9B9A] font-medium"
                          : "text-[#8A8880]"
                      }`}
                    >
                      {captchaVerified ? "验证通过" : "点击完成人机验证"}
                    </span>
                  </motion.div>

                  {/* 验证码 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="邮箱验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    <motion.button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || !email}
                      className="px-4 py-3 bg-[rgba(212,165,116,0.12)] text-[#D4A574] rounded-[14px] text-sm font-semibold disabled:opacity-50 whitespace-nowrap transition-colors hover:bg-[rgba(212,165,116,0.18)] border border-[rgba(212,165,116,0.15)]"
                      whileTap={{ scale: 0.98 }}
                    >
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleRegister}
                    className="w-full py-3 bg-gradient-to-r from-[#D4A574] to-[#C9956A] text-[#0C0C14] rounded-[14px] font-semibold text-sm shadow-[0_4px_16px_rgba(212,165,116,0.2)] hover:shadow-[0_6px_20px_rgba(212,165,116,0.3)] transition-shadow"
                    whileTap={{ scale: 0.98 }}
                  >
                    注册
                  </motion.button>
                  <div className="text-center pt-1">
                    <motion.button
                      onClick={() => switchView("login")}
                      className="text-sm text-[#8A8880] font-medium hover:text-[#D4A574] hover:bg-[rgba(212,165,116,0.08)] px-3 py-1.5 rounded-lg transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      已有账号？去登录
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* 忘记密码 */}
              {view === "forgot" && (
                <motion.div
                  key="forgot"
                  variants={formVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4"
                >
                  <p className="text-[13px] text-[#8A8880] text-center leading-relaxed">
                    输入绑定的邮箱，我们将发送重置链接
                  </p>
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <motion.button
                    onClick={handleForgotPassword}
                    className="w-full py-3 bg-gradient-to-r from-[#D4A574] to-[#C9956A] text-[#0C0C14] rounded-[14px] font-semibold text-sm shadow-[0_4px_16px_rgba(212,165,116,0.2)] hover:shadow-[0_6px_20px_rgba(212,165,116,0.3)] transition-shadow"
                    whileTap={{ scale: 0.98 }}
                  >
                    发送重置邮件
                  </motion.button>
                  <div className="text-center pt-1">
                    <motion.button
                      onClick={() => switchView("login")}
                      className="text-sm text-[#8A8880] font-medium hover:text-[#D4A574] hover:bg-[rgba(212,165,116,0.08)] px-3 py-1.5 rounded-lg transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      返回登录
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}