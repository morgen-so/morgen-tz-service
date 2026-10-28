import path from "path";
import fs from "fs";
import _ from "lodash";
import { XMLParser } from "fast-xml-parser";
import { getCanonicalIanaName } from "./utils.js";

/**
 * Generates the files `windowsZones.ts` and `windowsZonesInverse.ts` from
 * the file `windowsZones.xml` CLDR data. windowsZones is a mapping from
 * Windows zone to canonical IANA name. windowsZonesInverse is a mapping from
 * canonical IANA name to Windows zone.
 */

(async function () {
  // Read from file windowsZones.xml
  const xmlData = fs.readFileSync(
    path.join(path.resolve(), "./scripts/data/windowsZones.xml"),
    "utf-8"
  );
  const parser = new XMLParser({
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    attributeNamePrefix: "@_",
  });
  const data = parser.parse(xmlData);

  const zones: {
    "@_other": string;
    "@_territory": string;
    "@_type": string;
  }[] = data["supplementalData"]["windowsZones"]["mapTimezones"]["mapZone"];

  // Mapping from Windows zone to canonical IANA name
  const windowsZones = _(zones)
    .groupBy("@_other")
    .map((z, msZone) => {
      // Find canonical zone (indicated by @_territory === "001")
      const canonizalZone = z.find((z_) => z_["@_territory"] === "001");
      if (!canonizalZone)
        throw new Error(`No canonical zone found for ${msZone}`);
      const ianaName = canonizalZone["@_type"];

      // CLDR data is not always up to date. We mant to make dure the Windows zone
      // map to a canonical IANA name.
      const canonicalIanaName = getCanonicalIanaName(ianaName);
      return [msZone, canonicalIanaName];
    })
    .fromPairs()
    .toJSON();

  let header = `// Generated from windowsZones.xml on ${new Date().toISOString()}\n`;
  header += `// Source: https://github.com/unicode-org/cldr/blob/main/common/supplemental/windowsZones.xml\n\n`;

  fs.writeFileSync(
    "./src/generated/windowsZones.ts",
    `${header}export const windowsZones: Record<string, string> = ${JSON.stringify(
      windowsZones,
      null,
      2
    )}`
  );

  // A name that CLDR lists keeps its own Windows zone. An alias that CLDR
  // lists under a different Windows zone must not overwrite it, for example
  // Europe/Copenhagen (Romance) is an alias of Europe/Berlin (W. Europe).
  const listedIanaNames = new Set(
    zones.flatMap((z) => z["@_type"].split(" "))
  );

  // Mapping from IANA name to Windows zone
  const windowsZonesInverse = _(zones)
    .map((z) => {
      const msZone = z["@_other"];
      const ianaNames = z["@_type"].split(" ");
      return ianaNames.map((ianaName) => {
        const canonicalIanaName = getCanonicalIanaName(ianaName);
        const pairs = [[ianaName, msZone]];
        if (canonicalIanaName && !listedIanaNames.has(canonicalIanaName))
          pairs.push([canonicalIanaName, msZone]);
        return pairs;
      });
    })
    .flattenDepth(2)
    .fromPairs()
    .toJSON();

  fs.writeFileSync(
    "./src/generated/windowsZonesInverse.ts",
    `${header}export const windowsZonesInverse: Record<string, string> = ${JSON.stringify(
      windowsZonesInverse,
      null,
      2
    )}`
  );
})();
