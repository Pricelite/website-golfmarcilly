import { absoluteUrl } from "@/lib/metadata";
import { getGolfOpeningSchedule, siteConfig } from "@/data/site";
import { restaurantData } from "@/lib/restaurant-data";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const golfId = absoluteUrl("/#golf");

function address() {
  return {
    "@type": "PostalAddress",
    streetAddress: siteConfig.addressLine1,
    postalCode: siteConfig.postalCode,
    addressLocality: siteConfig.city,
    addressRegion: siteConfig.region,
    addressCountry: siteConfig.countryCode,
  };
}

function time(hours: string, minutes?: string) { return `${hours.padStart(2, "0")}:${(minutes ?? "0").padStart(2, "0")}`; }

/** Disjoint seasonal periods: winter includes March 10 and starts on November 1. */
export function buildGolfOpeningHours(now = new Date()) {
  const year = Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric" }).format(now));
  const periods = [
    [`${year - 1}-11-01`, `${year}-03-10`],
    [`${year}-03-11`, `${year}-10-31`],
    [`${year}-11-01`, `${year + 1}-03-10`],
    [`${year + 1}-03-11`, `${year + 1}-10-31`],
    [`${year + 1}-11-01`, `${year + 2}-03-10`],
  ];
  return periods.flatMap(([validFrom, validThrough]) => getGolfOpeningSchedule(new Date(`${validFrom}T12:00:00Z`)).map((slot, index) => {
    const parsed = slot.hours.match(/de (\d+) h(?: (\d+))? à (\d+) h(?: (\d+))?/);
    if (!parsed) throw new Error("Invalid golf opening hours");
    return { "@type": "OpeningHoursSpecification", dayOfWeek: (index === 0 ? weekDays.slice(0, 5) : weekDays.slice(5)).map(day => `https://schema.org/${day}`), opens: time(parsed[1], parsed[2]), closes: time(parsed[3], parsed[4]), validFrom, validThrough };
  }));
}

export function buildOrganizationSchema(now = new Date()) {
  return {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    "@id": golfId,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phoneHref,
    email: siteConfig.email,
    image: absoluteUrl("/images/club-house-marcilly-og.jpg"),
    logo: absoluteUrl("/images/LogoNoir.png"),
    address: address(),
    hasMap: siteConfig.mapExternalUrl,
    sameAs: siteConfig.socialLinks.map(link => link.href),
    openingHoursSpecification: buildGolfOpeningHours(now),
  };
}

export function buildWebsiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": absoluteUrl("/#website"), name: siteConfig.name, url: siteConfig.url, inLanguage: "fr-FR", publisher: { "@id": golfId } };
}

export function buildRestaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": absoluteUrl("/restaurant#la-bergerie"),
    name: restaurantData.name,
    description: "Restaurant du Golf de Marcilly à Marcilly-en-Villette, ouvert aux golfeurs et aux visiteurs extérieurs pour le déjeuner.",
    url: absoluteUrl("/restaurant"),
    telephone: siteConfig.phoneHref,
    address: address(),
    image: absoluteUrl("/restaurant/hero.jpg"),
    hasMenu: absoluteUrl("/restaurant#carte-du-jour"),
    acceptsReservations: true,
    containedInPlace: { "@id": golfId },
    openingHoursSpecification: restaurantData.hours.flatMap((day, index) => {
      const parsed = day.hours.match(/^(\d{1,2})h(\d{2}) - (\d{1,2})h(\d{2})$/);
      return parsed ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${weekDays[index]}`, opens: time(parsed[1], parsed[2]), closes: time(parsed[3], parsed[4]) }] : [];
    }),
  };
}

export function buildFaqSchema(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogPostingSchema(input: {
  title: string;
  description: string;
  path: string;
  image: string;
  publishedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: absoluteUrl(input.image),
    datePublished: input.publishedAt,
    dateModified: input.publishedAt,
    mainEntityOfPage: absoluteUrl(input.path),
    publisher: {
      "@type": "Organization",
      "@id": golfId,
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/LogoNoir.png"),
      },
    },
  };
}
