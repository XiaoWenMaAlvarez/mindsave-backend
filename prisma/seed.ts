import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TipoChatRol, TipoRol } from "../src/generated/prisma/client.js";
import { bcryptAdapter } from "../src/config/bcrypt.adapter.js";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
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

  const adminPassword = bcryptAdapter.hash("administrador");

  await prisma.user.upsert({
    where: { email: "admin@mindsave.cl" },
    update: {
      name: "admin",
      password: adminPassword,
      emailVerified: true,
      isActive: true,
      role: {
        connect: { description: TipoRol.PROFESIONAL_ROL },
      },
    },
    create: {
      name: "admin",
      email: "admin@mindsave.cl",
      password: adminPassword,
      emailVerified: true,
      isActive: true,
      role: {
        connect: { description: TipoRol.PROFESIONAL_ROL },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
