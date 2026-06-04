import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/ui/json-ld";
import { posts } from "@/data/posts";
import { absoluteUrl, buildMetadata } from "@/lib/metadata";
import { buildBlogPostingSchema, buildBreadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    return {};
  }

  return buildMetadata({
    title: post.title,
    description: post.seoDescription,
    path: `/actualites/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildBlogPostingSchema({
        title: post.title,
        description: post.seoDescription,
        path: `/actualites/${post.slug}`,
        image: post.coverImage,
        publishedAt: post.publishedAt,
      })} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Actualités", path: "/actualites" },
          { name: post.title, path: `/actualites/${post.slug}` },
        ])}
      />
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700">
          {post.category}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-emerald-950">{post.title}</h1>
        <p className="mt-4 text-sm text-emerald-950/65">
          {formatDate(post.publishedAt)} • {post.readingTime}
        </p>
        <p className="mt-8 text-lg leading-8 text-emerald-950/78">{post.excerpt}</p>
        <div className="prose-brand mt-10">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-10 text-sm text-emerald-950/55">
          URL canonique : {absoluteUrl(`/actualites/${post.slug}`)}
        </p>
      </article>
    </>
  );
}
