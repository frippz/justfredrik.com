import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SourcePost } from './convert'

/** The frippz.se checkout, a sibling of this repo unless `FRIPPZ_SE` says otherwise */
export const frippzDir = path.resolve(
  process.env.FRIPPZ_SE ??
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../../frippz.se',
    ),
)

export async function readPosts(dir = frippzDir): Promise<SourcePost[]> {
  const postsDir = path.join(dir, '_posts')
  const filenames = (await fs.readdir(postsDir)).filter((name) =>
    name.endsWith('.md'),
  )
  return Promise.all(
    filenames.sort().map(async (filename) => ({
      name: filename.replace(/\.md$/, ''),
      source: await fs.readFile(path.join(postsDir, filename), 'utf8'),
    })),
  )
}
