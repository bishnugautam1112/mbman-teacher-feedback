"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Teacher = {
  id: string;
  name: string | null;
  department: string | null;
  image: string | null;
};

export default function TeacherListClient({ teachers }: { teachers: Teacher[] }) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0) return setError("Please select a star rating.");
    if (feedback.trim().length < 10) return setError("Feedback must be at least 10 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher?.id,
          rating,
          rawContent: feedback
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setSuccess(data.message);
      
      // Save reviewId to localStorage for the Anonymous Inbox
      if (data.reviewId) {
        const savedReviews = JSON.parse(localStorage.getItem("myReviews") || "[]");
        if (!savedReviews.includes(data.reviewId)) {
          savedReviews.push(data.reviewId);
          localStorage.setItem("myReviews", JSON.stringify(savedReviews));
        }
      }

      // Reset form
      setTimeout(() => {
        setSelectedTeacher(null);
        setRating(0);
        setFeedback("");
        setSuccess("");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Teacher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {teachers.map(t => (
          <div 
            key={t.id} 
            onClick={() => setSelectedTeacher(t)}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${selectedTeacher?.id === t.id ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 overflow-hidden shadow-sm border border-slate-200">
              {t.image ? (
                <img src={t.image} alt={t.name || "Teacher"} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-lg truncate">{t.name || "Unknown"}</h3>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.department || "Faculty"}</span>
          </div>
        ))}
      </div>

      {/* Review Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedTeacher && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-6 md:p-8 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Review {selectedTeacher.name || "Teacher"}</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Your identity is completely hidden.</p>
                </div>
                <button onClick={() => setSelectedTeacher(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                  ✕
                </button>
              </div>

              {success ? (
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center border border-emerald-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Feedback Submitted!</h3>
                  <p className="text-sm font-medium">{success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200">{error}</div>}
                  
                  {/* Star Rating */}
                  <div className="flex flex-col gap-2 items-center">
                    <span className="text-sm font-bold text-slate-700">Overall Rating</span>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          <span className={`${star <= (hoverRating || rating) ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'} transition-colors`}>★</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Detailed Feedback</label>
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What are their strengths? What can they improve? Be honest and constructive."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none h-32"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? "Encrypting & Submitting..." : "Submit Anonymous Review"}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
