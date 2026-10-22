import { getPayload, handleEndpoints, type Payload } from 'payload'
import config from '../src/payload.config'

export const payloadInstance = (): Promise<Payload> => getPayload({ config })

/** A REST request as an anonymous visitor, such as the site's build, sends it */
export const anonymousGet = async <T>(
  path: string,
): Promise<{ status: number; body: T }> => {
  const response = await handleEndpoints({
    config,
    request: new Request(`http://localhost/api${path}`),
  })
  const text = await response.text()
  return {
    status: response.status,
    body: (response.headers.get('content-type')?.includes('json')
      ? JSON.parse(text)
      : text) as T,
  }
}

/** The smallest valid Lexical body: one paragraph of text */
export const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          {
            type: 'text',
            text,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            version: 1,
          },
        ],
      },
    ],
  },
})
