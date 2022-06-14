import { FC } from 'react';
import MapGL from 'react-map-gl';
import { useParams } from 'react-router-dom';
import { ClusterGeojsonSource } from './ClusterGeojsonSource';
import { MbtilesServiceWorkerSource } from './MbtilesServiceWorkerSource';

export const Map: FC = () => {
  const params = useParams<{ demo: string }>();

  return (
    <MapGL
      style={{ width: '100vw', height: '100vh' }}
      initialViewState={{
        latitude: 38,
        longitude: 118,
        zoom: 3
      }}
      mapStyle="mapbox://styles/mapbox/dark-v9"
      mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN}
    >
      {params.demo === 'mbtiles-service-worker' ? (
        <MbtilesServiceWorkerSource />
      ) : params.demo === 'cluster-source' ? (
        <ClusterGeojsonSource />
      ) : null}
    </MapGL>
  );
}
