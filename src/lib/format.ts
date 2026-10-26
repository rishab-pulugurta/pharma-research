/** Typographic minus; a leading plus only for signed measures (changes), never for proportions. */
export function fmtNum(v: number, signed = true): string {
  const s = `${Math.abs(v)}`
  if (v < 0) return `−${s}`
  return signed && v > 0 ? `+${s}` : s
}

/** "%" for any percent-based unit ("%", "% with event", "% of participants"), otherwise " unit". */
export const unitSuffix = (unit: string) => (unit.startsWith('%') ? '%' : ` ${unit}`)

export const fmtVal = (v: number, unit: string, signed = true) => `${fmtNum(v, signed)}${unitSuffix(unit)}`

/** Lowercase the first letter unless it starts an acronym (e.g. "mRNA", "LDLR"). */
export const lowerFirst = (s: string) => (/^[A-Z][A-Z0-9-]/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1))

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export const localDate = (iso: string) => new Date(iso).toLocaleDateString('en-CA')

/** Group estimand wording that means the same thing, so synonyms aren't flagged as differences. */
export function estimandClass(e?: string): string {
  if (!e) return 'Not specified'
  const x = e.toLowerCase()
  if (/efficacy|on[- ]treatment/.test(x)) return 'Efficacy (participants on treatment)'
  if (/treatment[- ]regimen|treatment policy|itt|planned treatment/.test(x)) return 'Treatment policy (everyone randomized)'
  return 'Not specified'
}
