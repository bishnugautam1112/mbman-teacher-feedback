"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/frontend/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(true);
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className={`flex flex-col font-sans min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. STARTING LANDING PAGE (Hero Section Fold) */}
      <div className={`relative min-h-screen flex flex-col overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a1120]' : 'bg-blue-50/30'}`}>
        
        {/* Uncropped Background Image (Only in this top section) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/mbman-landing.jpg" 
            alt="MBMAN Background" 
            fill 
            className={`object-cover md:object-contain object-center transition-opacity duration-500 ${isDark ? 'opacity-80' : 'opacity-100'}`}
            priority
          />
          {/* Semi-transparent overlay */}
          <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-slate-900/50' : 'bg-white/40'}`}></div>
          {/* Gradient fade out to bottom */}
          <div className={`absolute inset-x-0 bottom-0 h-40 transition-colors duration-500 ${isDark ? 'bg-gradient-to-t from-slate-900 to-transparent' : 'bg-gradient-to-t from-slate-50 to-transparent'}`}></div>
        </div>

        {/* Header (Glassmorphism) */}
        <header className={`relative z-50 flex items-center justify-between p-4 md:px-8 backdrop-blur-md shadow-sm transition-colors duration-500 ${isDark ? 'bg-slate-900/40 border-b border-white/10' : 'bg-white/70 border-b border-slate-200/50'}`}>
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
              <h2 className={`text-xl md:text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent tracking-tight leading-none drop-shadow-sm transition-colors duration-500 ${isDark ? 'from-blue-400 to-indigo-400' : 'from-blue-700 to-indigo-600'}`}>
                MBMAN
              </h2>
              <span className={`text-[0.65rem] md:text-[0.7rem] font-bold uppercase tracking-widest mt-1 transition-colors duration-500 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Feedback System
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-3 md:gap-6 font-semibold">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${isDark ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.svg key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </motion.svg>
                ) : (
                  <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.32a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.415l-.707-.708a1 1 0 010-1.414zm3.78 4.68a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-2.32 4.22a1 1 0 010 1.415l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-2.32a1 1 0 01-1.415 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.415zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm2.32-4.22a1 1 0 010-1.415l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.415 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd"></path>
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
            <Link href="/" className={`hidden md:block transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-700'}`}>Home</Link>
            <Link href="#features" className={`hidden md:block transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-700'}`}>Features</Link>
            {status === "loading" ? (
              <div className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold text-slate-500">...</div>
            ) : status === "authenticated" ? (
              <Link href={(session?.user as any)?.role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}>
                <button className={`relative overflow-hidden text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base shadow-md transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]'}`}>
                  <span className="relative z-10">Dashboard</span>
                </button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <button className={`relative overflow-hidden text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base shadow-md transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]'}`}>
                  <span className="relative z-10">Login / Sign Up</span>
                </button>
              </Link>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-6xl mx-auto relative z-10 w-full">
          <motion.div initial="hidden" animate="visible" variants={itemVariants} className={`inline-flex items-center gap-3 px-5 py-2 rounded-full backdrop-blur-md shadow-lg mb-8 text-sm font-bold transition-all duration-500 ${isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white/60 border border-slate-200 text-slate-700 hover:shadow-md'}`}>
            <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Re-imagining Academic Feedback
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.1 }} className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 transition-colors duration-500 ${isDark ? 'text-white drop-shadow-xl' : 'text-slate-900'}`}>
            Empower Your Teachers.<br className="hidden md:block" />
            <span className={`block mt-2 md:mt-0 md:inline bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-500 ${isDark ? 'from-blue-400 to-indigo-400 drop-shadow-md' : 'from-blue-800 to-indigo-900 drop-shadow-sm'}`}>
              Shape the Future.
            </span>
          </motion.h1>
          
          <motion.p initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.2 }} className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium transition-colors duration-500 ${isDark ? 'text-slate-300 drop-shadow-sm' : 'text-black font-semibold'}`}>
            The Madan Bhandari Memorial Academy Nepal introduces a 100% anonymous 
            Teacher Feedback System. Constructive criticism for weaknesses, 
            heartfelt appreciation for dedication. Your identity is mathematically secure.
          </motion.p>
          
          <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto justify-center">
            {status === "loading" ? (
              <div className={`w-full sm:w-64 h-16 rounded-2xl animate-pulse ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            ) : status === "authenticated" ? (
              <Link href={(session?.user as any)?.role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"} className="w-full sm:w-auto">
                <button className={`w-full sm:w-auto group relative text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-md ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]'}`}>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <button className={`w-full sm:w-auto group relative text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-md ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]'}`}>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Give Feedback Now
                </button>
              </Link>
            )}
          </motion.div>
        </main>
      </div>

      {/* 2. THE STORY SECTION */}
      <div className={`w-full py-24 relative transition-colors duration-500 ${isDark ? 'bg-slate-900 border-b border-white/5' : 'bg-white/50 border-y border-white/60 backdrop-blur-sm'}`}>
        <div className={`absolute top-0 left-1/4 w-1/2 h-[300px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-blue-600/10' : 'hidden'}`}></div>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-left">
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-6 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bridging the gap between students and educators.</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-8" />
            <p className={`text-lg leading-relaxed font-medium mb-6 transition-colors duration-500 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Historically, students hesitate to provide honest feedback due to fear of academic retaliation or awkwardness. On the other hand, teachers are often unaware of the specific areas where they can improve their instructional delivery.
            </p>
            <p className={`text-lg leading-relaxed font-medium transition-colors duration-500 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              We built this system to solve that. By mathematically guaranteeing anonymity and using AI to filter out pure toxicity, we create a safe channel where <strong className={`font-bold transition-colors duration-500 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>honesty becomes constructive growth.</strong>
            </p>
          </div>
          <div className={`flex-1 relative w-full h-[350px] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? 'border-2 border-white/10' : 'border-[6px] border-white/80'}`}>
            <Image 
              src="/classroom.jpg" 
              alt="MBMAN Classroom" 
              fill 
              className="object-cover" 
            />
          </div>
        </div>
      </div>

      {/* 3. WORKFLOW PIPELINE */}
      <div className={`w-full py-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a1120]' : 'bg-transparent'}`}>
        <div className="max-w-5xl mx-auto px-6 text-left relative z-10">
          <h2 className={`text-3xl font-extrabold mb-16 text-center transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>How the magic happens</h2>
          
          <div className="flex flex-col md:flex-row gap-8 justify-between relative">
            {/* Connecting Line */}
            <div className={`hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] -z-10 transition-colors duration-500 ${isDark ? 'bg-slate-800' : 'bg-blue-100'}`} />

            {/* Step 1 */}
            <div className={`flex-1 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-900/80 border border-white/10' : 'bg-white border border-white shadow-blue-900/5'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner transition-colors duration-500 ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>1. You Submit</h3>
              <p className={`text-center text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Raw feedback is securely hashed. Identity is stripped.</p>
            </div>

            {/* Step 2 */}
            <div className={`flex-1 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-900/80 border border-white/10' : 'bg-white border border-white shadow-blue-900/5'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner transition-colors duration-500 ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 122.88 119.35"><path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/></svg>
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>2. AI Moderates</h3>
              <p className={`text-center text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Hate speech is removed. Constructive points are retained.</p>
            </div>

            {/* Step 3 */}
            <div className={`flex-1 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-900/80 border border-white/10' : 'bg-white border border-white shadow-blue-900/5'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner transition-colors duration-500 ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Teacher Learns</h3>
              <p className={`text-center text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Actionable summaries appear on the teacher's dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FEATURES GRID */}
      <div id="features" className={`w-full py-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-50 border-t border-slate-200'}`}>
        <div className={`absolute bottom-0 right-1/4 w-1/2 h-[300px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-purple-600/10' : 'hidden'}`}></div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left relative z-10">
          <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-800/50 border border-white/10 hover:border-blue-400/50' : 'bg-white/70 border border-white hover:border-blue-100 hover:shadow-xl'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-500 ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100/80 text-blue-600'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>100% Anonymous</h3>
            <p className={`leading-relaxed text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Through advanced cryptographic hashing, your identity is never linked to your feedback. Not even the developers can see who you are.
            </p>
          </div>
          
          <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-800/50 border border-white/10 hover:border-indigo-400/50' : 'bg-white/70 border border-white hover:border-indigo-100 hover:shadow-xl'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-500 ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100/80 text-indigo-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 122.88 119.35"><path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Powered</h3>
            <p className={`leading-relaxed text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Feedback is securely sanitized into professional summaries using Advanced AI, filtering hate-speech while preserving the core message.
            </p>
          </div>
          
          <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-300 ${isDark ? 'bg-slate-800/50 border border-white/10 hover:border-purple-400/50' : 'bg-white/70 border border-white hover:border-purple-100 hover:shadow-xl'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-500 ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100/80 text-purple-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 122.88 121.57"><path d="M120.4,90.14a2,2,0,0,1,.93,1.68v27.76a2,2,0,0,1-2,2H91.42a2,2,0,0,1-2-2V91.82A2,2,0,0,1,90.57,90a10.28,10.28,0,0,0,5.71,5.24,11.26,11.26,0,0,0,4.34.76A10.91,10.91,0,0,0,105,95l.41-.2c.36.19.74.36,1.12.52a11.31,11.31,0,0,0,9-.32,9.93,9.93,0,0,0,4.85-4.86ZM76,4.18a4.15,4.15,0,0,1,7.15,4.2c-1.75,3-10.52,18.8-12.16,20V40.17h0V61.91c.47,5.65-8.62,6.09-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.37,5.8-8.63,5.75-8.63,0V40.17h0V28.51C50.25,27.37,41.41,11.37,39.65,8.38a4.14,4.14,0,1,1,7.14-4.2l8.56,14.56a67.1,67.1,0,0,1,12.11,0L76,4.18ZM104.68,21.8a7.79,7.79,0,0,1,7.79,7.79c0,4.31-2.87,7.8-7.18,7.8s-8.41-3.49-8.41-7.8a7.8,7.8,0,0,1,7.8-7.79ZM115,51.15V85.42c.47,5.65-8.63,6.08-8.63,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.62,5.74-8.62,0V51.15H94.41v13.6c0,4.32-6.54,4.32-6.54,0V49.5c0-3.77,1.28-6.46,3.6-8.21,4-3,23.81-3,27.81,0,2.32,1.75,3.61,4.41,3.6,8.21V64.75c0,4.32-6.55,4.32-6.55,0V51.15ZM16.8,14a7.8,7.8,0,0,1,7.8,7.79c0,4.31-2.87,7.8-7.18,7.8S9,26.14,9,21.83A7.79,7.79,0,0,1,16.8,14ZM27.07,43.39V77.66c.47,5.65-8.62,6.08-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.63,5.74-8.63,0V43.39H6.54V57C6.54,61.31,0,61.31,0,57V41.74C0,38,1.27,35.28,3.6,33.53c4-3,23.81-3,27.8,0C33.72,35.28,35,37.94,35,41.74V57c0,4.32-6.55,4.32-6.55,0V43.39ZM60.74,0a7.79,7.79,0,0,1,5.82,2.61,8.25,8.25,0,0,1,.76,9.68,6.84,6.84,0,0,1-6,3.3,8.77,8.77,0,0,1-5.54-2A7.49,7.49,0,0,1,55.41,2.1,7.79,7.79,0,0,1,60.74,0Zm44.55,116.64a8.32,8.32,0,0,1-3.4-.66,5.58,5.58,0,0,1-2.33-1.83,4.4,4.4,0,0,1-.86-2.68h4.44a1.36,1.36,0,0,0,.29.84,1.81,1.81,0,0,0,.77.57,2.85,2.85,0,0,0,1.13.21,2.48,2.48,0,0,0,1.08-.22,1.81,1.81,0,0,0,.73-.6,1.59,1.59,0,0,0,.25-.89,1.3,1.3,0,0,0-.3-.87,1.87,1.87,0,0,0-.85-.6,3.47,3.47,0,0,0-1.26-.21h-1.65v-3H105a3,3,0,0,0,1.16-.21,1.84,1.84,0,0,0,.78-.6,1.39,1.39,0,0,0,.28-.87,1.47,1.47,0,0,0-.23-.84,1.67,1.67,0,0,0-.66-.57,2.2,2.2,0,0,0-1-.2,2.67,2.67,0,0,0-1.08.21,1.82,1.82,0,0,0-.74.59,1.58,1.58,0,0,0-.28.87H99a4.44,4.44,0,0,1,.82-2.63,5.39,5.39,0,0,1,2.23-1.79,8.55,8.55,0,0,1,6.44,0,5.36,5.36,0,0,1,2.17,1.68,4,4,0,0,1,.77,2.44,2.85,2.85,0,0,1-.93,2.23,4.06,4.06,0,0,1-2.4,1v.13a4.78,4.78,0,0,1,3,1.2,3.3,3.3,0,0,1,1,2.48,4,4,0,0,1-.85,2.53,5.68,5.68,0,0,1-2.39,1.72,9,9,0,0,1-3.52.63Zm-93.86-6.3v-3.17l6.06-5a12.44,12.44,0,0,0,1-.94,3.82,3.82,0,0,0,.67-.9,2.27,2.27,0,0,0,.23-1,2.09,2.09,0,0,0-.26-1.07,1.82,1.82,0,0,0-.74-.69,2.53,2.53,0,0,0-2.15,0,1.75,1.75,0,0,0-.72.73,2.38,2.38,0,0,0-.25,1.15H11.11a5.52,5.52,0,0,1,.77-3,5,5,0,0,1,2.17-1.9,7.55,7.55,0,0,1,3.29-.67,8.37,8.37,0,0,1,3.39.63,5,5,0,0,1,2.21,1.75,4.49,4.49,0,0,1,.78,2.63,4.7,4.7,0,0,1-.39,1.86,7.71,7.71,0,0,1-1.4,2,27.48,27.48,0,0,1-2.86,2.66l-1.52,1.27v.09h6.34v3.52Zm54-28.52V98.06H61.06V85.88H61L57.41,88V84.27l4-2.45ZM33.2,80.25a2,2,0,0,1,.26,1v38.35a2,2,0,0,1-2,2H3.54a2,2,0,0,1-2-2V81.23A2,2,0,0,1,2,80a10.1,10.1,0,0,0,6.44,7.5,11,11,0,0,0,4.34.76,10.91,10.91,0,0,0,4.42-1l.41-.2c.36.19.73.36,1.11.52a11.39,11.39,0,0,0,9-.31,9.81,9.81,0,0,0,5.52-7Zm44-16a1.91,1.91,0,0,1,.21.89v54.43a2,2,0,0,1-2,2H47.48a2,2,0,0,1-2-2V65.15A1.9,1.9,0,0,1,45.86,64a10.1,10.1,0,0,0,6.49,7.76,11.22,11.22,0,0,0,8.75-.26l.41-.21c.37.19.74.37,1.12.52a11.36,11.36,0,0,0,9-.31,9.76,9.76,0,0,0,5.57-7.24Z" /></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>Fair Leaderboards</h3>
            <p className={`leading-relaxed text-sm transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Teachers are ranked daily, weekly, and monthly based on a balanced algorithm that values both rating quality and feedback volume.
            </p>
          </div>
        </div>
      </div>
      
      {/* 5. FOOTER */}
      <Footer isDark={true} />
    </div>
  );
}
