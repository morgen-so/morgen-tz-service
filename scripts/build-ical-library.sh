#!/bin/sh
# Builds timezones-ical-library from source with an IANA tzdata release and
# replaces node_modules/timezones-ical-library/dist with the result.
# Use it when the npm release of timezones-ical-library is behind IANA.
# Needs git, curl, make, a C compiler, pkg-config and glib (brew install glib).
#
# Usage: sh scripts/build-ical-library.sh <tzdata version> [library commit]

set -eu

TZDATA_VERSION="${1:?usage: sh scripts/build-ical-library.sh <tzdata version, e.g. 2026e> [library commit]}"
LIBRARY_COMMIT="${2:-07ada5679043d60c58d7f5c8ea5825154e0282e2}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git init -q "$WORK/lib"
cd "$WORK/lib"
git fetch -q --depth 1 https://github.com/add2cal/timezones-ical-library.git "$LIBRARY_COMMIT"
git checkout -q FETCH_HEAD
npm ci --ignore-scripts --no-audit --no-fund

cd src/vzic
make -s vzic
mkdir tzdata
curl -sSfL "https://data.iana.org/time-zones/releases/tzdata${TZDATA_VERSION}.tar.gz" | tar -xz -C tzdata
./vzic --olson-dir tzdata --output-dir output
# The upstream update script adds these aliases. Keep them so the built
# database matches an upstream release.
cd output
for pair in PT:PST8PDT MT:MST7MDT CT:CST6CDT ET:EST5EDT; do
  ln -s "${pair#*:}.ics" "${pair%%:*}.ics"
done
cd ../..
# db-generator.js appends to its output files.
rm -rf db
mkdir db
node ../scripts/db-generator.js
cd ..
node scripts/build.js

rm -rf "$ROOT/node_modules/timezones-ical-library/dist"
cp -R dist "$ROOT/node_modules/timezones-ical-library/dist"
echo "timezones-ical-library $LIBRARY_COMMIT built with tzdata $TZDATA_VERSION"
