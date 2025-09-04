import { prisma } from './prisma'

export async function logAudit(params: {
  userId?: string
  action: string
  entity?: string
  entityId?: string
  meta?: any
  ip?: string | null
}) {
  try {
    await prisma.auditLog.create({ data: { ...params, ip: params.ip ?? undefined } })
  } catch (e) {
    // swallow to avoid breaking main flow
  }
}

