"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function KycVerificationCard({ currentStatus }: { currentStatus: string }) {
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (currentStatus === "APPROVED") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !semester || !file) return;

    // Client-side image validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only image files are accepted (JPG, PNG, WebP). Please upload a photo of your ID card.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }

    setLoading(true);
    try {
      // Compress image heavily using Canvas before uploading
      const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800; // Resize to max 800px width for ID cards
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get canvas context");
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Compress to JPEG with 70% quality (usually results in 50kb-100kb)
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            resolve(compressedBase64);
          };
          img.onerror = (err) => reject(err);
        });
      };

      const base64Compressed = await compressImage(file);

      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          semester,
          fileUrl: base64Compressed, // Send the tiny compressed image
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "API failed");
      }
      
      alert("Student Verification Submitted Successfully! Waiting for Admin Approval.");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message || "Failed to submit verification");
      alert(error.message || "Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-blue-200 rounded-3xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Verification Required</h2>
      </div>

      {currentStatus === "PENDING" ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl font-medium">
          <p>Your ID card is currently under review by the admin team.</p>
          <p className="text-sm mt-1 opacity-80">You will unlock full access once approved. Please check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            {currentStatus === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl font-medium mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <h3 className="font-bold">Verification Rejected</h3>
                </div>
                <p className="text-sm opacity-90">
                  Your previous ID card photo was rejected by the admin. Please upload a <strong>better, clearer photo</strong> of your college ID card to proceed.
                </p>
              </div>
            )}
            
            <p className="text-slate-600 mb-4 leading-relaxed">
              To unlock <strong className="text-blue-700">Teacher Reviews</strong> and <strong className="text-blue-700">Semester Notes</strong>, we require a quick verification. 
              This prevents spam and ensures the integrity of the platform.
            </p>
            <p className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg">
              Your feedback remains 100% anonymous mathematically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-bold text-slate-700">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm">
                  <option value="">Select Dept...</option>
                  <option value="COMPUTER">Computer Eng</option>
                  <option value="CIVIL">Civil Eng</option>
                  <option value="ARCHITECTURE">Architecture</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-32">
                <label className="text-sm font-bold text-slate-700">Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm">
                  <option value="">Sem...</option>
                  {[1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Upload ID Card</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              <span className="text-xs text-slate-400 font-medium">Only images accepted (JPG, PNG, WebP) · Max 5MB</span>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-70 mt-2">
              {loading ? "Uploading..." : "Submit for Verification"}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
