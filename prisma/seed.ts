import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

async function main() {
  console.log("Seeding teachers...");
  const hashedPassword = await bcrypt.hash("temporary123", 10);

  for (const t of teachers) {
    const email = `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mbman.edu.np`;
    
    // Upsert to avoid crashing if they already exist
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
    console.log(`Created: ${t.name}`);
  }
  
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
