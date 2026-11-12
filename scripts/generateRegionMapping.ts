import fs from "fs";
import { getTimeZones } from "@vvo/tzdb";
import { regions as previous } from "../src/generated/regions.js";

/**
 * Generates a mapping from city names to IANA zones from the main cities in @vvo/tzdb.
 *
 * The mapping is kept stable across data updates:
 * - A city in more than one zone (e.g. Tripoli) keeps its previous zone while that zone still
 *   lists it; otherwise the zone that sorts first by name wins. @vvo/tzdb orders zones by their
 *   current offset, so taking the last one read would change with the season.
 * - A city that @vvo/tzdb no longer lists among the main cities keeps its previous zone.
 */
(async function () {
  const candidates = new Map<string, string[]>();
  const zones = getTimeZones({ includeUtc: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const zone of zones) {
    for (const city of zone.mainCities) {
      const key = city.toLowerCase();
      const list = candidates.get(key) ?? [];
      if (!list.includes(zone.name)) list.push(zone.name);
      candidates.set(key, list);
    }
  }

  const regions: Record<string, string> = { ...previous };
  for (const [city, zoneNames] of candidates) {
    const kept = previous[city];
    regions[city] = kept && zoneNames.includes(kept) ? kept : zoneNames[0]!;
  }

  const sorted = Object.fromEntries(Object.entries(regions).sort(([a], [b]) => a.localeCompare(b)));
  const header = `// Generated from @vvo/tzdb data on ${new Date().toISOString()}\n\n`;

  fs.writeFileSync(
    "./src/generated/regions.ts",
    `${header}export const regions: Record<string, string> = ${JSON.stringify(sorted, null, 2)}`
  );
})();
