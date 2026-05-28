"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type ReviewData = {
  id: string;
  rating: number;
  moderatedText: string | null;
  createdAt: string;
  teacherReply: string | null;
  isAnomalous: boolean;
};

type AIParameter = {
  name: string;
  score: number;
  reason: string;
};

type TeacherProfile = {
  id: string;
  name: string;
  department: string;
  image: string | null;
  totalReviews: number;
  averageRating: number;
  reviews: ReviewData[];
  parameters: AIParameter[] | null;
};

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.teacherId as string;
  
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingParams, setGeneratingParams] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData();
    }
  }, [teacherId]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      // 1. Fetch teacher basic info & reviews
      const reviewsRes = await fetch(`/api/reviews?teacherId=${teacherId}`);
      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
      const reviewsData = await reviewsRes.json();
      
      // We also need the teacher's info. Let's fetch it from the leaderboard API or a specific user API.
      // Since we don't have a specific GET user API right now that includes all info in one shot for students,
      // we can fetch the leaderboard and find the teacher.
      const lbRes = await fetch("/api/leaderboard?period=all");
      let teacherInfo = null;
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        teacherInfo = lbData.leaderboard.find((t: any) => t.id === teacherId);
      }

      if (!teacherInfo) {
        router.push("/dashboard");
        return;
      }

      setProfile({
        id: teacherInfo.id,
        name: teacherInfo.name,
        department: teacherInfo.department,
        image: teacherInfo.image,
        totalReviews: teacherInfo.totalReviews,
        averageRating: teacherInfo.averageRating,
        reviews: reviewsData.reviews,
        parameters: null
      });

      // 2. Fetch or generate AI parameters in the background
      fetchAIParameters(teacherId);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIParameters = async (id: string) => {
    setGeneratingParams(true);
    try {
      const res = await fetch(`/api/teacher/parameters?teacherId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => prev ? { ...prev, parameters: data.parameters } : null);
      }
    } catch (e) {
      console.error("Failed to load parameters", e);
    } finally {
      setGeneratingParams(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!profile) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Leaderboard
      </Link>

      {/* Header Profile */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-4xl shrink-0 border-4 border-white shadow-md overflow-hidden">
          {profile.image ? (
            <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            "👨‍🏫"
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-slate-900">{profile.name}</h1>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-2">{profile.department}</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <div className="text-4xl font-black text-slate-900">{profile.averageRating}<span className="text-xl text-slate-400">/5</span></div>
          <span className="text-sm font-bold text-slate-500">{profile.totalReviews} student reviews</span>
        </div>
      </div>

      {/* AI Parameters */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-blue-600">✨</span> AIRA AI Analysis
        </h2>
        
        {generatingParams ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-slate-700">AI is analyzing feedback...</h3>
            <p className="text-sm text-slate-500">Extracting key teaching parameters from student reviews.</p>
          </div>
        ) : profile.parameters && profile.parameters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.parameters.map((param, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-slate-800">{param.name}</h3>
                  <div className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-sm font-bold text-slate-900">
                    {param.score}/5
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(param.score / 5) * 100}%` }}></div>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{param.reason}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 border-dashed">
            <p className="text-sm font-medium text-slate-500">Not enough data to generate AI parameters yet.</p>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Student Reviews</h2>
        {profile.reviews.length === 0 ? (
           <p className="text-slate-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.reviews.map((r, idx) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-sm ${star <= r.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-slate-700 font-medium leading-relaxed">
                  &ldquo;{r.moderatedText || "Review pending moderation"}&rdquo;
                </p>

                {r.teacherReply && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative">
                      <div className="absolute -left-1.5 top-6 w-3 h-3 bg-blue-100 rotate-45 border-l border-b border-blue-200"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-[10px]">👨‍🏫</span>
                        <span className="text-xs font-bold text-blue-800">Teacher's Reply</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 ml-7">{r.teacherReply}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
