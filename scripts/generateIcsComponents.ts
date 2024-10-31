import fs from "fs";
import _ from "lodash";
import moment from "moment-timezone";
import { tzlib_get_ical_block } from "timezones-ical-library";
import { getCanonicalIanaName } from "./utils.js";

/**
 * Generates iCalendar VTIMEZONE data from data in timezones-ical-library
 */

(async function () {
  const allZones = moment.tz.names();
  const icsZones: Record<string, string> = {};

  allZones.forEach((zone) => {
    const canonicalZone = getCanonicalIanaName(zone);
    if (!canonicalZone) throw new Error(`No canonical zone found for ${zone}`);
    const [block, tzid] = tzlib_get_ical_block(zone);
    if (!block) throw new Error(`No ics block for ${zone}`);
    if (!tzid) throw new Error(`No ics tzid for ${zone}`);
    if (typeof block !== "string") {
      throw new Error(`iCal block for ${zone} is not a string`);
    }
    // Before adding to the map, we need to replace the TZID with the actual zone name
    // because the library always returns the canonical zone name
    // Eg. the library return {"Europe/Kiev": {... TZID=Europe/Kyiv ...}}
    // and this breaks the mapping.
    const blockUpdated = block.replace(tzid.replace("=", ":"), `TZID:${zone}`);
    icsZones[zone] = blockUpdated;
  });

  const header = `// Generated from timezones-ical-library data on ${new Date().toISOString()}\n\n`;

  fs.writeFileSync(
    "./src/generated/icsZones.ts",
    `${header}export const icsZones: Record<string, string> = ${JSON.stringify(
      icsZones,
      null,
      2
    )}`
  );
})();
