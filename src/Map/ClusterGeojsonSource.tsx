import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HeatmapLayer, CircleLayer } from "mapbox-gl";
import { Source, Layer } from 'react-map-gl';
import pako from 'pako';

const MAX_ZOOM_LEVEL = 15;

const heatmapLayer: HeatmapLayer = {
  id: 'geolife-cluster-geojson--heatmap',
  type: 'heatmap',
  maxzoom: MAX_ZOOM_LEVEL,
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ["coalesce", ['get', 'point_count'], 1], 0, 0, 6, 1],
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
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.9, MAX_ZOOM_LEVEL, 0.2]
  }
};

const circleLayer: CircleLayer = {
  id: 'geolife-cluster-geojson--circle',
  type: 'circle',
  minzoom: MAX_ZOOM_LEVEL,
  paint: {}
};

export const ClusterGeojsonSource: FC = () => {
  const [searchParams] = useSearchParams(new URLSearchParams());
  const limit = +(searchParams.get('limit') ?? 500000);
  const [data, setData] = useState<any>(undefined);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/geolife-1m.geojson.gz`)
      .then(resp => resp.arrayBuffer())
      .then(buf => new Blob([pako.inflate(buf)], { type: 'application/json' }).text())
      .then(text => JSON.parse(text))
      .then(json => {
        setData({
          ...json,
          features: json.features.slice(0, limit)
        })
      })
      .catch(err => console.error('Could not load data', err)); // eslint-disable-line
  }, [limit]);

  if (!data) {
    return null;
  }

  return (
    <Source 
      type="geojson" 
      data={data}
      cluster={true}
      clusterMinPoints={2}
      clusterRadius={10}
      clusterMaxZoom={MAX_ZOOM_LEVEL}
    >
      <Layer {...heatmapLayer} />
      <Layer {...circleLayer} />
    </Source>
  );
};
