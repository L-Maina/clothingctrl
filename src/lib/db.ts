import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force a fresh Prisma client on each module load in development
// to avoid stale connection issues
const forceNewClient = () => {
  const client = new PrismaClient({
    log: ['query'],
  })
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

export const db = forceNewClient()
