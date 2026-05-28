import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const updates = [
    { email: 'chetan.subedi@mbman.edu.np', name: 'Chetan Subedi (Assistant Professor)' },
    { email: 'drona.sigdel@mbman.edu.np', name: 'Drona Sigdel (Assistant Professor)' },
    { email: 'krishna.kr..chaudhary@mbman.edu.np', name: 'Krishna KR. Chaudhary (Assistant Professor)' },
  ];

  for (const u of updates) {
    const updated = await prisma.user.updateMany({
      where: { email: u.email },
      data: {
        name: u.name,
        department: 'BASIC_SCIENCE',
      }
    });
    console.log(`Updated ${u.email}:`, updated.count);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
