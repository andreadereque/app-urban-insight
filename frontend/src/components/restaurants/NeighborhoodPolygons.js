import React, { useEffect } from 'react';
import L from 'leaflet';
import proj4 from 'proj4';

const NeighborhoodPolygons = ({ mapRef, neighborhoods, showNeighborhoods, heatmapActive, restaurantCounts, getColorForRestaurantCount, clearLayers, neighborhoodLayersRef }) => {
  useEffect(() => {
    if (mapRef?.current) {
      if (showNeighborhoods && neighborhoods.length) {
        clearLayers();
        const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";

        neighborhoods.forEach((neighborhood) => {
          const coordinates = neighborhood.Geometry.coordinates[0];
          const restaurantCount = restaurantCounts[neighborhood.Nombre] || 0;
          const color = heatmapActive ? getColorForRestaurantCount(restaurantCount) : 'purple';

          const latLngs = coordinates.map(coord => {
            const [easting, northing] = coord;
            const latLng = proj4(utmZone, "WGS84", [easting, northing]);
            return [latLng[1], latLng[0]];
          });

          const polygon = L.polygon(latLngs, { color, fillOpacity: 0.5 }).addTo(mapRef.current);
          neighborhoodLayersRef?.current?.push(polygon);
        });
      } else {
        clearLayers();
      }
    }
  }, [mapRef, neighborhoods, showNeighborhoods, heatmapActive, restaurantCounts, getColorForRestaurantCount, clearLayers, neighborhoodLayersRef]);

  return null;
};

export default NeighborhoodPolygons;
