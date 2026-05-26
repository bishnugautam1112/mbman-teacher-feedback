# MBMAN Teacher Feedback System: Architecture Document

This document outlines the core architecture of the anonymous teacher feedback platform, focusing on the newly implemented authentication flows, the "zero-linkage" anonymity model, and the AI moderation pipeline.

## 1. Authentication & Registration Architecture

The application uses **NextAuth.js** paired with a **Prisma PostgreSQL** database to handle secure user sessions. We employ a dual-strategy authentication system:

### A. The OTP Registration Flow (Custom)
To ensure that only valid students can create accounts while preventing spam, we use a custom OTP (One-Time Password) registration pipeline.

1. **Request (`/api/auth/send-otp`)**: The user submits their Name, Email, and Password on the Register tab. The server verifies the email is not already registered.
2. **OTP Generation**: A 6-digit OTP is generated, hashed, and stored in the `VerificationToken` table with a 5-minute expiration.
3. **Delivery**: Nodemailer dispatches the OTP to the student's email.
4. **Verification (`/api/auth/register`)**: The user submits the OTP. The server verifies the token against the database.
5. **Account Creation**: If valid, the password is cryptographically hashed using `bcryptjs`, the user is saved to the `User` table, and the OTP is destroyed.
6. **Auto-Login**: The frontend immediately calls NextAuth's `signIn("credentials")` to establish a session cookie.

### B. Login & Google OAuth (NextAuth)
- **Traditional Login**: Uses the NextAuth `CredentialsProvider`. It takes the email and password, hashes the input via `bcrypt.compare`, and matches it against the database.
- **Google OAuth**: Users can bypass OTP registration entirely by clicking "Continue with Google". NextAuth automatically verifies their Google Email and creates a `User` record (with `password: null`).

> **Solving the "Not Matching" Problem:**
> If a user registers via Google, they do not have a password. If they later try to use the traditional "Login" tab, the system will reject them because they are required to click "Continue with Google". Conversely, if they register via OTP, they must use the Email/Password login. This strict separation prevents account hijacking.

## 2. Zero-Linkage Database Anonymity
The core requirement of this platform is **100% student anonymity**. We achieve this using a "Zero-Linkage" relational model.

- When a student submits a review, their `studentId` is **never** saved to the `Review` table.
- **Duplicate Prevention**: We generate a cryptographic `dailyHash` using the formula: `HMAC_SHA256(studentId + teacherId + currentDate, SERVER_SECRET)`.
- This hash is saved to the database. If the student tries to review the same teacher on the same day, the hash will collide, and the database will reject it. Because hashing is a one-way mathematical function, no admin or database leak can ever reverse the hash to find out which student submitted the review.

## 3. KYC Verification Pipeline
To prevent outsiders from reviewing teachers, all accounts default to the `STUDENT` role with a `KYC = PENDING` status.
- Students must upload a photo of their MBMAN College ID card.
- A background layout wrapper (`KycModal`) intercepts all dashboard navigation if the session token reads `kycStatus !== APPROVED`.
- An Admin must manually approve the ID card in the Admin Panel before the student is allowed to view or submit reviews.

## 4. AI Moderation & Automated Delivery (Cron)
- **Real-time Sanitization**: When raw feedback is submitted, it is intercepted by a backend worker. Using a 43-key rotating Google Gemini pool, the AI strips out profanity and summarizes the feedback into professional, constructive bullet points.
- **Daily Summaries**: A Vercel Cron Job automatically pings `/api/cron/daily-summary` every night at 9 PM. The server compiles all sanitized reviews for that day and uses the Facebook Graph API to directly DM the summary to the respective teacher's Messenger account.
