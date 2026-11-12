/**
 * VTIMEZONE observances for canonical zones whose timezones-ical-library block is wrong in the
 * near future. The library writes only a zone's current recurring rules, so it cannot express a
 * one-off change such as a skipped transition. Each entry replaces the observances of the zone and
 * of its aliases. tests/icsZones.spec.ts compares every block with moment-timezone and fails when
 * a zone needs an entry, or when an entry is no longer right.
 *
 * Remove an entry when the library's block for the zone passes that test again.
 */
export const icsObservanceOverrides: Record<string, string> = {
  // tzdata 2026f: Cuba did not fall back on 2026-11-01 and keeps -04 until 2027-11-07.
  "America/Havana": [
    "BEGIN:STANDARD",
    "TZNAME:CST",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "DTSTART:19701101T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU;UNTIL=20251102T050000Z",
    "END:STANDARD",
    "BEGIN:STANDARD",
    "TZNAME:CST",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "DTSTART:20271107T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    // No spring-forward in 2027: the clocks are already at -04 then.
    "BEGIN:DAYLIGHT",
    "TZNAME:CDT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "DTSTART:19700308T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU;UNTIL=20260308T050000Z",
    "END:DAYLIGHT",
    "BEGIN:DAYLIGHT",
    "TZNAME:CDT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "DTSTART:20280312T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
  ].join("\r\n"),
};
