import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TipoChatRol, TipoRol } from "../src/generated/prisma/client.js";
import { bcryptAdapter } from "../src/config/bcrypt.adapter.js";


const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const adminName = process.env.ADMIN_NAME;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminName || !adminEmail || !adminPassword) {
  throw new Error("Faltan variables de entorno del admin");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles: TipoRol[] = [
    TipoRol.PROFESIONAL_ROL,
    TipoRol.USER_ROL,
  ];

  for (const description of roles) {
    await prisma.role.upsert({
      where: { description },
      update: {},
      create: { description },
    });
  }

  const chatRoles: TipoChatRol[] = [
    TipoChatRol.user,
    TipoChatRol.model,
    TipoChatRol.system,
  ];

  for (const description of chatRoles) {
    await prisma.chatRole.upsert({
      where: { description },
      update: {},
      create: { description },
    });
  }

  if (adminName && adminEmail && adminPassword) {
    const adminPasswordHash = bcryptAdapter.hash(adminPassword);
  

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        password: adminPasswordHash,
        emailVerified: true,
        isActive: true,
        role: {
          connect: { description: TipoRol.PROFESIONAL_ROL },
        },
      },
      create: {
        name: adminName,
        email: adminEmail,
        password: adminPasswordHash,
        emailVerified: true,
        isActive: true,
        role: {
          connect: { description: TipoRol.PROFESIONAL_ROL },
        },
      },
    });
  }
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
