import en from './en'
import ja from './ja'

type Dict = typeof en
let current: 'en' | 'ja' = (navigator.language || 'en').startsWith('ja') ? 'ja' : 'en'
const dict: Record<'en' | 'ja', Dict> = { en, ja }

export function setLocale(loc: 'en' | 'ja') {
  current = loc
}

export function t<K extends keyof Dict['common']>(key: K): string {
  return dict[current].common[key] || (key as string)
}
