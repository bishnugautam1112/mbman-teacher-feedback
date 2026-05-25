import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiManager, callGoogleAIWithRetry } from "@/lib/gemini";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return false;
  }
  return true;
}

/**
 * GET /api/admin/gemini-health
 * Pings the AIRA AI backend to verify liveness.
 * Returns pool size and status.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const stats = geminiManager.getHealthStats();

  let liveStatus = "UNKNOWN";
  let latencyMs: number | null = null;
  let responseSnippet: string | null = null;
  let errorMessage: string | null = null;

  try {
    const start = Date.now();
    const response = await callGoogleAIWithRetry("Reply with exactly: GEMINI_OK", undefined, 2);
    latencyMs = Date.now() - start;
    responseSnippet = response.substring(0, 100);

    if (response.includes("GEMINI_OK") || response.includes("OK")) {
      liveStatus = "LIVE";
    } else {
      liveStatus = "DEGRADED";
    }
  } catch (error: any) {
    liveStatus = "DOWN";
    errorMessage = error.message || "Unknown error";
  }

  return NextResponse.json({
    status: liveStatus,
    totalKeys: stats.totalKeys,
    currentKeyIndex: stats.currentIndex,
    latencyMs,
    responseSnippet,
    errorMessage,
    checkedAt: new Date().toISOString(),
  });
}
