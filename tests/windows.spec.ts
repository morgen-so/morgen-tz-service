import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { XMLParser } from "fast-xml-parser";
import timezoneData from "tzdata/timezone-data.json" with { type: "json" };
import TimezoneService from "../src/index.ts";
import { windowsZones } from "../src/generated/windowsZones.ts";

// CLDR does not map these zones. ianaToWindows has its own mapping for them.
const zonesWithoutCldrMapping = [
  "Antarctica/Troll",
  "EST5EDT",
  "CST6CDT",
  "MST7MDT",
  "PST8PDT",
];

function readCldrMapping(): Record<string, string> {
  const xml = fs.readFileSync(
    path.join(path.resolve(), "./scripts/data/windowsZones.xml"),
    "utf-8"
  );
  const data = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  }).parse(xml);
  const mapping: Record<string, string> = {};
  for (const zone of data.supplementalData.windowsZones.mapTimezones.mapZone) {
    for (const ianaName of zone["@_type"].split(" ")) {
      mapping[ianaName] ??= zone["@_other"];
    }
  }
  return mapping;
}

function canonicalIanaName(ianaName: string): string | undefined {
  const entry = (timezoneData as any).zones[ianaName];
  if (typeof entry === "string") return entry;
  return entry ? ianaName : undefined;
}

const cldrMapping = readCldrMapping();

function cldrWindowsZone(ianaName: string): string | undefined {
  if (cldrMapping[ianaName]) return cldrMapping[ianaName];
  const canonical = canonicalIanaName(ianaName);
  if (!canonical) return undefined;
  if (cldrMapping[canonical]) return cldrMapping[canonical];
  const listedAlias = Object.keys(cldrMapping).find(
    (listed) => canonicalIanaName(listed) === canonical
  );
  return listedAlias ? cldrMapping[listedAlias] : undefined;
}

describe("Windows zones", () => {
  it.each(moment.tz.names())(
    "moment-timezone '%s' zone maps to a Windows zone",
    async (tzName) => {
      const windowsZone = TimezoneService.Timezone.ianaToWindows(tzName);
      expect(windowsZone).toBeTruthy();
    }
  );

  it.each(
    moment.tz.names().filter((name) => !zonesWithoutCldrMapping.includes(name))
  )("moment-timezone '%s' zone maps to its CLDR Windows zone", (tzName) => {
    const expected = cldrWindowsZone(tzName);
    expect(expected).toBeTruthy();
    expect(TimezoneService.Timezone.ianaToWindows(tzName)).toEqual(expected);
  });

  it.each([
    ["Europe/Berlin", "W. Europe Standard Time"],
    ["Europe/Copenhagen", "Romance Standard Time"],
    ["Asia/Riyadh", "Arab Standard Time"],
    ["Asia/Dubai", "Arabian Standard Time"],
    ["Europe/Belgrade", "Central Europe Standard Time"],
    ["America/Edmonton", "Alberta Standard Time"],
    ["Canada/Mountain", "Alberta Standard Time"],
    ["America/Inuvik", "Alberta Standard Time"],
    ["America/Vancouver", "British Columbia Standard Time"],
    ["Canada/Pacific", "British Columbia Standard Time"],
    ["America/Winnipeg", "Manitoba Standard Time"],
    ["Canada/Central", "Manitoba Standard Time"],
    ["America/Denver", "Mountain Standard Time"],
  ])("'%s' maps to '%s'", (ianaName, windowsZone) => {
    expect(TimezoneService.Timezone.ianaToWindows(ianaName)).toEqual(
      windowsZone
    );
  });

  it.each(Object.keys(windowsZones))(
    "windows zone '%s' is accepted and converted to IANA",
    async (tzName) => {
      const tz = new TimezoneService.Timezone(tzName);
      expect(tz.validated).toBeTruthy();
      expect(tz.ianaName).toBeTruthy();
      expect(moment.tz.zone(tz.ianaName)?.name).toEqual(tz.ianaName);
    }
  );
});
