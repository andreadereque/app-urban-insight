// MapController.js
import React from 'react';
import { TileLayer, GeoJSON } from 'react-leaflet';

const MapController = ({ neighborhoods }) => (
  <>
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
    />
    {neighborhoods && (
      <GeoJSON data={neighborhoods} style={{ color: '#4CAF50', weight: 2 }} />
    )}
  </>
);

export default MapController;
