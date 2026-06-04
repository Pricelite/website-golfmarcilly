import Image from "next/image";
import Link from "next/link";

import type { Post } from "@/data/posts";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post }: { post: Post }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <div className="relative aspect-[16/10]">
        <Image
          alt={post.title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={post.coverImage}
        />
      </div>
      <div className="flex h-full flex-col space-y-4 p-6">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          <span>{post.category}</span>
          <span aria-hidden="true">•</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden="true">•</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="font-serif text-2xl text-emerald-950">
          <Link href={`/actualites/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="flex-1 text-sm leading-7 text-emerald-950/75">{post.excerpt}</p>
        <Link
          className="mt-auto inline-flex text-sm font-semibold text-emerald-900 underline underline-offset-4"
          href={`/actualites/${post.slug}`}
        >
          Lire l&apos;article
        </Link>
      </div>
    </article>
  );
}
