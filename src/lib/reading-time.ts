// Rounded up at 200 words/minute, including the title and introduction.
export function readingTime(title: string, excerpt: string, content: string[]): string {
  const words = [title, excerpt, ...content].join(" ").trim().split(/\s+/u).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}
