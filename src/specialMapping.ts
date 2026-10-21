// This file contains special mappings that are not part of the IANA database

export const specialMapping: Record<string, string> = {
  "tzone://Microsoft/Utc": "Etc/UTC", // Microsoft often returns this for UTC
  Z: "Etc/UTC", // ical.js returns this for UTC
};

// Since tzdata 2026d these POSIX-style names are zones, not links, and CLDR
// windowsZones.xml does not map them.
export const windowsSpecialMapping: Record<string, string> = {
  EST5EDT: "Eastern Standard Time",
  CST6CDT: "Central Standard Time",
  MST7MDT: "Mountain Standard Time",
  PST8PDT: "Pacific Standard Time",
};
