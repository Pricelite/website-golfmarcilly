import { BlogCard } from "@/components/ui/blog-card";
import { ClubNews } from "@/components/club-news";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { posts } from "@/data/posts";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

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
          description="Les nouvelles sportives du club, puis nos conseils pour préparer votre visite."
          eyebrow="Blog"
          title="Actualités du Golf de Marcilly"
        />
        <ClubNews headingLevel="h2" />
        <h2 className="mt-12 font-serif text-3xl">Conseils et découvertes</h2>
        {posts[0] ? <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/75">Dernier conseil publié le {formatDate(posts[0].publishedAt)}. Pour les tarifs, horaires et conditions actuels, consultez les pages dédiées du site.</p> : null}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
