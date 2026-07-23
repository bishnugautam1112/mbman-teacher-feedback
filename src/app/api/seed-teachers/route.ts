import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const teachers = [
    { name: "Krishna KR. Chaudhary", initials: "KKC" },
    { name: "Prajwal Poudel", initials: "PP" },
    { name: "Chandan Bhagat", initials: "CB", title: "Head of Department" },
    { name: "Manish Yadav", initials: "MY" },
    { name: "Drona Sigdel", initials: "DS" },
    { name: "Pankaj Shah", initials: "PS" },
    { name: "Vision Bhandari", initials: "VB" },
    { name: "Bishwash Poudel", initials: "BP" },
    { name: "Reverse Dahal", initials: "RD" },
    { name: "Arosh Poudel", initials: "AP" },
    { name: "Yagyaraj Upadhayaya", initials: "YRU" },
    { name: "Basant Pd. Yadav", initials: "BPY" },
    { name: "Pradip KR. Sharma", initials: "PKS" },
  ];

  try {
    const hashedPassword = await bcrypt.hash("temporary123", 10);
    let count = 0;

    for (const t of teachers) {
      const email = `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mbman.edu.np`;
      
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name: t.name + (t.title ? ` (${t.title})` : ""),
          email: email,
          password: hashedPassword,
          role: "TEACHER",
          department: "COMPUTER",
          isVerified: true,
          forcePasswordChange: true
        }
      });
      count++;
    }

    return NextResponse.json({ success: true, message: `Seeded ${count} teachers` });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
