#!/bin/sh

# Generate windows zone mappings
tsx ./scripts/generateWindowsNames.ts

# Generate canonical zone mapping
tsx ./scripts/generateCanonicalNames.ts

# Generate iCalendar VTIMEZONE data
tsx ./scripts/generateIcsComponents.ts

# Generate city mapping
tsx ./scripts/generateRegionMapping.ts