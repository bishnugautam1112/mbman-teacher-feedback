"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type ReviewData = {
  id: string;
  rating: number;
  moderatedText: string | null;
  studentBatchYear: number | null;
  createdAt: string;
};

type Stats = {
  totalReviews: number;
  averageRating: number;
};

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReviews: 0, averageRating: 0 });
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fbSubscribed, setFbSubscribed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "recent" | "best" | "critical">("all");

  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && user?.role !== "TEACHER")) {
      router.push("/auth/signin");
    } else if (status === "authenticated" && user?.role === "TEACHER") {
      fetchDashboardData();
    }
  }, [status, user?.role, user?.id, router]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch reviews for this teacher
      const reviewsRes = await fetch(`/api/reviews?teacherId=${user.id}`);
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { totalReviews: 0, averageRating: 0 });
      }

      // Fetch leaderboard to get rank
      const leaderboardRes = await fetch("/api/leaderboard?period=all");
      if (leaderboardRes.ok) {
        const lbData = await leaderboardRes.json();
        const myRank = lbData.leaderboard.find((t: any) => t.id === user.id);
        if (myRank) {
          setRank(myRank.rank);
        }
      }

      // Fetch teacher specific settings (like Facebook PSID status)
      const settingsRes = await fetch("/api/teacher/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.teacher?.facebookPsid) {
          setFbSubscribed(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) >= weekAgo;
    }
    if (activeFilter === "best") return r.rating >= 4;
    if (activeFilter === "critical") return r.rating <= 2;
    return true;
  });

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  if (status === "loading" || !user || user.role !== "TEACHER") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="MBMAN Logo" className="h-10 w-10 object-contain bg-white rounded-lg p-1" />
            <div className="font-black text-2xl tracking-tight text-white leading-none mt-1">
              MBMAN
              <span className="text-blue-500 text-[10px] block tracking-[0.2em] uppercase mt-1">Faculty</span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20">
            📊 Overview
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col">
            <span className="text-sm font-bold text-white truncate">{user?.name || "Teacher"}</span>
            <span className="text-xs font-bold text-blue-400 tracking-wider mt-1">{user?.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-3 text-xs bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-2 rounded-lg font-bold transition-colors w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MBMAN Logo" className="h-8 w-8 object-contain bg-white rounded flex-shrink-0 p-0.5" />
            <div className="font-black text-xl text-white">MBMAN <span className="text-blue-500 text-sm">Faculty</span></div>
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-bold text-slate-300">Sign Out</button>
        </div>

        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Professor.</h1>
            <p className="text-slate-500 font-medium mt-1">
              {loading
                ? "Loading your feedback data..."
                : stats.totalReviews > 0
                ? `You have ${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""} from your students.`
                : "No reviews yet. Your students haven't submitted feedback yet."}
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
                  <div className="h-10 bg-slate-100 rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">⭐</div>
                <span className="text-slate-500 font-bold text-sm mb-2">Average Rating</span>
                <div className="text-4xl font-black text-slate-900">
                  {stats.averageRating}
                  <span className="text-lg text-slate-400 ml-1">/ 5.0</span>
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= Math.round(stats.averageRating) ? "text-amber-400" : "text-slate-200"}`}>★</span>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📝</div>
                <span className="text-slate-500 font-bold text-sm mb-2">Total Reviews</span>
                <div className="text-4xl font-black text-slate-900">{stats.totalReviews}</div>
                <span className="text-sm font-semibold text-slate-400 mt-2">
                  {reviews.filter((r) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(r.createdAt) >= weekAgo;
                  }).length} this week
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-md flex flex-col relative overflow-hidden text-white group"
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform">🏆</div>
                <span className="text-blue-100 font-bold text-sm mb-2">Current Rank</span>
                <div className="text-4xl font-black">
                  {rank ? `#${rank}` : "—"}
                  <span className="text-lg text-blue-200 font-medium tracking-wide ml-2">in Faculty</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Facebook Subscription Banner */}
          {!loading && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  💬
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">AIRA AI Daily Summaries</h3>
                  <p className="text-sm text-slate-500 font-medium">Get your moderated feedback summaries delivered straight to your Facebook Messenger every day.</p>
                </div>
              </div>
              
              {fbSubscribed ? (
                <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm rounded-xl flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Subscribed
                </div>
              ) : (
                <a 
                  href={`https://m.me/${process.env.NEXT_PUBLIC_FB_PAGE_ID || "100000000000000"}?ref=${user?.id}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Subscribe on Messenger
                </a>
              )}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-slate-900">Anonymous Feedback</h2>
            <div className="flex gap-2">
              {([
                { key: "all", label: "All" },
                { key: "recent", label: "Recent" },
                { key: "best", label: "Best" },
                { key: "critical", label: "Critical" },
              ] as { key: typeof activeFilter; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === f.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-4xl mb-3">
                {activeFilter === "critical" ? "🎉" : "📭"}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                {activeFilter === "critical"
                  ? "No Critical Feedback!"
                  : activeFilter === "recent"
                  ? "No Recent Reviews"
                  : "No Reviews Yet"}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {activeFilter === "critical"
                  ? "Great job! None of your reviews have a rating below 3."
                  : "Reviews will appear here once students submit feedback."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredReviews.map((fb, idx) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= fb.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                      ))}
                      <span className="ml-2 text-sm font-bold text-slate-700">{fb.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {fb.studentBatchYear && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          Batch {fb.studentBatchYear}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {formatTimeAgo(fb.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    &ldquo;{fb.moderatedText || "Feedback submitted (pending AIRA AI moderation)"}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <span className="bg-emerald-100 p-1 rounded-full">✨</span> AIRA AI Sanitized & Verified
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
