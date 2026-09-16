export type Partner = {
  name: string;
  /** Local logo path in public/partners, for example /partners/example.png. */
  logo: string;
  /** Optional full HTTPS URL of the partner's website. */
  website?: string;
};

// Add only confirmed partners and their supplied logos.
// The homepage section remains hidden until the first partner is added.
export const partners: Partner[] = [
  {
    name: "Golf de Marcilly",
    logo: "/images/LogoNoir.png",
  },
];
