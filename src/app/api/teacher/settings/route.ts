import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        facebookPsid: true,
        facebookUrl: true
      }
    });

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("Failed to fetch teacher settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
