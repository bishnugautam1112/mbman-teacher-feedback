"use client";

import { useState } from "react";
import styles from "./KycModal.module.css";
import { useRouter } from "next/navigation";

export default function KycModal({ currentStatus }: { currentStatus: string }) {
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (currentStatus === "APPROVED") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !file) return;

    setLoading(true);
    try {
      // In a real app, you would upload the file to Supabase Storage/Cloudinary here,
      // get the secure URL, and send it to the API.
      // For now, we simulate this.
      await new Promise((r) => setTimeout(r, 1500));
      
      const formData = new FormData();
      formData.append("department", department);
      formData.append("file", file);

      // Simulate API call to save KYC
      // await fetch("/api/kyc", { method: "POST", body: formData });

      // After success, we force a refresh so the session updates (in a real scenario)
      alert("KYC Submitted Successfully! Waiting for Admin Approval.");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.trustBadge}>
          <svg className="w-3.5 h-3.5 inline-block mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Safe & Secured
        </div>
        <h2>Student Verification Required</h2>
        
        {currentStatus === "PENDING" ? (
          <div className={styles.pendingState}>
            <p>Your ID card is currently under review by the admin team.</p>
            <p>Please check back later.</p>
          </div>
        ) : (
          <>
            <p className={styles.description}>
              To prevent spam and ensure the integrity of the feedback, we require a quick verification. 
              <strong> Your feedback remains 100% anonymous.</strong> We only use this to confirm you are a student.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Department</label>
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className={styles.input}
                >
                  <option value="">Select Department...</option>
                  <option value="COMPUTER">Computer Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="ARCHITECTURE">Architecture</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Upload ID Card / Admit Card</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className={styles.fileInput}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Uploading..." : "Submit Verification"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
