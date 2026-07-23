import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { callGoogleAIWithRetry } from "@/backend/services/gemini";

// This route should be pinged by Vercel Cron at 9 PM daily
export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Secret for security
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Fetch all teachers who have a Facebook PSID linked
    const teachers = await prisma.user.findMany({
      where: { 
        role: "TEACHER",
        facebookPsid: { not: null } 
      }
    });

    if (teachers.length === 0) {
      return NextResponse.json({ message: "No teachers linked to Facebook." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Loop through teachers and summarize their daily feedback
    for (const teacher of teachers) {
      const dailyReviews = await prisma.review.findMany({
        where: {
          teacherId: teacher.id,
          updatedAt: { gte: today }
        }
      });

      if (dailyReviews.length === 0) continue;

      // Compile all moderated feedback into one string
      const compiledFeedback = dailyReviews.map((r: any) => `- Rating: ${r.rating}/10\n${r.moderatedText}`).join("\n\n");

      // Summarize using AIRA AI
      const prompt = `
        You are an educational assistant summarizing daily feedback for a teacher named ${teacher.name}.
        Here is all the anonymous student feedback they received today.
        Please create a highly professional, encouraging, and bulleted summary for them.
        Highlight 1) What they are doing well (Appreciation) and 2) Areas for improvement (Constructive Criticism).
        Keep it brief so it fits well in a Facebook Messenger DM.
        
        Feedback:
        ${compiledFeedback}
      `;

      const summaryText = await callGoogleAIWithRetry(prompt, "gemini-2.0-flash");

      // 4. Send to Facebook Messenger via Graph API
      await sendFacebookDM(teacher.facebookPsid!, summaryText);
    }

    return NextResponse.json({ message: "Daily summaries sent successfully" });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Failed to process cron job" }, { status: 500 });
  }
}

// Helper to send Facebook DM
async function sendFacebookDM(psid: string, text: string) {
  const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!PAGE_ACCESS_TOKEN) return;

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: psid },
      message: { text }
    })
  });
}
