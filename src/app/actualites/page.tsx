import { BlogCard } from "@/components/ui/blog-card";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { posts } from "@/data/posts";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Actualités",
  description:
    "Blog du Golf de Marcilly : conseils, vie du club, restaurant et événements près d'Orléans.",
  path: "/actualites",
});

export default function NewsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Actualités", path: "/actualites" },
        ])}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          as="h1"
          description="Une structure d'articles simple à enrichir pour travailler le SEO, la crédibilité et l'animation commerciale."
          eyebrow="Blog"
          title="Actualités du Golf de Marcilly"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
