// EmptyLocalMarker.js
import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const EmptyLocalMarker = ({ local, icon }) => {
  const coordinates = local.Coordinates || [];
  if (coordinates.length === 2) {
    const [lng, lat] = coordinates;
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return (
        <Marker position={[lat, lng]} icon={icon}>
          <Popup>
            <h2 style={{ margin: '0', fontSize: '16px' }}>{local.Título}</h2>
            <p style={{ margin: '0' }}>Precio: {local.Precio}</p>
            <p>Itemdetail: {local.Itemdetail}</p>
            <p>Itemdetail2: {local.Itemdetail2}</p>
            <p>Barrio: {local.Barrio}</p>
            <p>Dirección completa: {local['Dirección completa']}</p>
          </Popup>
        </Marker>
      );
    }
  }
  return null;
};

export default EmptyLocalMarker;
