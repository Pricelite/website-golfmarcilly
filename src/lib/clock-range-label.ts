/** Display a saved school slot with the site's public opening-hours typography. */
export function clockRangeLabel(value: string) {
  return value.replace(/\b(\d{1,2}) h(?: (\d{1,2}))?\b/g, (_, hour: string, minute?: string) => `${hour.padStart(2, "0")}h${(minute ?? "00").padStart(2, "0")}`)
    .replace(" – ", " - ");
}
