import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const EmptyLocalMarker = ({ local, icon, onPopupOpen, onMarkerClick }) => {
  const coordinates = local.Coordinates || [];

  if (coordinates.length === 2) {
    const [lng, lat] = coordinates;
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return (
        <Marker
          position={[lat, lng]}
          icon={icon}
          eventHandlers={{
            click: () => {
              onPopupOpen(lat, lng);
              if (typeof onMarkerClick === 'function') {
                onMarkerClick(local);
              }
            },
            popupopen: () => {
              onPopupOpen(lat, lng);
              if (typeof onMarkerClick === 'function') {
                onMarkerClick(local);
              }
            },
          }}
        >
          <Popup>
            <h2 style={{ margin: '0', fontSize: '16px' }}>{local.Título}</h2>
            <p style={{ margin: '0' }}>Precio total: {local['Precio total (€)'] * 1000} €</p>
            <p>Precio por m²: {local['Precio (€/m2)']} €/m²</p>
            <p>Superficie: {local['Superficie (m2)']} m²</p>
            <p>Accesibilidad: {parseFloat(local.Accesibilidad).toFixed(2)}</p>
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
