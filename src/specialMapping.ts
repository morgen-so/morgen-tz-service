// This file contains special mappings that are not part of the IANA database

export const specialMapping: Record<string, string> = {
  "tzone://Microsoft/Utc": "Etc/UTC", // Microsoft often returns this for UTC
  Z: "Etc/UTC", // ical.js returns this for UTC
};
