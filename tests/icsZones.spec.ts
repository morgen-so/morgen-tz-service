import moment from "moment-timezone";
import { icsZones } from "../src/generated/icsZones.ts";

// The VTIMEZONE blocks must give the same UTC offsets as moment-timezone for the coming year.
// When this fails after a tzdata update, the library could not express the change: add the zone
// to scripts/icsOverrides.ts. Later years are not checked, because some zones (Israel, Chile,
// Greenland, Egypt, Gaza) have rules that a single yearly RRULE can only approximate.
const CHECK_DAYS = 366;
const STEP_MS = 3 * 3600 * 1000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function parseOffset(value: string): number {
  const sign = value.startsWith("-") ? -1 : 1;
  return sign * (Number(value.slice(1, 3)) * 60 + Number(value.slice(3, 5)));
}

function parseUtc(value: string): number {
  return Date.UTC(+value.slice(0, 4), +value.slice(4, 6) - 1, +value.slice(6, 8), +value.slice(9, 11), +value.slice(11, 13));
}

function dayOfMonth(year: number, month: number, byDay: string): number {
  const [, nth, weekdayName] = byDay.match(/^(-?\d)([A-Z]{2})$/)!;
  const weekday = WEEKDAYS.indexOf(weekdayName!);
  if (Number(nth) > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return 1 + ((weekday - first + 7) % 7) + 7 * (Number(nth) - 1);
  }
  const last = new Date(Date.UTC(year, month, 0));
  return last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7);
}

/** Every transition of a VTIMEZONE block up to `endYear`, as [UTC ms, offset after in minutes]. */
function transitions(block: string, endYear: number): [number, number][] {
  const result: [number, number][] = [];
  for (const component of block.split(/BEGIN:(?:STANDARD|DAYLIGHT)/).slice(1)) {
    const field = (name: string) => component.match(new RegExp(`\\n${name}:([^\\r\\n]*)`))?.[1];
    const from = parseOffset(field("TZOFFSETFROM")!);
    const to = parseOffset(field("TZOFFSETTO")!);
    const start = field("DTSTART")!;
    const [hour, minute] = [+start.slice(9, 11), +start.slice(11, 13)];
    const at = (year: number, month: number, day: number) =>
      Date.UTC(year, month - 1, day, hour, minute) - from * 60000;
    const rule = field("RRULE");
    if (!rule) {
      result.push([at(+start.slice(0, 4), +start.slice(4, 6), +start.slice(6, 8)), to]);
      continue;
    }
    const parts = Object.fromEntries(rule.split(";").map((part) => part.split("=")));
    const unsupported = Object.keys(parts).filter((key) => !["FREQ", "BYMONTH", "BYDAY", "UNTIL"].includes(key));
    if (unsupported.length || parts.FREQ !== "YEARLY") throw new Error(`Unsupported RRULE ${rule}`);
    const until = parts.UNTIL ? parseUtc(parts.UNTIL) : Infinity;
    for (let year = +start.slice(0, 4); year <= endYear; year++) {
      const time = at(year, +parts.BYMONTH, dayOfMonth(year, +parts.BYMONTH, parts.BYDAY));
      if (time > until) break;
      result.push([time, to]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}

describe("icsZones", () => {
  const from = Date.now();
  const to = from + CHECK_DAYS * 24 * 3600 * 1000;
  const endYear = new Date(to).getUTCFullYear() + 1;

  it.each(Object.keys(icsZones))("%s matches moment-timezone for the coming year", (zone) => {
    const zoneTransitions = transitions(icsZones[zone]!, endYear);
    const momentZone = moment.tz.zone(zone)!;
    for (let time = from; time < to; time += STEP_MS) {
      const before = zoneTransitions.filter(([at]) => at <= time);
      const icsOffset = (before[before.length - 1] ?? zoneTransitions[0])![1];
      expect({ at: new Date(time).toISOString(), offset: icsOffset }).toEqual({
        at: new Date(time).toISOString(),
        offset: -momentZone.utcOffset(time) || 0,
      });
    }
  });
});
