# morgen-tz-service


### Canonical IANA names

Both `moment-timezone` and `@vvo/tzdb` are unreliable for this.
For example:
- `moment-timezone` says `Europe/Kiev` is the canonical, while it shoudl be `Europe/Kyiv`
- `@vvo/tzdb` groups names by coutry and offset, creating spurious links, liek `Australia/Hobart` is linked to `Australia/syndey` but it should not.

