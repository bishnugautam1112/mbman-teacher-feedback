"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD";
type Step = "DETAILS" | "OTP" | "RESET_PASSWORD";

export default function SignIn() {
  const router = useRouter();
  
  const [tab, setTab] = useState<Tab>("LOGIN");
  const [step, setStep] = useState<Step>("DETAILS");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null);

  // New States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpExpiresIn !== null && otpExpiresIn > 0 && tab === "FORGOT_PASSWORD" && step !== "DETAILS") {
      interval = setInterval(() => {
        setOtpExpiresIn((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (otpExpiresIn === 0) {
      setError("Your OTP has expired. Please request a new one.");
      setStep("DETAILS");
      setOtpExpiresIn(null);
    }
    return () => clearInterval(interval);
  }, [otpExpiresIn, tab, step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", color: "transparent", width: "0%" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (score < 4) return { label: "Fair", color: "bg-amber-500", width: "66%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setError(res.error);
      else router.push("/dashboard");
    } catch (err) {
      setError("Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return setError("All fields are required.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register.");

      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setSuccess("OTP sent successfully to your email.");
      setOtpExpiresIn(3 * 60);
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setSuccess("OTP Verified. Please create a new password.");
      setOtpExpiresIn(5 * 60);
      setStep("RESET_PASSWORD");
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setSuccess("Password reset successfully. You can now login.");
      setTab("LOGIN");
      setStep("DETAILS");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpExpiresIn(null);
    } catch (err: any) {
      setError(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10"
      >
        <Link href="/" className="block mb-8 group">
          <div className="flex items-center justify-center gap-3">
            <Image src="/logo.png" alt="MBMAN Logo" width={55} height={55} className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <div className="flex flex-col">
              <h1 className="text-[1.35rem] font-black text-slate-900 leading-[1.1] tracking-tight font-sans">MADAN BHANDARI</h1>
              <p className="text-[0.65rem] font-bold text-blue-600 tracking-[1.5px] uppercase mt-1">MEMORIAL ACADEMY NEPAL</p>
            </div>
          </div>
        </Link>
        
        {tab !== "FORGOT_PASSWORD" && (
          <div className="flex w-full mb-8 border-b border-slate-200 relative">
            <button 
              className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${tab === "LOGIN" ? "text-blue-700" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => { setTab("LOGIN"); setError(""); setSuccess(""); }}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${tab === "REGISTER" ? "text-blue-700" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => { setTab("REGISTER"); setStep("DETAILS"); setError(""); setSuccess(""); }}
            >
              Register
            </button>
            {/* Animated Tab Indicator */}
            <motion.div 
              layoutId="tab-indicator"
              className="absolute bottom-[-1px] left-0 w-1/2 h-0.5 bg-blue-700"
              initial={false}
              animate={{ x: tab === "LOGIN" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl text-center font-medium">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LOGIN FLOW --- */}
        {tab === "LOGIN" && (
          <motion.form 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onSubmit={handleLogin} className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all" />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition">Remember me</span>
              </label>
              <button type="button" onClick={() => { setTab("FORGOT_PASSWORD"); setStep("DETAILS"); setError(""); setSuccess(""); }} 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-2">
              {loading ? "Authenticating..." : "Login"}
            </button>
          </motion.form>
        )}

        {/* --- REGISTER FLOW --- */}
        {tab === "REGISTER" && step === "DETAILS" && (
          <motion.form 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRegisterSendOTP} className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input type="text" placeholder="Ranchoddas Chanchad" value={name} onChange={(e) => setName(e.target.value)} required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                  <span className={`text-xs font-bold text-right ${strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Fair' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-slate-700">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
                  {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all hover:-translate-y-0.5 disabled:opacity-70 mt-2">
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </motion.form>
        )}

        {/* --- OTP & RESET FLOWS (Omitted to keep diff concise, but implemented fully) --- */}
        {(step === "OTP" || tab === "FORGOT_PASSWORD") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-5">
             <div className="text-center mb-2">
               <h3 className="text-xl font-bold text-slate-900">{tab === "FORGOT_PASSWORD" && step === "DETAILS" ? "Reset Password" : step === "OTP" ? "Check your Email" : "New Password"}</h3>
               <p className="text-sm text-slate-500 font-medium mt-2">
                 {step === "OTP" ? `We sent a 6-digit code to ${email}` : tab === "FORGOT_PASSWORD" && step === "DETAILS" ? "Enter your email to receive an OTP." : "Create a new strong password."}
               </p>
               {otpExpiresIn !== null && (
                 <p className="text-sm font-bold text-red-500 mt-2">Expires in: {formatTime(otpExpiresIn)}</p>
               )}
             </div>

             {/* Rest of inputs mapping based on state... */}
             {tab === "FORGOT_PASSWORD" && step === "DETAILS" && (
                <div className="flex flex-col gap-1.5">
                  <input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium" />
                  <button onClick={handleForgotPassword} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all mt-4">{loading ? "Sending..." : "Send Reset OTP"}</button>
                  <button onClick={() => setTab("LOGIN")} className="text-sm font-bold text-slate-500 hover:text-slate-800 mt-2">Back to Login</button>
                </div>
             )}

             {step === "OTP" && (
                <div className="flex flex-col gap-1.5">
                  <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                  <button onClick={tab === "REGISTER" ? handleVerifyRegisterOTP : handleVerifyForgotOTP} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all mt-4">{loading ? "Verifying..." : "Verify OTP"}</button>
                </div>
             )}

             {step === "RESET_PASSWORD" && (
               <div className="flex flex-col gap-4">
                 <div className="relative">
                   <input type={showPassword ? "text" : "password"} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium pr-10" />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
                     {showPassword ? "👁️" : "🙈"}
                   </button>
                 </div>
                 <div className="relative">
                   <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium pr-10" />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
                     {showConfirmPassword ? "👁️" : "🙈"}
                   </button>
                 </div>
                 <button onClick={handleResetPassword} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all mt-2">{loading ? "Resetting..." : "Reset Password"}</button>
               </div>
             )}
          </motion.div>
        )}

        {(tab === "LOGIN" || (tab === "REGISTER" && step === "DETAILS")) && (
          <>
            <div className="flex items-center justify-center my-8 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative bg-white/80 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Or</div>
            </div>
            
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
