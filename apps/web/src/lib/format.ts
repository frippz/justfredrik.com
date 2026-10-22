const longDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

/** "October 22, 2026", as frippz.se's `%B %-d, %Y` */
export const formatDate = (iso: string) => longDate.format(new Date(iso))

/** "2026-10-22" */
export const isoDate = (iso: string) => iso.slice(0, 10)

const dayMonthYear = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

const ordinals = new Intl.PluralRules('en-US', { type: 'ordinal' })
const suffixes = { one: 'st', two: 'nd', few: 'rd', other: 'th' }

/** "8th December 2023", as Jekyll's `date_to_long_string: "ordinal"` */
export function formatOrdinalDate(iso: string) {
  const date = new Date(iso)
  const day = date.getUTCDate()
  const suffix = suffixes[ordinals.select(day) as keyof typeof suffixes]
  return `${day}${suffix} ${dayMonthYear.format(date)}`
}
