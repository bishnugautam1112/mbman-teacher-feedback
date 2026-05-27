# AIRA - Academic Feedback System (MBMAN)

Welcome to the official repository for **AIRA**, an advanced, 100% anonymous Teacher Feedback System developed for the Manmohan Memorial Polytechnic (MBMAN). 

This project was built over 12 days of dedicated hard work and collaboration to solve a critical issue: allowing students to submit honest academic feedback without fear of retaliation, while protecting educators from toxic or abusive language.

---

## 👥 The Engineering Team

This system was architected and developed by a dedicated team of four engineering students:

- **Bishnu Gautam** - *Team Lead & Full Stack Developer*
  - Led the overall system architecture, implemented NextAuth authentication flows, built the custom OTP email verification system, and designed the Facebook Graph API webhook integration.
- **Lalit Budhathoki** - *Backend & Database Architect*
  - Designed the robust PostgreSQL database schema using Prisma ORM, engineered the secure "Zero-Linkage" anonymity model, and built the automated Vercel Cron jobs for daily AI summaries.
- **Sayuja Bhattarai** - *UI/UX Designer & Frontend Developer*
  - Designed the premium dark-mode landing page, global application layouts, and responsive CSS styling, ensuring the platform feels modern, intuitive, and highly accessible on mobile devices.
- **Saras Shrestha** - *Frontend Developer & State Management*
  - Built the dynamic React dashboards for Students, Teachers, and Admins. Managed complex client-side state, filter interactions, and integrated real-time leaderboard statistics.

---

## 🚀 Key Features

1. **Absolute Anonymity (Zero-Linkage Database Design)**
   - To guarantee student safety, the database *never* records which student submitted a review. 
   - Instead, we use a complex cryptographic hash combining the Student ID, Teacher ID, and the current date. This prevents duplicate spam while making it mathematically impossible to trace a review back to a student.

2. **Automated AI Moderation (Google Gemini)**
   - Raw feedback is passed through a rotating pool of 43 Google Gemini API keys. The AI strips profanity and hate speech, summarizing the emotional intent into constructive, professional bullet points before the teacher ever sees it.

3. **Facebook Messenger Integration**
   - Teachers do not need to constantly check the dashboard. They can subscribe via their Facebook account, and a secure backend webhook will automatically DM them their sanitized feedback summaries every single night.

4. **Multi-Role Dashboards & KYC**
   - **Students:** Can view teacher leaderboards and submit feedback, but only after an Admin approves their uploaded MBMAN ID Card (KYC Verification).
   - **Teachers:** Have a personalized dashboard to view ratings, trends, and subscribe to notifications.
   - **Admins:** Can moderate users, approve KYC requests, and oversee platform health.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted via Supabase connection pooling)
- **ORM:** Prisma
- **Styling:** Tailwind CSS & Framer Motion (for micro-animations)
- **Authentication:** NextAuth.js (Credentials & Google OAuth)
- **AI Engine:** Google Gemini Pro
- **Email Delivery:** Nodemailer (for OTPs)
- **Deployment:** Vercel

---

## 💻 Local Setup Instructions

If you are an evaluator or developer looking to run this project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bishnugautam1112/mbman-teacher-feedback.git
   cd teacher-feedback-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the necessary keys (Database URL, NextAuth Secret, Gemini API Keys). *Note: Secrets are kept strictly confidential by the team.*

4. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

*Dedicated to improving the academic ecosystem at MBMAN through transparency, safety, and constructive communication.*
