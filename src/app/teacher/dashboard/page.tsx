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
  teacherReply: string | null;
  isAnomalous: boolean;
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
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "recent" | "best" | "critical">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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
        if (settingsData.teacher?.receiveDailySummary !== undefined) {
          setDailySummaryEnabled(settingsData.teacher.receiveDailySummary);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDailySummary = async () => {
    setIsToggling(true);
    const newValue = !dailySummaryEnabled;
    try {
      const res = await fetch("/api/teacher/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiveDailySummary: newValue })
      });
      if (res.ok) {
        setDailySummaryEnabled(newValue);
      }
    } catch (error) {
      console.error("Failed to toggle setting", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch("/api/teacher/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, replyContent }),
      });
      if (res.ok) {
        const { review } = await res.json();
        // Update local state
        setReviews(reviews.map((r: any) => r.id === reviewId ? { ...r, teacherReply: review.teacherReply } : r));
        setReplyingTo(null);
        setReplyContent("");
      } else {
        alert("Failed to submit reply");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting reply");
    } finally {
      setIsSubmittingReply(false);
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Overview
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
                <div className="absolute -right-4 -top-4 text-slate-200/50 group-hover:scale-110 transition-transform">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
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
                <div className="absolute -right-4 -top-4 text-slate-200/50 group-hover:scale-110 transition-transform">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
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
                <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform pointer-events-none">
                  <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 122.88 121.57"><path d="M120.4,90.14a2,2,0,0,1,.93,1.68v27.76a2,2,0,0,1-2,2H91.42a2,2,0,0,1-2-2V91.82A2,2,0,0,1,90.57,90a10.28,10.28,0,0,0,5.71,5.24,11.26,11.26,0,0,0,4.34.76A10.91,10.91,0,0,0,105,95l.41-.2c.36.19.74.36,1.12.52a11.31,11.31,0,0,0,9-.32,9.93,9.93,0,0,0,4.85-4.86ZM76,4.18a4.15,4.15,0,0,1,7.15,4.2c-1.75,3-10.52,18.8-12.16,20V40.17h0V61.91c.47,5.65-8.62,6.09-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.37,5.8-8.63,5.75-8.63,0V40.17h0V28.51C50.25,27.37,41.41,11.37,39.65,8.38a4.14,4.14,0,1,1,7.14-4.2l8.56,14.56a67.1,67.1,0,0,1,12.11,0L76,4.18ZM104.68,21.8a7.79,7.79,0,0,1,7.79,7.79c0,4.31-2.87,7.8-7.18,7.8s-8.41-3.49-8.41-7.8a7.8,7.8,0,0,1,7.8-7.79ZM115,51.15V85.42c.47,5.65-8.63,6.08-8.63,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.62,5.74-8.62,0V51.15H94.41v13.6c0,4.32-6.54,4.32-6.54,0V49.5c0-3.77,1.28-6.46,3.6-8.21,4-3,23.81-3,27.81,0,2.32,1.75,3.61,4.41,3.6,8.21V64.75c0,4.32-6.55,4.32-6.55,0V51.15ZM16.8,14a7.8,7.8,0,0,1,7.8,7.79c0,4.31-2.87,7.8-7.18,7.8S9,26.14,9,21.83A7.79,7.79,0,0,1,16.8,14ZM27.07,43.39V77.66c.47,5.65-8.62,6.08-8.62,0v-18a2.92,2.92,0,0,1-1.78,0v18c.38,5.8-8.63,5.74-8.63,0V43.39H6.54V57C6.54,61.31,0,61.31,0,57V41.74C0,38,1.27,35.28,3.6,33.53c4-3,23.81-3,27.8,0C33.72,35.28,35,37.94,35,41.74V57c0,4.32-6.55,4.32-6.55,0V43.39ZM60.74,0a7.79,7.79,0,0,1,5.82,2.61,8.25,8.25,0,0,1,.76,9.68,6.84,6.84,0,0,1-6,3.3,8.77,8.77,0,0,1-5.54-2A7.49,7.49,0,0,1,55.41,2.1,7.79,7.79,0,0,1,60.74,0Zm44.55,116.64a8.32,8.32,0,0,1-3.4-.66,5.58,5.58,0,0,1-2.33-1.83,4.4,4.4,0,0,1-.86-2.68h4.44a1.36,1.36,0,0,0,.29.84,1.81,1.81,0,0,0,.77.57,2.85,2.85,0,0,0,1.13.21,2.48,2.48,0,0,0,1.08-.22,1.81,1.81,0,0,0,.73-.6,1.59,1.59,0,0,0,.25-.89,1.3,1.3,0,0,0-.3-.87,1.87,1.87,0,0,0-.85-.6,3.47,3.47,0,0,0-1.26-.21h-1.65v-3H105a3,3,0,0,0,1.16-.21,1.84,1.84,0,0,0,.78-.6,1.39,1.39,0,0,0,.28-.87,1.47,1.47,0,0,0-.23-.84,1.67,1.67,0,0,0-.66-.57,2.2,2.2,0,0,0-1-.2,2.67,2.67,0,0,0-1.08.21,1.82,1.82,0,0,0-.74.59,1.58,1.58,0,0,0-.28.87H99a4.44,4.44,0,0,1,.82-2.63,5.39,5.39,0,0,1,2.23-1.79,8.55,8.55,0,0,1,6.44,0,5.36,5.36,0,0,1,2.17,1.68,4,4,0,0,1,.77,2.44,2.85,2.85,0,0,1-.93,2.23,4.06,4.06,0,0,1-2.4,1v.13a4.78,4.78,0,0,1,3,1.2,3.3,3.3,0,0,1,1,2.48,4,4,0,0,1-.85,2.53,5.68,5.68,0,0,1-2.39,1.72,9,9,0,0,1-3.52.63Zm-93.86-6.3v-3.17l6.06-5a12.44,12.44,0,0,0,1-.94,3.82,3.82,0,0,0,.67-.9,2.27,2.27,0,0,0,.23-1,2.09,2.09,0,0,0-.26-1.07,1.82,1.82,0,0,0-.74-.69,2.53,2.53,0,0,0-2.15,0,1.75,1.75,0,0,0-.72.73,2.38,2.38,0,0,0-.25,1.15H11.11a5.52,5.52,0,0,1,.77-3,5,5,0,0,1,2.17-1.9,7.55,7.55,0,0,1,3.29-.67,8.37,8.37,0,0,1,3.39.63,5,5,0,0,1,2.21,1.75,4.49,4.49,0,0,1,.78,2.63,4.7,4.7,0,0,1-.39,1.86,7.71,7.71,0,0,1-1.4,2,27.48,27.48,0,0,1-2.86,2.66l-1.52,1.27v.09h6.34v3.52Zm54-28.52V98.06H61.06V85.88H61L57.41,88V84.27l4-2.45ZM33.2,80.25a2,2,0,0,1,.26,1v38.35a2,2,0,0,1-2,2H3.54a2,2,0,0,1-2-2V81.23A2,2,0,0,1,2,80a10.1,10.1,0,0,0,6.44,7.5,11,11,0,0,0,4.34.76,10.91,10.91,0,0,0,4.42-1l.41-.2c.36.19.73.36,1.11.52a11.39,11.39,0,0,0,9-.31,9.81,9.81,0,0,0,5.52-7Zm44-16a1.91,1.91,0,0,1,.21.89v54.43a2,2,0,0,1-2,2H47.48a2,2,0,0,1-2-2V65.15A1.9,1.9,0,0,1,45.86,64a10.1,10.1,0,0,0,6.49,7.76,11.22,11.22,0,0,0,8.75-.26l.41-.21c.37.19.74.37,1.12.52a11.36,11.36,0,0,0,9-.31,9.76,9.76,0,0,0,5.57-7.24Z" /></svg>
                </div>
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
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">AI Daily Summaries</h3>
                  <p className="text-sm text-slate-500 font-medium">Get your moderated feedback summaries delivered straight to your Facebook Messenger every day.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {fbSubscribed ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${dailySummaryEnabled ? 'text-slate-700' : 'text-slate-400'}`}>
                        {dailySummaryEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button 
                        onClick={handleToggleDailySummary}
                        disabled={isToggling}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${dailySummaryEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dailySummaryEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm rounded-xl flex items-center gap-1.5 whitespace-nowrap">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Linked
                    </div>
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
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">
                {activeFilter === "critical"
                  ? "No Critical Feedback"
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
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredReviews.map((fb, idx) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid flex flex-col h-fit"
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
                  <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-blue-500 pl-4 py-1 mb-4 bg-blue-50/30 rounded-r-lg">
                    &ldquo;{fb.moderatedText || "Feedback submitted (pending AI moderation)"}&rdquo;
                  </p>
                  
                  {fb.teacherReply ? (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Your Reply
                        </span>
                        <p className="text-sm font-medium text-slate-800">{fb.teacherReply}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      {replyingTo === fb.id ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="flex flex-col gap-3"
                        >
                          <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a constructive and encouraging reply..."
                            className="w-full text-sm p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all font-medium"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors"
                              disabled={isSubmittingReply}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleReply(fb.id)}
                              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] rounded-xl disabled:opacity-50 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                              disabled={isSubmittingReply || !replyContent.trim()}
                            >
                              {isSubmittingReply ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                  Send Reply
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => { setReplyingTo(fb.id); setReplyContent(""); }}
                          className="w-full py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-100/50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Reply to Student
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100/50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      AI Sanitized
                    </span>
                    <span>ID: {fb.id.slice(-6).toUpperCase()}</span>
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
