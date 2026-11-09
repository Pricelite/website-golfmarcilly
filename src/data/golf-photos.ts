export type GolfPhoto = { src: string; width: number; height: number; alt: string; caption: string };

// Photos fournies par le propriétaire. Les cinq premières sont aussi utilisées par l’accueil.
export const golfPhotos = [
  { src: "/images/parcours/green-sous-les-chenes.webp", width: 1600, height: 1200, alt: "Un green et son drapeau sous les branches d’un chêne, devant un bunker", caption: "À l’ombre des chênes" },
  { src: "/images/parcours/fairway-pins-et-bunker.webp", width: 1600, height: 1200, alt: "Un fairway bordé d’herbes hautes, avec des pins et un bunker sous un ciel nuageux", caption: "Entre pins et bunkers" },
  { src: "/images/parcours/depart-driver.webp", width: 1200, height: 1600, alt: "Un driver derrière une balle sur un tee, face au parcours", caption: "Au départ" },
  { src: "/images/parcours/parcours-ciel-nuageux.webp", width: 1600, height: 1200, alt: "Vue dégagée sur un green, ses bunkers et les herbes hautes du parcours", caption: "Les lignes du parcours" },
  { src: "/images/parcours/parcours-lumiere-du-soir.webp", width: 1600, height: 1200, alt: "Le soleil bas éclaire un green et les arbres du domaine", caption: "La lumière du soir" },
  { src: "/images/parcours/depart-plan-eau-ile.webp", width: 1280, height: 1280, alt: "Départ du parcours face à un plan d’eau et à un îlot arboré", caption: "Au bord de l’eau" },
  { src: "/images/parcours/green-club-house.webp", width: 1280, height: 1280, alt: "Drapeaux sur le green près du club-house, à côté d’un grand arbre", caption: "Le green près du club-house" },
  { src: "/images/parcours/ciel-rose-sur-le-golf.webp", width: 1600, height: 1200, alt: "Arbres et green sous un ciel rose et orangé, avec des reflets dans l’eau", caption: "Ciel rose sur le golf" },
  { src: "/images/parcours/practice-voiturettes.webp", width: 1600, height: 1200, alt: "Bâtiment du practice et voiturettes garées sous leur abri au Golf de Marcilly", caption: "Le practice et les voiturettes" },
  { src: "/images/parcours/green-entrainement-practice.webp", width: 1600, height: 1200, alt: "Plusieurs drapeaux sur le green d’entraînement, devant un grand arbre et le practice", caption: "Sur le green d’entraînement" },
] as const satisfies readonly GolfPhoto[];
