# 🎓 MBMAN Anonymous Teacher Feedback System

An advanced, 100% anonymous, AI-moderated academic feedback platform built specifically for the **Madan Bhandari Memorial Academy Nepal (MBMAN)**.

---

## 🌟 Why We Built This

At many academic institutions, students hesitate to give honest feedback due to fear of retaliation, while teachers often miss out on genuine, constructive insights into their teaching methods. 

We engineered this platform to bridge that gap:
- **For Students:** A safe, mathematically anonymous space to express authentic feedback without identity tracking.
- **For Teachers:** A constructive channel where toxicity is filtered out, leaving actionable insights to help improve classroom experience.

---

## 👨‍💻 Engineering Team & Roles

Developed through dedicated collaboration by a team of four engineering students:

- **Bishnu Gautam** — *Team Lead & Full Stack Developer*
  - Overall platform architecture, NextAuth authentication flow, OTP email verification system, and Facebook Graph API webhook integrations.
- **Lalit Budhathoki** — *Backend & Database Architect*
  - PostgreSQL schema design via Prisma ORM, Zero-Linkage cryptographic anonymity hashing algorithm, and automated Vercel Cron daily summary jobs.
- **Sayuja Bhattarai** — *UI/UX Designer & Frontend Developer*
  - UI layout, responsive styling, dark/light theme engine, custom SVG assets, and overall mobile user experience.
- **Saras Shrestha** — *Frontend Developer & State Management*
  - Dynamic dashboards for Students, Teachers, and Admins, client-side state interactions, review filtering, and real-time leaderboard statistics.

---

## 🔥 Key Technical Features

### 1. 🔒 Cryptographic Zero-Linkage Anonymity
To guarantee student safety, the database **never** stores a student's ID or user reference on review records. Instead, a daily HMAC-SHA256 hash is computed using the student ID, teacher ID, and current date string (`YYYY-MM-DD`). This prevents duplicate spamming while making it mathematically impossible to trace a review back to any individual student.

### 2. 🤖 Resilient AI Moderation (Gemini Engine)
Raw student submissions pass through a multi-key pool of Google Gemini models. The AI:
- Removes profanity, vulgarity, and personal attacks.
- Preserves the student's authentic language and script (English, Devanagari, or Romanized Nepali).
- Converts toxic rants into polite, actionable feedback.
- Uses an automated 14-tier model failover hierarchy to handle rate limits seamlessly.

### 3. 📊 Weighted Faculty Leaderboard
Combines student rating scores (**70% weight**) and overall review volume (**30% weight**) to calculate fair, unbiased ranking podiums (#1, #2, #3) across daily, weekly, monthly, and all-time timeframes.

### 4. 📱 Daily Facebook Messenger Summaries
Teachers can link their account to Facebook Messenger with one click (`m.me` referral protocol). A daily Vercel Cron job synthesizes their feedback into encouraging bullet points and DMs them straight to their Facebook inbox.

### 5. 🛡️ Student KYC Verification
To prevent fake accounts, students must upload their MBMAN ID card for Admin review before submitting feedback.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 & Framer Motion |
| **Database** | PostgreSQL + Prisma ORM 7 |
| **Auth** | NextAuth.js (Credentials & Google OAuth) |
| **AI Moderation** | Google Gemini API (Multi-Key Pool) |
| **Messaging** | Meta Graph API & Nodemailer |
| **Deployment** | Vercel |

---

## 📁 Directory Structure

```text
teacher-feedback-app/
├── prisma/
│   ├── schema.prisma        # Database models (User, Review, KycDocument, etc.)
│   └── seed.ts              # Initial seed script for demo data
├── public/                  # Static assets & custom SVGs (chatbot-icon, competition-icon)
├── src/
│   ├── app/
│   │   ├── api/             # REST Endpoints (reviews, leaderboard, auth, cron, webhook)
│   │   ├── auth/            # Signin, registration, and password reset routes
│   │   ├── dashboard/       # Student/Admin dashboards & Leaderboard UI
│   │   └── teacher/         # Faculty dashboard & reply interface
│   ├── backend/
│   │   ├── auth/            # NextAuth options & security callbacks
│   │   ├── db/              # Prisma client instance
│   │   └── services/        # Anonymity, Gemini AI, Permissions & Email queues
│   └── frontend/            # Shared UI components (Footer, KycModal, Verification Cards)
└── README.md
```

---

## 🚀 Local Development Setup

Follow these steps to run the application locally:

### 1. Clone the repository
```bash
git clone https://github.com/bishnugautam1112/mbman-teacher-feedback.git
cd teacher-feedback-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root folder and add:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mbman_db"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
SERVER_SECRET="crypto-hmac-secret-key"

# Gemini API Keys (comma-separated for key rotation)
GEMINI_API_KEYS="key1,key2,key3"

# Optional Meta Messenger Webhook Keys
FB_PAGE_ACCESS_TOKEN="your-fb-page-access-token"
FB_APP_SECRET="your-fb-app-secret"
FB_VERIFY_TOKEN="your-webhook-verify-token"
NEXT_PUBLIC_FB_PAGE_ID="your-fb-page-id"
```

### 4. Push database schema & seed initial data
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License & Acknowledgments

Developed with care for the **Madan Bhandari Memorial Academy Nepal (MBMAN)** to foster open, safe, and continuous academic growth.
