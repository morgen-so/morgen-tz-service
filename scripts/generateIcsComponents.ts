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
    const [block, tzid] = tzlib_get_ical_block(canonicalZone);
    if (!block) throw new Error(`No ics block for ${zone}`);
    if (typeof block !== "string") {
      throw new Error(`iCal block for ${zone} is not a string`);
    }
    icsZones[canonicalZone] = block;
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
