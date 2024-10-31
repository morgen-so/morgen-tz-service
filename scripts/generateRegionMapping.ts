import fs from "fs";
import _ from "lodash";
import moment from "moment-timezone";
import { getCanonicalIanaName } from "./utils.js";
import { getTimeZones } from "@vvo/tzdb";
/**
 * Generates a mapping to legacy IANA names to canonical IANA names
 * from data in @vvo/tzdb.
 */
(async function () {
  const dbData = getTimeZones({ includeUtc: true });
  const regions: Record<string, string> = {};
  for (const zone of dbData) {
    const cities = zone.mainCities;
    cities.forEach((city) => {
      regions[city.toLowerCase()] = zone.name;
    });
  }

  const header = `// Generated from @vvo/tzdb data on ${new Date().toISOString()}\n\n`;

  fs.writeFileSync(
    "./src/generated/regions.ts",
    `${header}export const regions: Record<string, string> = ${JSON.stringify(
      regions,
      null,
      2
    )}`
  );
})();
