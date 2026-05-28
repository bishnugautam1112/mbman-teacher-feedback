import Link from "next/link";
import { motion } from "framer-motion";

export const metadata = {
  title: "Terms of Service | MBMAN Teacher Feedback",
  description: "Terms of service and user agreement for the MBMAN Teacher Feedback System.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/" className="text-blue-600 font-semibold hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              By accessing and using the Madan Bhandari Memorial Academy Nepal (MBMAN) Teacher Feedback System, 
              you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-blue-800 font-medium">
                <strong>Project Status:</strong> This platform is a 6th-semester academic project developed by Computer Engineering students, conducted under the approval and supervision of the MBMAN College Administration.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. User Conduct</h2>
            <p className="text-slate-600 leading-relaxed mb-2">
              The purpose of this platform is to provide constructive feedback to educators. While your identity remains completely anonymous, 
              all submissions are processed through our AI moderation engine (AIRA).
            </p>
            <ul className="list-disc pl-6 mt-2 text-slate-600 space-y-1">
              <li>You agree not to use hate speech, profanity, or discriminatory language.</li>
              <li>You agree not to submit false, misleading, or malicious reviews.</li>
              <li>You understand that repeatedly violating these rules may result in your IP or account being restricted from the platform.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Anonymity Guarantee</h2>
            <p className="text-slate-600 leading-relaxed">
              We employ a "Zero-Linkage" cryptographic hashing system. Once your feedback is submitted, the system mathematically disconnects 
              your identity from the review. MBMAN administration and developers cannot reverse this process to uncover your identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Platform Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              The MBMAN administration reserves the right to modify, suspend, or discontinue the platform at any time without notice. 
              We also reserve the right to remove feedback that circumvents our AI filters or violates our community guidelines.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              For any questions regarding these Terms of Service, please contact us at: <br />
              <a href="mailto:Mbmanteacherfeedbacksystem@gmail.com" className="text-blue-600 hover:underline">Mbmanteacherfeedbacksystem@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
