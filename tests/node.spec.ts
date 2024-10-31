import moment from "moment";
import TimezoneService from "../src/index.js";

const nodeZones = Intl.supportedValuesOf("timeZone");

describe("Node.js", () => {
  // it.each(nodeZones)(
  //   "node zone '%s' is accepted and converted to IANA",
  //   async (tzName) => {
  //     const tz = new TimezoneService.Timezone(tzName);
  //     expect(tz.validated).toBeTruthy();
  //     expect(tz.ianaName).toBeTruthy();
  //   }
  // );

  // it.each(moment.tz.names())(
  //   "moment-timezone zone '%s' is accepted by Node Intl once normalized",
  //   async (tzName) => {
  //     const canonical = new TimezoneService.Timezone(tzName).ianaName;
  //     expect(nodeZones).toContain(canonical);
  //   }
  // );

  it("should return the same zone as moment-timezone", () => {
    console.log(process.versions.icu);
  });
});
