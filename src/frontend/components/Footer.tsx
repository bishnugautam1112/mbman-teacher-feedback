"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer({ isDark = true }: { isDark?: boolean }) {
  const currentYear = new Date().getFullYear();

  const developers = [
    { name: "Bishnu Gautam", role: "Full Stack Developer", image: "/bishnu.jpg" },
    { name: "Sayuja Bhattarai", role: "UI/UX Designer", image: "/sayuja.jpg" },
    { name: "Saras Shrestha", role: "Frontend Developer", image: "/saras.jpg" },
    { name: "Lalit Budhathoki", role: "Backend Architect", image: "/lalit.png" },
  ];

  return (
    <footer className={`font-sans relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-600 border-t border-slate-200'}`}>
      
      {/* Ambient background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 ${isDark ? 'bg-blue-600/10' : 'hidden'}`}></div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        
        {/* Top CTA Banner */}
        <div className={`border rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md relative overflow-hidden group transition-colors duration-500 ${isDark ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-xl shadow-blue-900/5'}`}>
          <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-[0.03]'}`}></div>
          <div className="relative z-10 text-center md:text-left">
            <h3 className={`text-3xl md:text-4xl font-black tracking-tight mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to shape the future?</h3>
            <p className={`font-medium text-lg transition-colors duration-500 ${isDark ? 'text-blue-200/80' : 'text-blue-600'}`}>Join the 100% anonymous feedback revolution today.</p>
          </div>
          <Link href="/auth/signin" className="relative z-10">
            <button className={`px-8 py-4 rounded-full font-bold transition-all hover:scale-105 duration-300 ${isDark ? 'bg-white text-blue-900 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]' : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl'}`}>
              Get Started Now
            </button>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`p-2 rounded-xl transition-colors duration-500 ${isDark ? 'bg-white' : 'bg-slate-900'}`}>
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <h2 className={`text-xl font-black tracking-tight leading-none mb-1 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>MBMAN</h2>
                <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">Feedback Portal</p>
              </div>
            </Link>
            <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Following the footsteps envisioned by Late Madan Kumar Bhandari. An initiative to bridge the gap between students and educators through absolute anonymity.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://www.facebook.com/mbmanepal" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border hover:-translate-y-1 ${isDark ? 'bg-slate-800/50 text-slate-400 hover:bg-blue-600 hover:text-white border-white/5 hover:border-transparent' : 'bg-slate-200/50 text-slate-500 hover:bg-blue-600 hover:text-white border-slate-300 hover:border-transparent'}`}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col */}
          <div className="lg:pl-8">
            <h4 className={`font-bold mb-6 flex items-center gap-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Platform
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              {['Home', 'Leaderboard', 'Review Teachers', 'Semester Notes'].map((link) => (
                <li key={link}>
                  <Link href="#" className={`transition-colors flex items-center gap-2 group ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}>
                    <span className="text-blue-500/0 group-hover:text-blue-500 transition-colors">→</span> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className={`font-bold mb-6 flex items-center gap-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Contact Info
            </h4>
            <ul className={`flex flex-col gap-5 text-sm font-medium transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <li className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 shrink-0 transition-colors duration-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Urlabari-3, Morang, Koshi Province, Nepal
              </li>
              <li className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 shrink-0 transition-colors duration-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +977 21-410023
              </li>
              <li className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 shrink-0 transition-colors duration-500 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="break-all">mbmanteacherfeedbacksystem@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Special Dev Col */}
          <div className={`lg:col-span-1 p-6 rounded-2xl border relative group overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-800/30 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isDark ? 'from-blue-500/10 to-transparent' : 'from-blue-500/5 to-transparent'}`}></div>
            <h4 className={`font-bold mb-2 flex items-center gap-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <svg className="w-4 h-4 text-rose-500 animate-pulse fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              The Engineering Team
            </h4>
            <p className={`text-xs mb-6 font-medium transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Proudly engineered by the 2023 BE Comp Batch</p>
            
            <div className="flex flex-col gap-3">
              {developers.map((dev) => (
                <div key={dev.name} className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-default ${isDark ? 'hover:bg-white/5' : 'hover:bg-white'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border relative overflow-hidden shadow-sm transition-colors duration-500 ${isDark ? 'bg-blue-900/50 border-blue-500/20 shadow-blue-500/20' : 'bg-blue-100 border-blue-200 shadow-blue-200'}`}>
                    <Image src={dev.image} alt={dev.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold transition-colors duration-500 ${isDark ? 'text-blue-200' : 'text-slate-700'}`}>{dev.name}</h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{dev.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <p className="text-xs text-slate-500 font-medium">
            © {currentYear} Madan Bhandari Memorial Academy Nepal. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link href="/privacy" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Privacy Policy</Link>
            <Link href="/terms" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
