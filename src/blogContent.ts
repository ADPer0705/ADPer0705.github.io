const markdownFiles = import.meta.glob('../assets/blogs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const blogContent: Record<string, string> = {};

for (const [path, raw] of Object.entries(markdownFiles)) {
  const filename = path.split('/').pop() ?? '';
  const slug = filename.replace(/\.md$/i, '');
  blogContent[slug] = raw;
}
