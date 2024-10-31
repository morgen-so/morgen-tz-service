import fs from "fs";
import { getTimeZones } from "@vvo/tzdb";
/**
 * Generates a mapping to legacy IANA names to canonical IANA names
 * from data in @vvo/tzdb.
 */
(async function () {
    const dbData = getTimeZones({ includeUtc: true });
    const regions = {};
    for (const zone of dbData) {
        const cities = zone.mainCities;
        cities.forEach((city) => {
            regions[city.toLowerCase()] = zone.name;
        });
    }
    const header = `// Generated from @vvo/tzdb data on ${new Date().toISOString()}\n\n`;
    fs.writeFileSync("./src/generated/regions.ts", `${header}export const regions: Record<string, string> = ${JSON.stringify(regions, null, 2)}`);
})();
//# sourceMappingURL=generateRegionMapping.js.map