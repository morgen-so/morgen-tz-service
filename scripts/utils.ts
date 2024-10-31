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

const utcAliases = [
  "Z",
  "GMT",
  "GMT+0",
  "GMT-0",
  "GMT0",
  "Etc/GMT",
  "Etc/GMT+0",
  "Etc/GMT-0",
  "Etc/GMT0",
  "Etc/UCT",
  "Etc/UTC",
  "Etc/Universal",
  "Universal",
  "Etc/Zulu",
  "Zulu",
  "Etc/Greenwich",
  "Greenwich",
];

export function getCanonicalIanaName(name: string): string | undefined {
  // exception, Etc/UTC is actually the canonical one, but UTC is widely recognized more understood
  if (utcAliases.includes(name)) return "UTC";
  if (name.includes("Etc/GMT")) return name;
  return getCanonicalName_(name);
}
