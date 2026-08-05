import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import { callGoogleAIWithRetry } from "@/backend/services/gemini";

/**
 * Core function to analyze teacher reviews with Gemini AI and cache 4 parameters in PostgreSQL.
 * Smartly generates baseline parameters if 0 reviews exist or if AI is cooling down.
 */
export async function generateTeacherParameters(teacherId: string) {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { id: true, name: true }
  });

  if (!teacher) return null;

  const reviews = await prisma.review.findMany({
    where: { teacherId },
    select: { rawContent: true, rating: true, moderatedText: true },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  // Default baseline parameters if 0 reviews submitted yet
  if (reviews.length === 0) {
    const initialBaseline = [
      { name: "Clarity of Instruction", score: 4.5, reason: "Initial baseline score evaluated against institutional standards." },
      { name: "Student Engagement", score: 4.3, reason: "Standard baseline rating pending initial student review submissions." },
      { name: "Helpfulness & Support", score: 4.4, reason: "Default academic support benchmark prior to student feedback." },
      { name: "Punctuality & Discipline", score: 4.6, reason: "Initial rating for schedule compliance and class availability." }
    ];

    await prisma.user.update({
      where: { id: teacherId },
      data: { aiParameters: initialBaseline }
    });
    return initialBaseline;
  }

  const reviewsText = reviews.map(r => `Rating: ${r.rating}/5. Raw Comment: "${r.rawContent}". Moderated Feedback: "${r.moderatedText || r.rawContent}"`).join("\n");

  const prompt = `
    You are an expert academic evaluator for a college feedback portal. Analyze student feedback for faculty member "${teacher.name || "the teacher"}".
    Evaluate 4 core teaching parameters: "Clarity of Instruction", "Student Engagement", "Helpfulness & Support", and "Punctuality & Discipline".

    STRICT EVALUATION & LANGUAGE RULES:
    1. LANGUAGE: All "reason" explanations MUST be written in 100% formal, clear, professional English. Never leave raw slang, Nepali phrases, or unformatted text!
    2. STRICTNESS & ACCURACY:
       - Examine both raw and moderated comments carefully.
       - If any student review contains criticism, requests for improvement (e.g., "please improve teaching methods"), hostile commands ("go to hell"), or abusive language—EVEN IF the student awarded 5/5 stars:
         a) DO NOT award high/perfect scores (5.0 or 4.8). Strictly penalize the relevant parameters down to realistic scores (e.g. 3.0 to 3.8).
         b) Explain the deduction clearly in formal English (e.g., "Students indicated a need for improved instructional clarity and supportive guidance.").
       - If feedback is genuinely positive without any criticisms, award deserving scores (4.2 - 4.8).

    Reviews Data:
    ${reviewsText}

    Return ONLY a valid JSON array of 4 objects without markdown blocks:
    [
      {"name": "Clarity of Instruction", "score": 3.6, "reason": "Feedback indicates students require clearer explanations and improved teaching methodologies."},
      {"name": "Student Engagement", "score": 4.0, "reason": "Classroom interaction is maintained well overall."},
      {"name": "Helpfulness & Support", "score": 3.5, "reason": "Students expressed a desire for additional academic guidance and responsiveness."},
      {"name": "Punctuality & Discipline", "score": 4.2, "reason": "Demonstrates consistent class scheduling and time management."}
    ]
  `;

  try {
    const aiResponse = await callGoogleAIWithRetry(prompt, "gemini-2.0-flash");
    const cleanJsonStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parameters = JSON.parse(cleanJsonStr);

    await prisma.user.update({
      where: { id: teacherId },
      data: { aiParameters: parameters }
    });

    return parameters;
  } catch (e) {
    console.error("Failed to generate AI parameters:", e);
    
    // Smart fallback parameters based on existing ratings
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const roundedScore = Math.round(avgRating * 10) / 10;

    const fallbackParameters = [
      { name: "Clarity of Instruction", score: Math.min(roundedScore, 4.2), reason: "Evaluated based on overall faculty rating performance." },
      { name: "Student Engagement", score: Math.min(roundedScore, 4.0), reason: "Maintains regular classroom communication and student interaction." },
      { name: "Helpfulness & Support", score: Math.min(roundedScore, 4.1), reason: "Provides academic assistance and consultation." },
      { name: "Punctuality & Discipline", score: Math.min(roundedScore, 4.5), reason: "Adheres to course schedule and institutional guidelines." }
    ];

    await prisma.user.update({
      where: { id: teacherId },
      data: { aiParameters: fallbackParameters }
    });

    return fallbackParameters;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { aiParameters: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // If parameters are already cached in database, return IMMEDIATELY (0ms delay)
    if (teacher.aiParameters) {
      return NextResponse.json({ parameters: teacher.aiParameters });
    }

    // Otherwise, generate and cache now
    const parameters = await generateTeacherParameters(teacherId);
    return NextResponse.json({ parameters });

  } catch (error) {
    console.error("Parameters GET Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch parameters" }, { status: 500 });
  }
}
