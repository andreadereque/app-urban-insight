import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const RestaurantMarkers = ({ filteredRestaurants, icon }) => (
  <>
    {filteredRestaurants.map((restaurant, index) => {
      const coordinates = restaurant.Coordinates || [];
      if (coordinates.length === 2) {
        const [lng, lat] = coordinates;
        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
          return (
            <Marker key={index} position={[lat, lng]} icon={icon}>
              <Popup>
                <h2 style={{ margin: '0', fontSize: '16px' }}>{restaurant.Nombre}</h2>
                <p style={{ margin: '0' }}>Tipo: {restaurant.Tipo}</p>
                <p>Nota: {restaurant.Nota}</p>
                <p>Número de Reseñas: {restaurant['Nº Reseñas']}</p>
                <p>Barrio: {restaurant.Barrio}</p>
                <p>Dirección: {restaurant.Dirección}</p>
              </Popup>
            </Marker>
          );
        }
      }
      return null;
    })}
  </>
);

export default RestaurantMarkers;
