"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-slate-50">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Header (Glassmorphism) */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between p-4 md:px-8 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm"
      >
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="MBMAN Logo" 
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-none">
              MBMAN
            </h2>
            <span className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-800 uppercase tracking-widest mt-1">
              Feedback System
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-3 md:gap-6 font-semibold">
          <Link href="/" className="hidden md:block text-slate-600 hover:text-blue-700 transition">Home</Link>
          <Link href="#features" className="hidden md:block text-slate-600 hover:text-blue-700 transition">Features</Link>
          {status === "loading" ? (
            <div className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold text-slate-500">...</div>
          ) : status === "authenticated" ? (
            <Link href={(session?.user as any)?.role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}>
              <button className="relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-200 ease-linear whitespace-nowrap">
                <span className="relative z-10">Dashboard</span>
              </button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <button className="relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-200 ease-linear whitespace-nowrap">
                <span className="relative z-10">Login / Sign Up</span>
              </button>
            </Link>
          )}
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-6xl mx-auto relative z-10"
      >
        
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Next-Gen Academic Feedback
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
          Empower Your Teachers.<br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Shape the Future.
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mb-12 leading-relaxed font-medium">
          The Madan Bhandari Memorial Academy Nepal introduces a 100% anonymous 
          Teacher Feedback System. Constructive criticism for weaknesses, 
          heartfelt appreciation for dedication. Your identity is mathematically secure.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto px-4 sm:px-0">
          {status === "loading" ? (
            <div className="w-full sm:w-64 h-16 rounded-2xl bg-slate-200 animate-pulse"></div>
          ) : status === "authenticated" ? (
            <Link href={(session?.user as any)?.role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group relative bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/auth/signin" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group relative bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                Give Feedback Now
              </button>
            </Link>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          id="features" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left relative z-10"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white hover:shadow-xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">100% Anonymous</h3>
            <p className="text-slate-600 leading-relaxed">
              Through advanced cryptographic hashing, your identity is never linked to your feedback. Not even the developers can see who you are.
            </p>
          </motion.div>
          
          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white hover:shadow-xl hover:border-indigo-100 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              🤖
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">AIRA Powered</h3>
            <p className="text-slate-600 leading-relaxed">
              Feedback is securely sanitized into professional summaries using Advanced AI, filtering hate-speech while preserving the core message.
            </p>
          </motion.div>
          
          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white hover:shadow-xl hover:border-purple-100 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              🏆
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Fair Leaderboards</h3>
            <p className="text-slate-600 leading-relaxed">
              Teachers are ranked daily, weekly, and monthly based on a balanced algorithm that values both rating quality and feedback volume.
            </p>
          </motion.div>
          
        </motion.div>
      </motion.main>
      
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
