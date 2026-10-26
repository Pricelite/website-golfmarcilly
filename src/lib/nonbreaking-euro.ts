/** Keep each euro sign on the same line as its amount. */
export function nonbreakingEuro(text: string): string {
  return text.replace(/(\d)\s+€/g, "$1\u00a0€");
}
