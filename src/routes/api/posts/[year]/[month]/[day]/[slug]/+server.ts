import { json, type RequestEvent } from '@sveltejs/kit';
import type { Post } from '$lib/types';

async function getPost(slug: string) {
  const paths = import.meta.glob('/src/posts/*.md', { eager: true });

  const path = `/src/posts/${slug}.md`;
  const file = paths[path] as {
    metadata: Omit<Post, 'slug' | 'content'>;
    default: { render: () => { html: string } };
  };

  if (file && typeof file === 'object' && 'metadata' in file && 'default' in file) {
    const metadata = file.metadata;
    const content = file.default.render().html; // Parse the markdown content
    const post = { ...metadata, slug, content } satisfies Post;
    return post;
  }

  return null;
}

export async function GET({ params }: RequestEvent) {
  const { slug } = params;
  console.log({ slug });
  const post = await getPost(slug);

  if (post) {
    return json(post);
  }

  return new Response(null, { status: 404 });
}
