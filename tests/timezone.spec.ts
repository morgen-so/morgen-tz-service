import TimezoneService from "../src/index.ts";

const validTzNames = [
  "Europe/Zurich",
  "Pacific Standard Time",
  "W. Europe Standard Time",
  "/freeassociation.sourceforge.net/Europe/Berlin",
  "(UTC+01:00) Amsterdam, Berlin, Bern, Rom, Stockholm, Wien",
  "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
  "GMT+0200",
  "UTC+0300",
  "US/Central",
];

const invalidTzNames = ["", "invalid"];

describe("Timezone general", () => {
  it.each(invalidTzNames)(
    "detects invalid timezone name '%s'",
    async (tzName) => {
      const tz = new TimezoneService.Timezone(tzName);
      expect(tz.validated).toBeFalsy();
    }
  );

  it.each(validTzNames)(
    "maps valid timezone '%s' to standard IANA",
    async (tzName) => {
      const tz = new TimezoneService.Timezone(tzName);
      expect(tz.validated).toBeTruthy();
    }
  );

  it("should clean zones with invalid characters as prefix or suffic", async () => {
    expect(
      new TimezoneService.Timezone("America/Los_Angeles ").ianaName
    ).toEqual("America/Los_Angeles");
    expect(
      new TimezoneService.Timezone(" America/Los_Angeles").ianaName
    ).toEqual("America/Los_Angeles");
    expect(
      new TimezoneService.Timezone("America/Los_Angeles  ").ianaName // tab
    ).toEqual("America/Los_Angeles");
    expect(
      new TimezoneService.Timezone("America/Los_Angeles\u{13}").ianaName
    ).toEqual("America/Los_Angeles");
    expect(
      new TimezoneService.Timezone("America/Los_Angeles&#13").ianaName
    ).toEqual("America/Los_Angeles");
    expect(new TimezoneService.Timezone("US/Pacific&#13").ianaName).toEqual(
      "America/Los_Angeles"
    );
  });

  it("maps (UTC+01:00) Amsterdam zone description to Europe/Berlin", async () => {
    const msTzName =
      "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna";
    const tz = new TimezoneService.Timezone(msTzName);
    expect(tz.validated).toBeTruthy();
    expect(tz.ianaName).toEqual("Europe/Brussels");
  });

  it("maps (UTC+02:00) Amsterdam zone description to Europe/Berlin", async () => {
    const msTzName =
      "(UTC+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna";
    const tz = new TimezoneService.Timezone(msTzName);
    expect(tz.validated).toBeTruthy();
    expect(tz.ianaName).toEqual("Europe/Brussels");
  });

  it("maps Amsterdam zone ID to Europe/Berlin", async () => {
    const msTzName = "W. Europe Standard Time";
    const tz = new TimezoneService.Timezone(msTzName);
    expect(tz.validated).toBeTruthy();
    expect(tz.ianaName).toEqual("Europe/Berlin");
  });

  it("maps 'Central Standard Time (Mexico)' zone ID to America/Mexico_City", async () => {
    const msTzName = "Central Standard Time (Mexico)";
    const tz = new TimezoneService.Timezone(msTzName);
    expect(tz.validated).toBeTruthy();
    expect(tz.ianaName).toEqual("America/Mexico_City");
  });

  it("maps offsets to IANA names", async () => {
    expect(new TimezoneService.Timezone("GMT+0100").ianaName).toEqual(
      "Etc/GMT-1"
    );
    expect(new TimezoneService.Timezone("UTC+0100").ianaName).toEqual(
      "Etc/GMT-1"
    );
  });

  it("normalizes timezone names", async () => {
    expect(new TimezoneService.Timezone("Zulu").ianaName).toEqual("Etc/UTC");
    expect(new TimezoneService.Timezone("Z").ianaName).toEqual("Etc/UTC");
    expect(new TimezoneService.Timezone("Etc/GMT").ianaName).toEqual("Etc/GMT");
    expect(new TimezoneService.Timezone("Etc/GMT+0").ianaName).toEqual(
      "Etc/GMT"
    );
    expect(new TimezoneService.Timezone("Etc/GMT+0").ianaName).toEqual(
      "Etc/GMT"
    );
    expect(new TimezoneService.Timezone("GMT").ianaName).toEqual("Etc/GMT");
    expect(
      new TimezoneService.Timezone("tzone://Microsoft/Utc").ianaName
    ).toEqual("Etc/UTC");
    expect(new TimezoneService.Timezone("Asia/Calcutta").ianaName).toEqual(
      "Asia/Kolkata"
    );
    expect(
      new TimezoneService.Timezone("India Standard Time").ianaName
    ).toEqual("Asia/Kolkata");
    expect(new TimezoneService.Timezone("Europe/Kiev").ianaName).toEqual(
      "Europe/Kyiv"
    );
  });
});
