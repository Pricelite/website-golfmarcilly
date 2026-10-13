import Link from "next/link";
import Image from "next/image";
import type { PageContent } from "@/lib/backoffice/model";

export function BlockContent({ content }: { content: PageContent }) {
  const theme = content.theme === "green" ? "bg-emerald-950 text-white" : content.theme === "white" ? "bg-white text-emerald-950" : "bg-[#f7f4e9] text-emerald-950";
  return <article className={`${theme} min-h-[55vh] py-12 sm:py-20`}>
    <div className="mx-auto max-w-4xl space-y-7 px-4 sm:px-6">
      <h1 className="font-serif text-4xl sm:text-6xl">{content.title}</h1>
      {content.blocks.map(block => {
        if (block.type === "heading") return block.level === 2 ? <h2 key={block.id} className="font-serif text-3xl">{block.text}</h2> : <h3 key={block.id} className="font-serif text-2xl">{block.text}</h3>;
        if (block.type === "text") return <p key={block.id} className="whitespace-pre-line text-base leading-8">{block.text}</p>;
        if (block.type === "image") return <figure key={block.id}><Image src={`/api/backoffice/media/${block.mediaId}`} alt={block.alt} width={1200} height={675} unoptimized className="max-h-[620px] w-full rounded-3xl object-cover" /></figure>;
        return <Link key={block.id} href={block.href} className="inline-flex rounded-full border border-current px-6 py-3 text-sm font-semibold hover:opacity-70">{block.text}</Link>;
      })}
    </div>
  </article>;
}
