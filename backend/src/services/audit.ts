export type Diff = Record<string, { before: unknown; after: unknown }>

export function makeDiff(before: Record<string, unknown>, after: Record<string, unknown>, fields: string[]): Diff {
  const diff: Diff = {}
  for (const k of fields) {
    if (before[k] !== after[k]) {
      diff[k] = { before: before[k], after: after[k] }
    }
  }
  return diff
}
