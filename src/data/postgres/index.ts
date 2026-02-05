import { envs } from '../../config/envs.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const connectionString = envs.POSTGRES_URL;
const adapter = new PrismaPg({connectionString});
export const prisma = new PrismaClient({adapter});
