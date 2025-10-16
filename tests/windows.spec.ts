import moment from "moment-timezone";
import TimezoneService from "../src/index.ts";
import { windowsZones } from "../src/generated/windowsZones.ts";

describe("Windows zones", () => {
  it.each(moment.tz.names())(
    "moment-timezone '%s' zone maps to a Windows zone",
    async (tzName) => {
      const windowsZone = TimezoneService.Timezone.ianaToWindows(tzName);
      expect(windowsZone).toBeTruthy();
    }
  );

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
