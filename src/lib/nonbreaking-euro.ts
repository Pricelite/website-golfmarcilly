/** Display euro amounts with two decimals and a nonbreaking space, without changing their value. */
export function nonbreakingEuro(text: string): string {
  return text.replace(/(\d{1,3}(?:[ \u00a0\u202f]\d{3})*|\d+)(?:[,.](\d{1,2}))?\s*€/g,
    (_, euros: string, cents?: string) => `${euros}${cents ? `,${cents.padEnd(2, "0")}` : ",00"}\u00a0€`);
}
