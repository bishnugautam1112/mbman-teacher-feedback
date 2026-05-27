import Link from "next/link";
import { motion } from "framer-motion";

export const metadata = {
  title: "Privacy Policy | MBMAN Teacher Feedback",
  description: "Privacy policy and terms of service for the MBMAN Teacher Feedback System.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/" className="text-blue-600 font-semibold hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Welcome to the Madan Bhandari Memorial Academy Nepal (MBMAN) Teacher Feedback System. 
              We are committed to protecting your personal information and your right to privacy. 
              This privacy policy applies to all information collected through our website (https://mbman-teacher-feedback.vercel.app).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-2">
              <strong>Personal Information Provided by You:</strong> When you register or log in using Google OAuth, 
              we collect your email address, name, and profile picture. We only allow logins from `@gmail.com` and `@mbman.edu.np` domains.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Zero-Linkage Anonymity:</strong> To protect student identities, any feedback submitted is cryptographically hashed. 
              Your student ID is never directly linked to your submitted reviews in our database.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We use your information solely for:
            </p>
            <ul className="list-disc pl-6 mt-2 text-slate-600 space-y-1">
              <li>Authenticating your identity within the MBMAN ecosystem.</li>
              <li>Preventing spam and duplicate feedback submissions.</li>
              <li>Sending necessary administrative emails (e.g., OTPs, notifications).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Sharing of Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We do not sell, trade, or rent your personal identification information to others. 
              All feedback presented to teachers is heavily moderated by our AI engine (AIRA) to remove hate speech 
              and is summarized anonymously.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions or comments about this policy, you may email us at: <br />
              <a href="mailto:Mbmanteacherfeedbacksystem@gmail.com" className="text-blue-600 hover:underline">Mbmanteacherfeedbacksystem@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
