import { getPayload } from 'payload'
import config from '../payload.config'
import { convertPosts } from './convert'
import { importPosts } from './import'
import { readPosts } from './source'

// Imports frippz.se's Posts, with their Tags and images, from the sibling
// checkout (or `FRIPPZ_SE`). Safe to run again: nothing is duplicated.
//
//   pnpm --filter cms import:frippz
//
// Against production, with remote D1 and R2 bindings:
//
//   NODE_ENV=production PAYLOAD_SECRET=… pnpm --filter cms import:frippz

const payload = await getPayload({ config })

const counts = await importPosts(payload, convertPosts(await readPosts()))

payload.logger.info(
  `Imported ${counts.posts} Posts, ${counts.tags} Tags and ${counts.media} Media`,
)
await payload.destroy()
