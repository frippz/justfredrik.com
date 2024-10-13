import { json } from '@sveltejs/kit';
import type { Post } from '$lib/types';

async function getPosts() {
  let posts: Post[] = [];

  try {
    const paths = import.meta.glob('/src/posts/**/*.md', { eager: true });

    for (const path in paths) {
      const file = paths[path];

      // Extract the part after '/src/posts/' and remove '.md'
      let pathWithoutPrefix = path.replace('/src/posts/', '').replace('.md', '');

      // Split the path into parts to extract year/month/day and filename
      const parts = pathWithoutPrefix.split('/');

      if (parts.length < 4) {
        console.error(`Unexpected path structure: ${path}`);
        continue; // Skip if the path doesn't match the expected structure
      }

      // Extract year, month, day, and slug from the path
      const [year, month, day, ...slugParts] = parts;
      const slug = slugParts.join('/'); // Reconstruct slug from remaining parts

      if (file && typeof file === 'object' && 'metadata' in file && slug) {
        const metadata = file.metadata as Omit<Post, 'slug'>;
        const post = { ...metadata, slug: `${year}/${month}/${day}/${slug}` } satisfies Post;
        post.published && posts.push(post);
      } else {
        console.error(`Invalid file structure or missing metadata: ${path}`);
      }
    }

    posts = posts.sort(
      (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  return posts;
}

export async function GET() {
  const posts = await getPosts();
  return json(posts);
}
