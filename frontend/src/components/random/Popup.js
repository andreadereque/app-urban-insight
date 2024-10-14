import React from 'react';
import { Popup } from 'react-leaflet';

const RestaurantPopup = ({ position, count }) => {
  return (
    <Popup position={position}>
      <div>
        <h3>Restaurantes filtrados</h3>
        <p>Número de restaurantes de este tipo: {count}</p>
      </div>
    </Popup>
  );
};

export default RestaurantPopup;
