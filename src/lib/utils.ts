import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import blogsData from "../data/blogs.json";
import { blogContent } from "../blogContent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const staticAssetUrls = import.meta.glob(
  "../../assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

export function resolveAssetUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\.?\//, "");
  return staticAssetUrls[`../../${normalized}`] || `/${normalized}`;
}

export interface BlogSummary {
  slug: string;
  title: string;
  date?: string;
  description: string;
  tags: string[];
  platforms: Record<string, string>;
}

export function getAllBlogPosts(): BlogSummary[] {
  const metadataPosts = blogsData as BlogSummary[];
  const contentSlugs = new Set(Object.keys(blogContent));
  const knownSlugs = new Set(metadataPosts.map((post) => post.slug));

  const inferredPosts: BlogSummary[] = Array.from(contentSlugs)
    .filter((slug) => !knownSlugs.has(slug))
    .map((slug) => ({
      slug,
      title: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      description: "Post content available",
      tags: [],
      platforms: { medium: "", devto: "", hashnode: "" },
    }));

  return [
    ...metadataPosts.filter((post) => contentSlugs.has(post.slug)),
    ...inferredPosts,
  ].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

export function estimateReadingTime(rawMarkdown: string): number {
  const stripped = rawMarkdown
    .replace(/^---[\s\S]*?---\n?/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\[\]()]/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return "undated";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
