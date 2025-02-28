import { PrismaClient } from '@prisma/client'

// Create a singleton instance of Prisma Client
const prisma = new PrismaClient()

export default prisma
