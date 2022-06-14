import { FC } from "react"
import { Source, Layer } from "react-map-gl"
import { HeatmapLayer, CircleLayer } from "mapbox-gl"

const MAX_ZOOM_LEVEL = 12;

const heatmapLayer: HeatmapLayer = {
  id: "geolife-mbtile-sw--heatmap",
  "source-layer": "geolife",
  type: 'heatmap',
  maxzoom: MAX_ZOOM_LEVEL,
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, MAX_ZOOM_LEVEL, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(33,102,172,0)',
      0.2,
      'rgb(103,169,207)',
      0.4,
      'rgb(209,229,240)',
      0.6,
      'rgb(253,219,199)',
      0.8,
      'rgb(239,138,98)',
      0.9,
      'rgb(255,201,101)'
    ],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.62, MAX_ZOOM_LEVEL, 0.1]
  }
};

const circleLayer: CircleLayer = {
  id: "geolife-mbtile-sw--points",
  "source-layer": "geolife",
  type: 'circle',
  minzoom: MAX_ZOOM_LEVEL,
  paint: {}
};

export const MbtilesServiceWorkerSource: FC = () => {

  return (
    <Source 
      type="vector" 
      tiles={[`${process.env.PUBLIC_URL}/geolife-full-v12.mbtiles?tile={z},{x},{y}`]}
      maxzoom={MAX_ZOOM_LEVEL}
    >
      <Layer {...heatmapLayer} />
      <Layer {...circleLayer} />
    </Source>
  )
};
