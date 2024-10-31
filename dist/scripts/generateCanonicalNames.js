import fs from "fs";
import moment from "moment-timezone";
import { getCanonicalIanaName } from "./utils.js";
/**
 * Generates a mapping to legacy IANA names to canonical IANA names
 * from data in @vvo/tzdb.
 */
(async function () {
    const zones = moment.tz.names();
    const canonicalNames = {};
    for (const zone of zones) {
        const canonicalZone = getCanonicalIanaName(zone);
        if (!canonicalZone)
            throw new Error(`No canonical zone found for ${zone}`);
        if (canonicalZone && canonicalZone !== zone) {
            canonicalNames[zone] = canonicalZone;
        }
    }
    const header = `// Generated from @vvo/tzdb data on ${new Date().toISOString()}\n\n`;
    fs.writeFileSync("./src/generated/canonicalNames.ts", `${header}export const canonicalNames: Record<string, string> = ${JSON.stringify(canonicalNames, null, 2)}`);
})();
//# sourceMappingURL=generateCanonicalNames.js.map