import moment from "moment";
import { DateTime } from "luxon";
import TimezoneService from "../src/index.js";

const nodeZones = Intl.supportedValuesOf("timeZone");

describe("Node.js", () => {
  it.each(nodeZones)(
    "node zone '%s' is accepted and converted to IANA",
    async (tzName) => {
      const tz = new TimezoneService.Timezone(tzName);
      expect(tz.validated).toBeTruthy();
      expect(tz.ianaName).toBeTruthy();
    }
  );

  it.each(moment.tz.names())(
    "moment-timezone zone '%s' is accepted by Luxon",
    async (zone) => {
      expect(DateTime.local({ zone }).isValid).toEqual(true);
    }
  );
});
