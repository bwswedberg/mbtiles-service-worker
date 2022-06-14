# Demo

## MBTile Service Worker (~17m points)
Serves vector tiles from mbtiles by intercepting http traffic with service worker.
- ~50mb for "full" data set (dense points were dropped)
- created with tippecanoe `--drop-densest-as-needed`
- Can be further optimized by dialing in tippecanoe config

## GeoJSON Cluster Source (1m & 500k points)
Create a geojson cluster source
- 13mb (~9mb gzip)
- Can be further optimized with via map `source` and `layer` config