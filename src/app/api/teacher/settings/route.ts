import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";

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
        facebookUrl: true,
        receiveDailySummary: true
      }
    });

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("Failed to fetch teacher settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    if (typeof body.receiveDailySummary !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedTeacher = await prisma.user.update({
      where: { id: userId },
      data: { receiveDailySummary: body.receiveDailySummary },
      select: { receiveDailySummary: true }
    });

    return NextResponse.json({ success: true, receiveDailySummary: updatedTeacher.receiveDailySummary });
  } catch (error) {
    console.error("Failed to fetch teacher settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
