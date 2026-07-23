import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import TeacherListClient from "./TeacherListClient";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const user = session.user as any;
  if (user.role !== "STUDENT" || user.kycStatus !== "APPROVED") {
    // Should be caught by layout middleware, but strictly enforce here
    redirect("/dashboard");
  }

  // Fetch user's actual department from DB to ensure it's up to date after KYC
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { department: true }
  });

  // Fetch teachers for the student's department + Basic Science teachers
  const teachers = await prisma.user.findMany({
    where: { 
      role: "TEACHER",
      OR: [
        { department: dbUser?.department || undefined },
        { department: "BASIC_SCIENCE" }
      ]
    },
    select: {
      id: true,
      name: true,
      department: true,
      image: true,
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Reviews</h1>
        <p className="text-slate-500 font-medium mt-1 max-w-2xl">
          Select a teacher to submit your 100% anonymous feedback. Remember that constructive 
          criticism helps improve the academic environment. Severe toxicity will be rejected by AIRA AI.
        </p>
      </div>

      <TeacherListClient teachers={teachers} />
    </div>
  );
}
