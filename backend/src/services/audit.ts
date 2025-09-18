import { Prisma } from '@prisma/client'

export type Diff = Prisma.InputJsonValue

export function makeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[]
): Diff {
  const diff: Record<string, { before: unknown; after: unknown }> = {}
  for (const k of fields) {
    if (before[k] !== after[k]) {
      diff[k] = { before: before[k], after: after[k] }
    }
  }
  return diff as unknown as Prisma.InputJsonValue
}
