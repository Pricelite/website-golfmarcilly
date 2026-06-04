# Golf de Marcilly - Refonte Next.js

Site premium, responsive et SEO-first pour le Golf de Marcilly, construit avec Next.js App Router, TypeScript, Tailwind CSS et Framer Motion.

## Installation

```bash
pnpm install
```

## Commandes

```bash
pnpm.cmd dev
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd typecheck
```

Sur PowerShell Windows, `pnpm.cmd` est la commande la plus fiable.

## Structure du projet

```text
src/
  app/                  Pages App Router, metadata, sitemap, robots, API forms
  components/
    forms/              ContactForm, QuoteForm, NewsletterForm
    layout/             Header, Footer
    sections/           Hero
    ui/                 Composants reutilisables
  data/                 Contenus mockes et faciles a remplacer
  lib/                  Helpers SEO, metadata, schema.org, utils
public/
  images/               Visuels du golf
  restaurant/           Visuels du restaurant
styles/
  prose.css             Styles de contenus editoriaux
```

## Pages livrees

- `/`
- `/golf`
- `/tarifs`
- `/enseignement`
- `/restaurant`
- `/evenements`
- `/actualites`
- `/actualites/[slug]`
- `/contact`
- `/mentions-legales`
- `/politique-de-confidentialite`

## Ou modifier les contenus

- Donnees globales du site, navigation, footer, testimonials : [src/data/site.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/site.ts:1)
- Contenu accueil et FAQ home : [src/data/home.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/home.ts:1)
- Parcours golf : [src/data/courses.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/courses.ts:1)
- Enseignement et pros : [src/data/teaching.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/teaching.ts:1)
- Restaurant : [src/data/restaurant.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/restaurant.ts:1)
- Evenements : [src/data/events.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/events.ts:1)
- Articles SEO / actualites : [src/data/posts.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/posts.ts:1)

## Ou modifier les tarifs

- Toute la structure tarifaire est centralisee dans [src/data/pricing.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/pricing.ts:1)
- Les tableaux HTML affiches sur la page tarifs sont rendus par [src/components/ui/pricing-table.tsx](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/components/ui/pricing-table.tsx:1)

## Ou modifier les metadonnees SEO

- Helper SEO global : [src/lib/metadata.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/lib/metadata.ts:1)
- Schema.org JSON-LD : [src/lib/schema.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/lib/schema.ts:1)
- Layout global et metadata par defaut : [src/app/layout.tsx](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/app/layout.tsx:1)
- Metadata par page : dans chaque fichier `page.tsx` sous `src/app/...`

## Formulaires

Les formulaires front appellent ces endpoints JSON :

- [src/app/api/contact/route.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/app/api/contact/route.ts:1)
- [src/app/api/quote/route.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/app/api/quote/route.ts:1)
- [src/app/api/newsletter/route.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/app/api/newsletter/route.ts:1)

Ils retournent actuellement des succes simples, prets a etre branches plus tard sur un CRM, un email transactionnel ou Supabase.

## Images

- Les images sont servies depuis `public/images` et `public/restaurant`
- Pour remplacer un visuel, gardez idealement le meme ratio et mettez a jour le chemin dans le fichier de donnees concerne

## Validation effectuee

- `pnpm.cmd build` passe

## Suite recommandee

1. Remplacer les contenus mockes par les contenus definitifs du golf.
2. Brancher les formulaires sur votre solution email/CRM.
3. Ajouter les vraies coordonnees legales et RGPD finales.
4. Remplacer les URLs de reservation placeholder par les liens reels.
