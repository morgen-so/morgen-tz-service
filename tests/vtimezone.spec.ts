import TimezoneService from "../src/index.ts";

const icsZones = TimezoneService.Timezone.getVTimeZoneComponents();

function vtimezoneOffsets(zone: string) {
  const block = icsZones[zone];
  return {
    hasRecurringChange: block.includes("RRULE:"),
    offsets: [...block.matchAll(/^TZOFFSETTO:(.+)$/gm)].map((m) => m[1].trim()),
  };
}

describe("VTIMEZONE components", () => {
  it.each([
    ["America/Vancouver", "-0700"],
    ["Canada/Pacific", "-0700"],
    ["America/Edmonton", "-0600"],
    ["Canada/Mountain", "-0600"],
    ["America/Inuvik", "-0600"],
    ["America/Winnipeg", "-0500"],
    ["Canada/Central", "-0500"],
    ["Africa/Casablanca", "+0000"],
    ["America/Coyhaique", "-0300"],
  ])("%s has a permanent offset of %s", (zone, offset) => {
    expect(vtimezoneOffsets(zone)).toEqual({
      hasRecurringChange: false,
      offsets: [offset],
    });
  });

  it("America/Los_Angeles still changes between -0800 and -0700", () => {
    const { hasRecurringChange, offsets } =
      vtimezoneOffsets("America/Los_Angeles");
    expect(hasRecurringChange).toBe(true);
    expect(offsets.sort()).toEqual(["-0700", "-0800"]);
  });
});
