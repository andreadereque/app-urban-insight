import React from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';

const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";

const AveragePriceMap = ({ averagePrices, neighborhoods }) => {
  const transformCoordinates = (coordinates) => {
    return coordinates[0].map(coord => {
      const [easting, northing] = coord;
      const latLng = proj4(utmZone, "WGS84", [easting, northing]);
      return [latLng[1], latLng[0]]; // Leaflet usa [lat, lng]
    });
  };

  const getColor = (price) => {
    return price > 50 ? '#084594' :
           price > 40 ? '#2171b5' :
           price > 30 ? '#4292c6' :
           price > 20 ? '#6baed6' :
           price > 10 ? '#9ecae1' :
           price > 5  ? '#c6dbef' :
                        '#deebf7';
  };

  const style = (feature) => {
    const barrio = feature.properties.name;
    const priceData = averagePrices.find(item => item.Barrio === barrio);
    const price = priceData ? priceData.average_price : 0;
    return {
      fillColor: getColor(price),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const transformedCoordinates = transformCoordinates(feature.geometry.coordinates);
    layer.setLatLngs(transformedCoordinates);
  };

  return (
    <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '400px', width: '100%' }} attributionControl={false}>
      <GeoJSON data={neighborhoods} style={style} onEachFeature={onEachFeature} />
    </MapContainer>
  );
};

export default AveragePriceMap;
