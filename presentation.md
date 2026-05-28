# Presentation: Anonymous Teacher Feedback System (MBMAN)

*Here is the complete content structure for your college presentation slides, including a dedicated section to help you defend your project against cross-examination questions from teachers.*

---

## Slide 1: Introduction
**Title:** AI-Powered Anonymous Teacher Feedback System
**Subtitle:** Fostering Constructive Growth at MBMAN
**Concept:** A secure, zero-linkage platform that bridges the communication gap between students and teachers by allowing verified students to provide 100% anonymous, AI-sanitized feedback.

---

## Slide 2: Core Objectives
1. **Absolute Anonymity:** Provide a safe space for students to review teachers without fear of bias or academic retaliation.
2. **KYC Security:** Ensure that only verified, enrolled college students can access the system by enforcing a mandatory ID card approval workflow.
3. **Spam Prevention:** Allow exactly one review per student, per teacher, per day without tracking the student's identity.
4. **Constructive Intelligence:** Use AI to automatically filter out toxicity, profanity, and pure frustration, translating raw reviews into professional, actionable summaries for teachers.

---

## Slide 3: Tools & Technologies
- **Frontend & Backend Framework:** **Next.js** (App Router)
- **Database Hosting:** **Supabase** (PostgreSQL)
- **Database ORM:** **Prisma 7** (with `@prisma/adapter-pg` connection pooling)
- **Authentication:** **NextAuth.js** (Google OAuth & Custom OTP Registration)
- **AI Engine:** **Google Gemini** (Gemini 3.1 Flash Lite)
- **Automation:** **Vercel Cron Jobs** & **Facebook Messenger Graph API** (for automated daily summary delivery)

---

## Slide 4: Programming Languages
- **TypeScript:** The primary language for the entire full-stack application, chosen to enforce strict type safety and eliminate runtime bugs.
- **CSS Modules:** Used for modular, scoped UI styling to prevent CSS conflicts across different dashboard components.
- **SQL:** The underlying database language used by Prisma to manage the relational PostgreSQL schema.

---

## Slide 5: Expected Output & Workflow
1. **Registration:** Student registers via OTP or Google OAuth.
2. **Verification:** Student uploads their college ID (KYC). Admin reviews and approves it.
3. **Feedback Submission:** Verified student selects a teacher, gives a 1-10 rating, and types raw feedback.
4. **AI Processing:** The system intercepts the text, strips toxicity, and stores a professional summary.
5. **Delivery:** The teacher logs into their dashboard to view aggregated insights, or receives a compiled daily summary directly to their Facebook Messenger at 9 PM.

---
---

## Slide 6: Defense Q&A (How to answer cross-questions)

If the teachers or external examiners cross-question you, here is exactly how to defend your technical decisions:

**Q1: "Why did you use Next.js instead of a separate React frontend and Node.js backend?"**
> **Your Answer:** "Next.js provides a unified full-stack architecture. By having the API routes and the frontend React components in the exact same repository, we drastically reduced deployment complexity and API latency. It also gave us out-of-the-box Server-Side Rendering (SSR) which makes the initial dashboard load incredibly fast."

**Q2: "You claim the system is 100% anonymous. But if it's anonymous, how do you prevent a student from spamming 100 negative reviews on the same teacher?"**
> **Your Answer:** "We implemented a cryptographic concept called 'Zero-Linkage'. When a student submits a review, we never save their Student ID. Instead, the backend generates an `HMAC_SHA256` hash combining the `StudentID + TeacherID + CurrentDate` and a highly guarded `SERVER_SECRET`. We only store this resulting hash. If the student tries to submit again today, the mathematical hash collides, and the database automatically rejects it. Because it is a one-way cryptographic hash, even if a database administrator looks at the table, it is mathematically impossible to reverse the hash to figure out which student wrote the review."

**Q3: "Why did you use PostgreSQL instead of MongoDB (NoSQL)?"**
> **Your Answer:** "Our system requires strict relational integrity. For example, a User relates to a KYC Document, a Session, and Verification Tokens. PostgreSQL is an ACID-compliant relational database, which means it handles these complex relations much safer and cleaner than a NoSQL document store like MongoDB."

**Q4: "What happens if the Gemini AI API goes down or you hit a rate limit while a student is submitting a review? Does the app crash?"**
> **Your Answer:** "No, we anticipated that risk. We built a custom 'AI Key-Pooling Manager' in the backend. We loaded 43 different Gemini API keys into our environment variables. When the backend makes an AI request, it runs inside a retry loop. If one key throws a `429 Too Many Requests` error, the system catches it, instantly rotates to the next API key in the pool, and retries seamlessly without the user ever noticing."

**Q5: "Why do you need OTP for registration if you already have Google Login?"**
> **Your Answer:** "Google Login is convenient, but not every student uses a Gmail address (some might use custom or Yahoo emails). The custom OTP pipeline guarantees that we verify the ownership of *any* email address provided before allowing them to enter the KYC phase, ensuring the platform remains secure and spam-free."
