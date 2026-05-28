"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const developers = [
    { name: "Bishnu Gautam", role: "Full Stack Developer", icon: "👨‍💻" },
    { name: "Sayuja Bhattarai", role: "UI/UX Designer", icon: "🎨" },
    { name: "Saras Shrestha", role: "Frontend Developer", icon: "⚡" },
    { name: "Lalit Budhathoki", role: "Backend Architect", icon: "⚙️" },
  ];

  return (
    <footer className="bg-[#0A0F1C] text-slate-300 font-sans border-t border-white/5 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        
        {/* Top CTA Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Ready to shape the future?</h3>
            <p className="text-blue-200/80 font-medium text-lg">Join the 100% anonymous feedback revolution today.</p>
          </div>
          <Link href="/auth/signin" className="relative z-10">
            <button className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all hover:scale-105 duration-300">
              Get Started Now
            </button>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white p-2 rounded-xl">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">MBMAN</h2>
                <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">Feedback Portal</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Following the footsteps envisioned by Late Madan Kumar Bhandari. An initiative to bridge the gap between students and educators through absolute anonymity.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {['FB', 'TW', 'IG', 'IN'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-xs font-bold text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-white/5 hover:border-transparent hover:-translate-y-1">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links Col */}
          <div className="lg:pl-8">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Platform
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              {['Home', 'Leaderboard', 'Review Teachers', 'Semester Notes'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="text-blue-500/0 group-hover:text-blue-500 transition-colors">→</span> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Contact Info
            </h4>
            <ul className="flex flex-col gap-5 text-sm font-medium text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">📍</span>
                Urlabari-3, Morang, Koshi Province, Nepal
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">📞</span>
                +977 21-410023
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✉️</span>
                mbmanteacherfeedbacksystem@gmail.com
              </li>
            </ul>
          </div>

          {/* Special Dev Col */}
          <div className="lg:col-span-1 bg-slate-800/30 p-6 rounded-2xl border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="animate-pulse">❤️</span> The Creators
            </h4>
            <p className="text-xs text-slate-400 mb-6 font-medium">Proudly engineered by the 2023 BE Comp Batch</p>
            
            <div className="flex flex-col gap-3">
              {developers.map((dev) => (
                <div key={dev.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-sm border border-blue-500/20">
                    {dev.icon}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-blue-200">{dev.name}</h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{dev.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © {currentYear} Madan Bhandari Memorial Academy Nepal. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
