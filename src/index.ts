/**
 * Timezone service.
 *
 */

import moment from "moment-timezone";
import _ from "lodash";
import { windowsZones } from "./generated/windowsZones.js";
import { windowsZonesInverse } from "./generated/windowsZonesInverse.js";
import { canonicalNames } from "./generated/canonicalNames.js";
import { regions } from "./generated/regions.js";
import { icsZones } from "./generated/icsZones.js";
import { checkLuxonCompatibility } from "./utils.js";

class Timezone {
  canonicalName_: string;
  validated_: boolean;

  constructor(tzName: string) {
    this.validated_ = false;
    this.canonicalName_ = this.getIanaTzName_(tzName);
  }

  get ianaName() {
    return this.canonicalName_;
  }

  get validated() {
    return this.validated_;
  }

  static ianaToWindows(ianaName: string): string | undefined {
    // Antarctica/Troll does not have a Windows equivalent
    // See https://github.com/mattjohnsonpint/TimeZoneConverter/issues/61
    if (ianaName === "Antarctica/Troll") return "UTC";
    const canonical = Timezone.findCanonicalIANAName(ianaName);
    return windowsZonesInverse[canonical];
  }

  /**
   * Given a IANA name, resolve for the default "alias" in the IANA db.
   * If the name is not found, returns the input.
   * @param tzName
   */
  static findCanonicalIANAName(ianaName: string): string {
    if (canonicalNames[ianaName]) return canonicalNames[ianaName];
    return ianaName;
  }

  /**
   * Returns a dictionary that maps from tzid to the corresponding VTIMEZONE ical string.
   *
   */
  static getVTimeZoneComponents() {
    return { ...icsZones };
  }

  /**
   * Returns the VTIMEZONE component of the current zone
   *
   */
  getVTimeZoneComponent(): string | undefined {
    return icsZones[this.canonicalName_];
  }

  /**
   * Try to map given timezone to an IANA canonical name.
   *
   * @param tzName
   */
  getIanaTzName_(tzName: string) {
    if (!tzName) {
      // No timezone name provided, we assume local timezone
      return Timezone.findCanonicalIANAName(moment.tz.guess());
    }

    // Try to resolve aliases to a canonical IANA name first
    // This step needs to come _before_ confirming with moment-timezone
    // because moment-timezone also accepts legacy zone names
    tzName = tzName.trim();
    tzName = Timezone.findCanonicalIANAName(tzName);

    // 1. Validate with moment
    // If recognized by moment, we assume the zone name is valid
    if (moment.tz.zone(tzName)) {
      this.validated_ = true;
      return tzName;
    }

    // 2. Try windows mapping names
    // Notice that here we remove the "(UTC+XX:00)" prefix from the timezone name
    const ianaFromMs = windowsZones[tzName.replace(/\(.*\)\s*/gm, "").trim()];
    if (ianaFromMs) {
      this.validated_ = true;
      return ianaFromMs;
    }

    // 3. Heuristic match
    // Ideally, we should never get here but some providers (especially CalDAV ones)
    // return very odd timezone names sometimes.
    const ianaInferred = this.bestGuess_(tzName);
    if (ianaInferred) {
      const ianaInferredCanonical =
        Timezone.findCanonicalIANAName(ianaInferred);
      if (moment.tz.zone(ianaInferredCanonical)) {
        this.validated_ = true;
        return ianaInferredCanonical;
      }
    }

    // Timezone could not be found
    console.error(
      `Could not map timezone "${tzName}" to an IANA timezone database name.`
    );
    return Timezone.findCanonicalIANAName(moment.tz.guess());
  }

  extractCities_(timezoneDescription: string): string[] {
    // Regular expression to match any offset format within parentheses and capture the cities list
    const match = timezoneDescription.match(/\(.*?\)\s*(.*)/);

    if (match && match[1]) {
      const citiesString = match[1];

      // Split by common delimiters and filter out any empty strings
      return citiesString
        .split(/[,;]\s*|\s{2,}/) // Split on commas, semicolons, or multiple spaces
        .map((city) => city.trim()) // Trim whitespace from each city name
        .filter((city) => city.length > 0); // Remove any empty entries
    }

    // Return an empty array if no match is found
    return [];
  }

  mapOffsetToIANATimeZone_(offsetString: string): string | null {
    // Comprehensive mappings for UTC offsets to IANA time zones (without DST consideration)
    const offsetToIANAMap: { [key: string]: string } = {
      "+0000": "Etc/UTC",
      "+0100": "Etc/GMT-1",
      "+0200": "Etc/GMT-2",
      "+0300": "Etc/GMT-3",
      "+0400": "Etc/GMT-4",
      "+0500": "Etc/GMT-5",
      "+0530": "Asia/Kolkata",
      "+0545": "Asia/Kathmandu",
      "+0600": "Etc/GMT-6",
      "+0630": "Asia/Yangon",
      "+0700": "Etc/GMT-7",
      "+0800": "Etc/GMT-8",
      "+0900": "Etc/GMT-9",
      "+0930": "Australia/Darwin",
      "+1000": "Etc/GMT-10",
      "+1030": "Australia/Lord_Howe",
      "+1100": "Etc/GMT-11",
      "+1200": "Etc/GMT-12",
      "+1245": "Pacific/Chatham",
      "+1300": "Etc/GMT-13",
      "+1400": "Etc/GMT-14",

      "-0000": "Etc/UTC",
      "-0100": "Etc/GMT+1",
      "-0200": "Etc/GMT+2",
      "-0300": "Etc/GMT+3",
      "-0330": "America/St_Johns",
      "-0400": "Etc/GMT+4",
      "-0500": "Etc/GMT+5",
      "-0600": "Etc/GMT+6",
      "-0700": "Etc/GMT+7",
      "-0800": "Etc/GMT+8",
      "-0900": "Etc/GMT+9",
      "-0930": "Pacific/Marquesas",
      "-1000": "Etc/GMT+10",
      "-1100": "Etc/GMT+11",
      "-1200": "Etc/GMT+12",
    };

    // Regular expression to extract offset components
    const offsetMatch = offsetString.match(/(?:UTC|GMT)([+-]\d{2}):?(\d{2})/);
    if (!offsetMatch) return null; // Return null if format doesn't match

    // Format extracted offset to a single string for lookup
    const hours = offsetMatch[1];
    const minutes = offsetMatch[2];
    const normalizedOffset = `${hours}${minutes}`;

    // Look up the normalized offset in the map and return it
    return offsetToIANAMap[normalizedOffset] || null; // Return null if no match found
  }

  /**
   *  If both moment-timezone and ews failed to recognize the timezone name
   *  we may have something not standard such as
   *  - "/freeassociation.sourceforge.net/Europe/Berlin"
   *  - "(UTC+01:00) Amsterdam, Berlin, Bern, Rom, Stockholm, Wien"
   *  - "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"
   *  - "GMT+0200"
   * @param tzName
   * @returns
   */
  bestGuess_(tzName: string) {
    // Heuristic 1: match the end with a known timezone
    // Cover the case of propertary prefixes such as
    // /freeassociation.sourceforge.net/Europe/Berlin
    const names = moment.tz.names();
    const ianaInferred = names.find((name) => tzName.endsWith(name));
    if (ianaInferred) return ianaInferred;

    // Heuristic 2: use city mapping, which should cover the cases of
    // time zone descriptions such as
    // (UTC+01:00) Amsterdam, Berlin, Bern, Rom, Stockholm, Wien
    const cities = this.extractCities_(tzName);
    for (const city of cities) {
      const ianaName = regions[city.toLocaleLowerCase()];
      if (ianaName) return ianaName;
    }

    // Heuristic 3: use offset mapping, which should cover the cases of
    // time zone descriptions such as GMT+0100
    const ianaName = this.mapOffsetToIANATimeZone_(tzName);
    if (ianaName) return ianaName;

    return null;
  }
}

export default { Timezone };

// Run a check to see if all the zones of moment-timezone are recognized by Luxon
setTimeout(() => {
  checkLuxonCompatibility();
}, 0);
