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
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
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
