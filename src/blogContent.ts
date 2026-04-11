const markdownFiles = import.meta.glob('../assets/blogs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const explicitSlugMap: Record<string, string> = {
  'The Bayesian Trap - A Mathematical Case for Trying Something New.md': 'the-bayesian-trap',
  "You Don't Need Prompt Engineering to Talk to AI.md": 'you-dont-need-prompt-engineering',
};

function slugify(name: string): string {
  return name
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const blogContent: Record<string, string> = {};

for (const [path, raw] of Object.entries(markdownFiles)) {
  const filename = path.split('/').pop() ?? '';
  const slug = explicitSlugMap[filename] ?? slugify(filename);
  blogContent[slug] = raw;
}
