export interface Lab {
  /** The Lab's URL name, and the name of its demo in `static/lab-includes/` */
  name: string
  title: string
  /** The explanatory note, one string per paragraph */
  note: string[]
}

// In frippz.se's order: alphabetical by name
export const labs: Lab[] = [
  {
    name: 'animated-map-pin',
    title: 'Animated map pin',
    note: [
      'A map pin with a pulsating indicator. Can be placed anywhere and scaled as needed. I originally created this for a indoor map solution for Nimway (previously Sony SmartOffice).',
    ],
  },
  {
    name: 'highlighted-text',
    title: 'Highlighted text',
    note: [
      'This was another playful experiment I made for Gleerups digital teaching materials. The idea was that students should be able to highlight text in the books and I wanted something that emulated a highlighter pen. Sadly it never made into the final product.',
    ],
  },
  {
    name: 'periodic-system',
    title: 'Periodic system in an HTML table',
    note: [
      'Another proof of concept for Gleerups digital teaching materials. We discussed making a periodic table using semantic markup for accessibility reasons. Yet another nice concept that didn’t make it into the final product.',
    ],
  },
  {
    name: 'yet-another-circular-progress-bar',
    title: 'Yet another circular progress bar',
    note: [
      'The world needs more progress bars! This one is using a simple SVG circle with stroke dash to achieve the progress itself. Originally made for Gleerups digital reading solution.',
    ],
  },
]

export function labPath({ name }: Lab) {
  return `/labs/${name}.html`
}

export function labDemoPath({ name }: Lab) {
  return `/lab-includes/${name}.html`
}
