import type { Access } from 'payload'

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Visitors see published documents only; the admin sees Drafts too */
export const publishedOrAuthenticated: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }
