import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log("ALL USERS:", users.map(u => ({ id: u.id, email: u.email, role: u.role, isVerified: u.isVerified, kycStatus: (u as any).kycStatus })));

  const updatedUser = await prisma.user.update({
    where: { email: 'bishnugautam2005@gmail.com' },
    data: { role: 'ADMIN', isVerified: true }
  });
  console.log("Updated user:", updatedUser.email, "to ADMIN");
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
