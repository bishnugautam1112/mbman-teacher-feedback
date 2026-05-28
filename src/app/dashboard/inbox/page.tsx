"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Review = {
  id: string;
  rating: number;
  moderatedText: string;
  teacherReply: string | null;
  createdAt: string;
  teacher: {
    name: string;
    department: string;
  };
};

export default function InboxPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const savedReviewIds = JSON.parse(localStorage.getItem("myReviews") || "[]");
      
      if (savedReviewIds.length === 0) {
        setReviews([]);
        return;
      }

      const res = await fetch("/api/reviews/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: savedReviewIds }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">📬 Anonymous Inbox</h1>
        <p className="text-slate-500 font-medium mt-1">
          Track your previously submitted feedback. If a teacher replies to your review, it will appear here.
          <span className="block mt-2 text-xs font-bold bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-200">
            ⚠️ Privacy Note: To maintain strict 100% mathematical anonymity, your reviews are only stored in this specific browser's local storage. They will not sync across devices.
          </span>
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
           {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Found</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            You haven't submitted any feedback yet, or you are using a different device/browser.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">To: {review.teacher.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{review.teacher.department}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 text-lg">
                       {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-700 leading-relaxed font-medium">"{review.moderatedText}"</p>
                  
                  {/* Teacher Reply */}
                  {review.teacherReply ? (
                    <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-5 relative">
                      <div className="absolute -top-3 left-6 bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Teacher Reply
                      </div>
                      <p className="text-blue-900 font-medium leading-relaxed mt-1">
                        {review.teacherReply}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 text-sm font-medium text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      No reply from teacher yet
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
