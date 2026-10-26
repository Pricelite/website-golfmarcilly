export type Partner = {
  name: string;
  logo?: string;
  removeWhiteBackground?: boolean;
  website?: string;
  showInMarquee?: boolean;
};

export const partners: Partner[] = [
  { name: "Citya", logo: "/partners/citya.png", website: "https://www.citya.com/" },
  { name: "Rotary", logo: "/partners/rotary.png", website: "https://www.rotary.org/fr-fr", showInMarquee: false },
  { name: "Eden Park", logo: "/partners/eden-park-logo.png", website: "https://www.eden-park.com/" },
  { name: "SAFTI", logo: "/partners/safti.svg", website: "https://www.safti.fr/" },
  { name: "ACE TRANS", logo: "/partners/ace-trans-cutout.png", website: "https://acetrans.fr/" },
  { name: "Menuiserie GODEL", logo: "/partners/menuiserie-godel.png", website: "https://menuiseriegodel.fr/" },
  { name: "Rénov’Centre", logo: "/partners/renov-centre.png", removeWhiteBackground: true, website: "https://www.maisondumenuisier.fr/orleans" },
  { name: "AEDC", logo: "/partners/aedc.png", removeWhiteBackground: true, website: "https://www.pagesjaunes.fr/pros/57101682" },
  { name: "Garage Thomas AD", logo: "/partners/garage-thomas.png", removeWhiteBackground: true, website: "https://www.garage-thomas45.fr/" },
  { name: "WAGC", logo: "/partners/wagc.png", website: "https://wagc-france.com/", showInMarquee: false },
  { name: "T’Libre Max", logo: "/partners/t-libre-max.webp", removeWhiteBackground: true, website: "https://www.helloasso.com/associations/t-libre-max" },
  { name: "Maserati", logo: "/partners/maserati.svg", website: "https://www.maserati.com/fr/fr" },
  { name: "KIA", logo: "/partners/kia.svg", website: "https://www.kia.com/fr/" },
  { name: "Crit", logo: "/partners/crit.svg", website: "https://www.crit-job.com/" },
  { name: "AVC Sécurité", logo: "/partners/avc-securite-cutout.png", website: "https://www.groupe-avc.com/systemes-de-securite/" },
  { name: "Loir & Flip", logo: "/partners/loir-and-flip.png", website: "https://www.loir-and-flip.fr/" },
  { name: "Equip Jardin", logo: "/partners/equip-jardin-cutout.png", website: "https://www.equipjardin.com/" },
  { name: "Soditra", logo: "/partners/soditra-cutout.png", website: "https://www.soditra.com/" },
  { name: "Bregent", logo: "/partners/bregent-cutout.png", website: "https://www.caves-lamottoises.com/" },
  { name: "Audilab", logo: "/partners/audilab.svg", website: "https://www.audilab.fr/" },
  { name: "SwingFlow", logo: "/partners/swingflow.png", website: "https://swingflow.fr/" },
  { name: "US Orléans Loiret Football", logo: "/partners/us-orleans.png", website: "https://orleansloiretfoot.com/" },
  { name: "Rugby Club Orléans", logo: "/partners/rugby-club-orleans.svg", website: "https://rugbycluborleans.com/" },
  { name: "Liger Homme", website: "https://www.vitrines-orleans.fr/les-commercants/liger-homme/", showInMarquee: true },
  { name: "La Bergerie" },
];
