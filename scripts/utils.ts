import _ from "lodash";
import timezoneData from "tzdata/timezone-data.json";

function getCanonicalName_(name: string) {
  const candicate = (timezoneData as any).zones[name];
  if (!candicate) return undefined;
  // If the name is an alias, it maps to the canonical name (a string).
  // If the name if already canonical, it maps to an array with info.
  // We are not interested in the info but we can use this to know
  // whether the name is canonical or not.
  if (typeof candicate === "string") return candicate;
  else return name;
}

export function getCanonicalIanaName(name: string): string | undefined {
  return getCanonicalName_(name);
}
