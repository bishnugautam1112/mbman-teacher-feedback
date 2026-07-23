import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import { callGoogleAIWithRetry } from "@/backend/services/gemini";

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

    // Fetch teacher and check if parameters already exist
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { aiParameters: true, name: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check remaining reviews first
    const reviews = await prisma.review.findMany({
      where: { teacherId },
      select: { rawContent: true, rating: true },
      take: 20, // analyze up to 20 recent reviews
      orderBy: { createdAt: 'desc' }
    });

    if (reviews.length === 0) {
      if (teacher.aiParameters !== null) {
        await prisma.user.update({
          where: { id: teacherId },
          data: { aiParameters: null }
        });
      }
      return NextResponse.json({ parameters: null });
    }

    // If already generated and reviews exist, return them
    if (teacher.aiParameters) {
      return NextResponse.json({ parameters: teacher.aiParameters });
    }

    const reviewsText = reviews.map(r => `Rating: ${r.rating}/5. Comment: "${r.rawContent}"`).join("\n");

    const prompt = `
      You are an AI teaching assistant evaluator. Analyze the following student reviews for a teacher named ${teacher.name || "the teacher"}.
      Based on these reviews, generate 4 key teaching parameters (e.g., Clarity, Engagement, Helpfulness, Punctuality).
      For each parameter, provide a score out of 5.0 (can use decimals like 4.2) and a short 1-sentence explanation of why.
      
      Reviews:
      ${reviewsText}
      
      You MUST return your response as a raw JSON array of objects. Do NOT include markdown blocks like \`\`\`json.
      Example format:
      [
        {"name": "Clarity", "score": 4.5, "reason": "Most students praised the clear explanations."},
        {"name": "Punctuality", "score": 3.8, "reason": "A few students mentioned occasional late arrivals."}
      ]
    `;

    const aiResponse = await callGoogleAIWithRetry(prompt, "gemini-2.0-flash");
    
    // Clean up potential markdown formatting from AI response
    const cleanJsonStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let parameters;
    try {
      parameters = JSON.parse(cleanJsonStr);
    } catch (e) {
      console.error("Failed to parse AI parameters JSON:", cleanJsonStr);
      return NextResponse.json({ error: "AI failed to generate valid metrics" }, { status: 500 });
    }

    // Save to database
    await prisma.user.update({
      where: { id: teacherId },
      data: { aiParameters: parameters }
    });

    return NextResponse.json({ parameters });

  } catch (error) {
    console.error("Parameters Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate parameters" }, { status: 500 });
  }
}
