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
