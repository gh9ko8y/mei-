"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export default function LoginModal({ isOpen, onClose, onLogin, onRegister, onForgotPassword }: LoginModalProps) {
  const [view, setView] = useState<ModalView>("login");
  const [direction, setDirection] = useState(1);
  const [ariaId, setAriaId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const switchView = (newView: ModalView, dir: number) => {
    setDirection(dir);
    setView(newView);
  };

  const handleSendCode = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360"}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
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

  const handleLoginClick = () => {
    if (!ariaId || !password) return;
    setIsLoading(true);
    onLogin(ariaId, password);
    setIsLoading(false);
  };

  const handleRegisterClick = () => {
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

  const handleForgotClick = () => {
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
    setShowPassword(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-[8px] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-[24px] w-full max-w-sm shadow-[0_8px_24px_rgba(45,45,58,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] rounded-full" />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-4 -mt-2">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="text-[#A0A0B0] hover:text-[#6B6B7B] p-1"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="px-6 pb-6 -mt-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={view}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {view === "login" && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-[18px] font-semibold text-[#2D2D3A]">欢迎回来</h2>
                    <p className="text-xs text-[#6B6B7B] mt-1">登录你的 Aria 账号</p>
                  </div>

                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
                    <input
                      type="text"
                      placeholder="Aria号"
                      value={ariaId}
                      onChange={(e) => setAriaId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-[#6B6B7B]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <motion.button
                    onClick={handleLoginClick}
                    disabled={isLoading || !ariaId || !password}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[14px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)] hover:shadow-[0_6px_20px_rgba(232,93,117,0.35)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        登录
                      </>
                    )}
                  </motion.button>

                  <div className="flex justify-between text-sm pt-2">
                    <button
                      onClick={() => { resetForm(); switchView("register", 1); }}
                      className="text-[#E85D75] font-medium hover:underline"
                    >
                      注册账号
                    </button>
                    <button
                      onClick={() => { resetForm(); switchView("forgot", 1); }}
                      className="text-[#A0A0B0] hover:text-[#6B6B7B]"
                    >
                      忘记密码？
                    </button>
                  </div>
                </div>
              )}

              {view === "register" && (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <h2 className="text-[18px] font-semibold text-[#2D2D3A]">创建账号</h2>
                    <p className="text-xs text-[#6B6B7B] mt-1">开启你的AI伴侣之旅</p>
                  </div>

                  <input
                    type="text"
                    placeholder="用户名（昵称）"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                  />

                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
                    <input
                      type="email"
                      placeholder="邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-[#6B6B7B]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                  />

                  {/* 人机验证 */}
                  <motion.div
                    onClick={handleCaptchaClick}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[14px] cursor-pointer transition-all duration-200 ${
                      captchaVerified
                        ? "bg-[#4CAF7A]/10 border border-[#4CAF7A]/30"
                        : "bg-[#F7F7F9] hover:bg-[#F0F0F3] border border-transparent"
                    }`}
                  >
                    <motion.div
                      animate={captchaVerified ? { scale: [1, 1.2, 1] } : {}}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        captchaVerified ? "border-[#4CAF7A] bg-[#4CAF7A]" : "border-[#D1D5DB]"
                      }`}
                    >
                      {captchaVerified && (
                        <motion.svg
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.svg>
                      )}
                    </motion.div>
                    <span className={`text-sm ${captchaVerified ? "text-[#4CAF7A]" : "text-[#6B6B7B]"}`}>
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
                      className="flex-1 px-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                    <motion.button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || !email}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-[#FCE4EC] text-[#E85D75] rounded-[14px] text-sm font-semibold whitespace-nowrap disabled:opacity-40 transition-all"
                    >
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleRegisterClick}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[14px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)] transition-all duration-200"
                  >
                    注册
                  </motion.button>
                  <button
                    onClick={() => { resetForm(); switchView("login", -1); }}
                    className="w-full text-sm text-[#E85D75] font-medium hover:underline"
                  >
                    已有账号？去登录
                  </button>
                </div>
              )}

              {view === "forgot" && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-[18px] font-semibold text-[#2D2D3A]">重置密码</h2>
                    <p className="text-xs text-[#6B6B7B] mt-1">输入绑定的邮箱，我们将发送重置链接</p>
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
                    <input
                      type="email"
                      placeholder="邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                    />
                  </div>

                  <motion.button
                    onClick={handleForgotClick}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[14px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)] transition-all duration-200"
                  >
                    发送重置邮件
                  </motion.button>
                  <button
                    onClick={() => { resetForm(); switchView("login", -1); }}
                    className="w-full text-sm text-[#E85D75] font-medium hover:underline"
                  >
                    返回登录
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
