import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockContent } from "@/components/backoffice/block-content";
import { openDb, type PageRow } from "@/lib/backoffice/db";
import { parsePageContent } from "@/lib/backoffice/model";
import { absoluteUrl } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Props = { params: Promise<{ slug: string }> };

function published(slug: string) {
  const db = openDb();
  try {
    const row = db.prepare("SELECT * FROM pages WHERE slug=? AND published_json IS NOT NULL").get(slug) as PageRow | undefined;
    return row ? parsePageContent(JSON.parse(row.published_json!)) : null;
  } finally { db.close(); }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const content = published(slug);
  return content ? { title: content.seoTitle || content.title, description: content.seoDescription, alternates: { canonical: absoluteUrl(`/pages/${slug}`) }, openGraph: { title: content.seoTitle || content.title, description: content.seoDescription, url: absoluteUrl(`/pages/${slug}`) }, robots: { index: true, follow: true } } : { robots: { index: false, follow: false } };
}

export default async function ManagedPage({ params }: Props) {
  const content = published((await params).slug);
  if (!content) notFound();
  return <BlockContent content={content} />;
}
