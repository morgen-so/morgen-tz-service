import { getTimeZones } from "@vvo/tzdb";
const dbData = getTimeZones({ includeUtc: true });
const tzdbMap = {};
dbData.forEach((tz) => {
    tzdbMap[tz.name] = tz;
    tz.group.forEach((group) => {
        tzdbMap[group] = tz;
    });
});
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
export function getCanonicalIanaName(name) {
    // exception, Etc/UTC is actually the canonical one, but UTC is widely recognized more understood
    if (utcAliases.includes(name))
        return "UTC";
    if (name.includes("Etc/GMT"))
        return name;
    return tzdbMap[name]?.name;
}
//# sourceMappingURL=utils.js.map