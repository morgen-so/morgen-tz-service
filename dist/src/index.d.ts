/**
 * Timezone service.
 *
 */
declare class Timezone {
    private canonicalName_;
    private validated_;
    constructor(tzName: string);
    get ianaName(): string;
    get validated(): boolean;
    static ianaToWindows(ianaName: string): string | undefined;
    /**
     * Given a IANA name, resolve for the default "alias" in the IANA db.
     * If the name is not found, returns the input.
     * @param tzName
     */
    static findCanonicalIANAName(ianaName: string): string;
    /**
     * Returns a dictionary that maps from tzid to the corresponding VTIMEZONE ical string.
     *
     */
    static getVTimeZoneComponent(): {
        [x: string]: string;
    };
    /**
     * Returns the VTIMEZONE component of the current zone
     *
     */
    getVTimeZoneComponent(): string | undefined;
    /**
     * Try to map given timezone to an IANA canonical name.
     *
     * @param tzName
     */
    private getIanaTzName;
    private extractCities;
    private mapOffsetToIANATimeZone;
    /**
     *  If both moment-timezone and ews failed to recognize the timezone name
     *  we may have something not standard such as
     *  - "/freeassociation.sourceforge.net/Europe/Berlin"
     *  - "(UTC+01:00) Amsterdam, Berlin, Bern, Rom, Stockholm, Wien"
     *  - "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"
     *  - "GMT+0200"
     * @param tzName
     * @returns
     */
    private bestGuess;
}
export { Timezone };
//# sourceMappingURL=index.d.ts.map