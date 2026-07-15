"use client";

import { useState } from "react";

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

export default function LoginModal({ isOpen, onClose, onLogin, onRegister, onForgotPassword }: LoginModalProps) {
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
    // 发送验证码
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
    // 简单的人机验证模拟
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 标题 */}
        <h2 className="text-xl font-semibold text-center mb-6">
          {view === "login" ? "登录" : view === "register" ? "注册" : "忘记密码"}
        </h2>

        {/* 登录表单 */}
        {view === "login" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Aria号"
              value={ariaId}
              onChange={(e) => setAriaId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              登录
            </button>
            <div className="flex justify-between text-sm">
              <button onClick={() => { resetForm(); setView("register"); }} className="text-indigo-500">
                注册账号
              </button>
              <button onClick={() => { resetForm(); setView("forgot"); }} className="text-gray-400">
                忘记密码？
              </button>
            </div>
          </div>
        )}

        {/* 注册表单 */}
        {view === "register" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="用户名（昵称）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            
            {/* 人机验证 */}
            <div
              onClick={handleCaptchaClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                captchaVerified ? "bg-green-50 border border-green-200" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                captchaVerified ? "border-green-500 bg-green-500" : "border-gray-300"
              }`}>
                {captchaVerified && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{captchaVerified ? "验证通过" : "点击完成人机验证"}</span>
            </div>

            {/* 验证码 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="邮箱验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSendCode}
                disabled={countdown > 0 || !email}
                className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>

            <button
              onClick={handleRegister}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              注册
            </button>
            <button onClick={() => { resetForm(); setView("login"); }} className="w-full text-sm text-indigo-500">
              已有账号？去登录
            </button>
          </div>
        )}

        {/* 忘记密码 */}
        {view === "forgot" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">输入绑定的邮箱，我们将发送重置链接</p>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleForgotPassword}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              发送重置邮件
            </button>
            <button onClick={() => { resetForm(); setView("login"); }} className="w-full text-sm text-indigo-500">
              返回登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
