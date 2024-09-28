import type { Post } from '$lib/types';

export async function load({ params, fetch }) {
  const response = await fetch(`/api/posts/${params.slug}`);
  const post: Post = await response.json();
  return { post };
}
