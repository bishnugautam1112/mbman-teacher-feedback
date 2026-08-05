"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type TeacherRank = {
  id: string;
  name: string;
  department: string;
  image: string | null;
  totalReviews: number;
  averageRating: number;
  weightedScore: number;
  rank: number;
};

type Period = "daily" | "weekly" | "monthly" | "all";
type DeptFilter = "ALL" | "COMPUTER" | "CIVIL" | "ARCHITECTURE";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  all: "All Time",
};

const RANK_BADGES: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("ALL");
  const [leaderboard, setLeaderboard] = useState<TeacherRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  const fetchLeaderboard = async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and re-rank based on department selection
  const filteredLeaderboard = leaderboard
    .filter((t) => {
      if (deptFilter === "ALL") return true;
      return t.department === deptFilter || t.department === "BASIC_SCIENCE";
    })
    .map((t, index) => ({ ...t, rank: index + 1 }));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600 p-2 shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 122.88 121.57"><path d="M120.4,90.14a2,2,0,0,1,.93,1.68v27.76a2,2,0,0,1-2,2H91.42a2,2,0,0,1-2-2V91.82A2,2,0,0,1,90.57,90a10.28,10.28,0,0,0,5.71,5.24,11.26,11.26,0,0,0,4.34.76A10.91,10.91,0,0,0,105,95l.41-.2c.36.19.74.36,1.12.52a11.31,11.31,0,0,0,9-.32,9.93,9.93,0,0,0,4.85-4.86ZM76,4.18a4.15,4.15,0,0,1,7.15,4.2c-1.75,3-10.52,18.8-12.16,20V40.17h0V61.91c.47,5.65-8.62,6.09-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.37,5.8-8.63,5.75-8.63,0V40.17h0V28.51C50.25,27.37,41.41,11.37,39.65,8.38a4.14,4.14,0,1,1,7.14-4.2l8.56,14.56a67.1,67.1,0,0,1,12.11,0L76,4.18ZM104.68,21.8a7.79,7.79,0,0,1,7.79,7.79c0,4.31-2.87,7.8-7.18,7.8s-8.41-3.49-8.41-7.8a7.8,7.8,0,0,1,7.8-7.79ZM115,51.15V85.42c.47,5.65-8.63,6.08-8.63,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.62,5.74-8.62,0V51.15H94.41v13.6c0,4.32-6.54,4.32-6.54,0V49.5c0-3.77,1.28-6.46,3.6-8.21,4-3,23.81-3,27.81,0,2.32,1.75,3.61,4.41,3.6,8.21V64.75c0,4.32-6.55,4.32-6.55,0V51.15ZM16.8,14a7.8,7.8,0,0,1,7.8,7.79c0,4.31-2.87,7.8-7.18,7.8S9,26.14,9,21.83A7.79,7.79,0,0,1,16.8,14ZM27.07,43.39V77.66c.47,5.65-8.62,6.08-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.63,5.74-8.63,0V43.39H6.54V57C6.54,61.31,0,61.31,0,57V41.74C0,38,1.27,35.28,3.6,33.53c4-3,23.81-3,27.8,0C33.72,35.28,35,37.94,35,41.74V57c0,4.32-6.55,4.32-6.55,0V43.39ZM60.74,0a7.79,7.79,0,0,1,5.82,2.61,8.25,8.25,0,0,1,.76,9.68,6.84,6.84,0,0,1-6,3.3,8.77,8.77,0,0,1-5.54-2A7.49,7.49,0,0,1,55.41,2.1,7.79,7.79,0,0,1,60.74,0Zm44.55,116.64a8.32,8.32,0,0,1-3.4-.66,5.58,5.58,0,0,1-2.33-1.83,4.4,4.4,0,0,1-.86-2.68h4.44a1.36,1.36,0,0,0,.29.84,1.81,1.81,0,0,0,.77.57,2.85,2.85,0,0,0,1.13.21,2.48,2.48,0,0,0,1.08-.22,1.81,1.81,0,0,0,.73-.6,1.59,1.59,0,0,0,.25-.89,1.3,1.3,0,0,0-.3-.87,1.87,1.87,0,0,0-.85-.6,3.47,3.47,0,0,0-1.26-.21h-1.65v-3H105a3,3,0,0,0,1.16-.21,1.84,1.84,0,0,0,.78-.6,1.39,1.39,0,0,0,.28-.87,1.47,1.47,0,0,0-.23-.84,1.67,1.67,0,0,0-.66-.57,2.2,2.2,0,0,0-1-.2,2.67,2.67,0,0,0-1.08.21,1.82,1.82,0,0,0-.74.59,1.58,1.58,0,0,0-.28.87H99a4.44,4.44,0,0,1,.82-2.63,5.39,5.39,0,0,1,2.23-1.79,8.55,8.55,0,0,1,6.44,0,5.36,5.36,0,0,1,2.17,1.68,4,4,0,0,1,.77,2.44,2.85,2.85,0,0,1-.93,2.23,4.06,4.06,0,0,1-2.4,1v.13a4.78,4.78,0,0,1,3,1.2,3.3,3.3,0,0,1,1,2.48,4,4,0,0,1-.85,2.53,5.68,5.68,0,0,1-2.39,1.72,9,9,0,0,1-3.52.63Zm-93.86-6.3v-3.17l6.06-5a12.44,12.44,0,0,0,1-.94,3.82,3.82,0,0,0,.67-.9,2.27,2.27,0,0,0,.23-1,2.09,2.09,0,0,0-.26-1.07,1.82,1.82,0,0,0-.74-.69,2.53,2.53,0,0,0-2.15,0,1.75,1.75,0,0,0-.72.73,2.38,2.38,0,0,0-.25,1.15H11.11a5.52,5.52,0,0,1,.77-3,5,5,0,0,1,2.17-1.9,7.55,7.55,0,0,1,3.29-.67,8.37,8.37,0,0,1,3.39.63,5,5,0,0,1,2.21,1.75,4.49,4.49,0,0,1,.78,2.63,4.7,4.7,0,0,1-.39,1.86,7.71,7.71,0,0,1-1.4,2,27.48,27.48,0,0,1-2.86,2.66l-1.52,1.27v.09h6.34v3.52Zm54-28.52V98.06H61.06V85.88H61L57.41,88V84.27l4-2.45ZM33.2,80.25a2,2,0,0,1,.26,1v38.35a2,2,0,0,1-2,2H3.54a2,2,0,0,1-2-2V81.23A2,2,0,0,1,2,80a10.1,10.1,0,0,0,6.44,7.5,11,11,0,0,0,4.34.76,10.91,10.91,0,0,0,4.42-1l.41-.2c.36.19.73.36,1.11.52a11.39,11.39,0,0,0,9-.31,9.81,9.81,0,0,0,5.52-7Zm44-16a1.91,1.91,0,0,1,.21.89v54.43a2,2,0,0,1-2,2H47.48a2,2,0,0,1-2-2V65.15A1.9,1.9,0,0,1,45.86,64a10.1,10.1,0,0,0,6.49,7.76,11.22,11.22,0,0,0,8.75-.26l.41-.21c.37.19.74.37,1.12.52a11.36,11.36,0,0,0,9-.31,9.76,9.76,0,0,0,5.57-7.24Z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Faculty Leaderboard
          </h1>
        </div>
        <p className="text-slate-500 font-medium max-w-2xl">
          Rankings based on anonymous student feedback. Scores combine average
          rating (70%) with review volume (30%).
        </p>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              period === p
                ? "bg-blue-600 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Department Tabs */}
      {Array.from(new Set(leaderboard.filter(t => t.department !== "BASIC_SCIENCE").map(t => t.department))).length > 1 && (
        <div className="flex gap-2 mb-8 flex-wrap border-b border-slate-200 pb-4">
          {(["ALL", ...Array.from(new Set(leaderboard.filter(t => t.department !== "BASIC_SCIENCE").map(t => t.department)))] as DeptFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                deptFilter === d
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              }`}
            >
              {d === "ALL" ? "Overall" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
                <div className="h-8 bg-slate-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredLeaderboard.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            {period === "all"
              ? "No reviews have been submitted yet. Be the first to provide feedback!"
              : `No reviews found for ${PERIOD_LABELS[period].toLowerCase()}. Try selecting a different time period.`}
          </p>
        </div>
      ) : (
        /* Leaderboard List */
        <div className="flex flex-col gap-4">
          {/* Top 3 Podium */}
          {filteredLeaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {filteredLeaderboard.slice(0, 3).map((teacher, idx) => (
                <Link key={teacher.id} href={`/dashboard/leaderboard/${teacher.id}`} className={`block md:order-${idx === 0 ? '2' : idx === 1 ? '1' : '3'} ${idx === 0 ? 'md:-mt-4' : ''}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative rounded-3xl p-6 border-2 text-center overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                      idx === 0
                        ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-100/50"
                        : idx === 1
                        ? "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-300 shadow-md"
                        : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md"
                    }`}
                  >
                  {/* Rank Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                      idx === 0 ? "bg-amber-400 text-amber-950 shadow-sm" : idx === 1 ? "bg-slate-300 text-slate-800" : "bg-orange-300 text-orange-950"
                    }`}>
                      RANK #{teacher.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-slate-400 mb-3 overflow-hidden ${
                      idx === 0
                        ? "bg-amber-100 ring-4 ring-amber-300/50"
                        : idx === 1
                        ? "bg-slate-200 ring-4 ring-slate-300/50"
                        : "bg-orange-100 ring-4 ring-orange-300/50"
                    }`}
                  >
                    {teacher.image ? (
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                  </div>

                  <h3 className="font-black text-lg text-slate-900 truncate">
                    {teacher.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {teacher.department}
                  </span>

                  <div className="mt-4 flex flex-col items-center gap-1">
                    <StarDisplay rating={teacher.averageRating} />
                    <span className="text-2xl font-black text-slate-900">
                      {teacher.averageRating}
                      <span className="text-sm text-slate-400 ml-1">/ 5.0</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {teacher.totalReviews} review
                      {teacher.totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Remaining teachers (or all if < 3) */}
          <AnimatePresence>
            {filteredLeaderboard.slice(filteredLeaderboard.length >= 3 ? 3 : 0).map((teacher, idx) => (
              <Link key={teacher.id} href={`/dashboard/leaderboard/${teacher.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all group cursor-pointer"
                >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                    #{teacher.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-200">
                    {teacher.image ? (
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">
                      {teacher.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {teacher.department}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <StarDisplay rating={teacher.averageRating} />
                      <span className="text-xs font-semibold text-slate-500 mt-0.5">
                        {teacher.totalReviews} review
                        {teacher.totalReviews !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                      <div className="text-lg font-black text-slate-900">
                        {teacher.averageRating}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Rating
                      </div>
                    </div>
                  </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
