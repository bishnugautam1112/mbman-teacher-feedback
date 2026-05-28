import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const teachers = [
    { email: 'mahesh.bhattarai@mbman.edu.np', name: 'Er. Mahesh Bhattarai (Assistant College Director)', image: '/teachers/mahesh.jpg' },
    { email: 'paribesh.timsina@mbman.edu.np', name: 'Er. Paribesh Timsina (Program Coordinator)', image: '/teachers/paribesh.jpg' },
    { email: 'raju.ansari@mbman.edu.np', name: 'Er. Raju Ansari (Assistant Professor)', image: '/teachers/raju.jpg' },
    { email: 'tulasi.bhandari@mbman.edu.np', name: 'Er. Tulasi Bhandari (Assistant Professor)', image: '/teachers/tulasi.jpg' },
    { email: 'roman.baral@mbman.edu.np', name: 'Er. Roman Baral (Instructor)', image: '/teachers/roman.jpg' },
  ];

  const hashedPassword = await bcrypt.hash("temporary123", 10);

  for (const t of teachers) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: t.name,
          email: t.email,
          password: hashedPassword,
          role: 'TEACHER',
          department: 'CIVIL',
          isVerified: true,
          forcePasswordChange: true,
          image: t.image
        }
      });
      console.log(`Created ${t.name}`);
    } else {
      await prisma.user.update({
        where: { email: t.email },
        data: {
          name: t.name,
          image: t.image,
          department: 'CIVIL'
        }
      });
      console.log(`Updated ${t.name}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
