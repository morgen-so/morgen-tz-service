# Morgen Timezone Service

This module is used by Morgen desktop and backend services to convert between IANA timezone names and other formats.
It relies on data from the following sources:
- `moment-timezone` (https://github.com/moment/moment-timezone)
- `@vvo/tzdb` (https://github.com/vvo/tzdb)
- `timezones-ical-library` (https://github.com/arethetypeswrong/timezones-ical-library)
- `tzdata` (https://www.npmjs.com/package/tzdata)

## Available conversions

### IANA to Windows
Required to create events with the EWS API.

```ts
const windowsZone = TimezoneService.Timezone.ianaToWindows(ianaZone);
```

### Windows to IANA
Requires when fetching events from EWS or the Graph API, as we always store the zone in the database as a IANA zone.

```ts
const ianaZone = new TimezoneService.Timezone(windowsZone).ianaName;
```

### IANA or Windows zone to IANA canonical
This is needed because clients may not be able to handle the full IANA zone names.
For example, the mobile app might have a limited number of zones in the local database
therefore we want to avoid sending legacy aliases.

```ts
const canonicalZone = new TimezoneService.Timezone(ianaZone).ianaName;
```

Interestingly, both `moment-timezone` and `@vvo/tzdb` are unreliable for this opeation
For example:
- `moment-timezone` says `Europe/Kiev` is canonical, while it should be `Europe/Kyiv`
- `@vvo/tzdb` groups names by country and offset, creating spurious links, like `Australia/Hobart` is linked to `Australia/syndey` but it should not.
  
We found that `tzdata` is the most reliable source for this operation.

### IANA or Windows zone to VTIMEZONE
This is needed to generate iCalendar VTIMEZONE components, which in turn is required to generate iCalendar files.

```ts
const vtimezone = TimezoneService.Timezone.getVTimeZoneComponent(zone);
```

## How to update

_TODO: add a script to automate this, ideally with a CI job._

- Update `moment-timezone`, `luxon`, `tzdata`, `@vvo/tzdb` and `timezones-ical-library` to the latest versions in package.json
- Use `npm update` to update the dependencies. Notice,  `npm install` will not work because of the peer dependencies.
- Update `scripts/data/windowsZones.xml` with the [latest Windows timezone data](https://github.com/unicode-org/cldr/blob/main/common/supplemental/windowsZones.xml).
- Run `npm run build` to update the data files and run the tests.
- Push the changes to the repository.
- Update the commit hash in the `package.json` of other projects fetching this repo from Github.




