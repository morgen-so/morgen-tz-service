import { DateTime } from "luxon";
import moment from "moment-timezone";

/**
 * Loops through all the zones of moment-timezone and checks if they are
 * recognized by Luxon. Prints a warning if they are not.
 */
export function checkLuxonCompatibility() {
  const zones = moment.tz.names();
  for (const zone of zones) {
    const dt = DateTime.fromISO("2022-01-01T00:00:00.000Z", { zone });
    if (!dt.isValid) {
      console.warn(`Timezone Service: zone ${zone} is not recognized by Luxon`);
    }
  }
}
