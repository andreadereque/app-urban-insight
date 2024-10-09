import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import EmptyLocalMarkers from './EmptyLocalMarkers';
import L from 'leaflet';
import idealistaIconPath from '../../assets/icons/ide.png';

const EmptyLocalsMap = () => {
  const [locals, setLocals] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  // Define the custom icon for markers
  const icon = new L.Icon({
    iconUrl: idealistaIconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Fetch data from backend
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/empty_locals')
      .then((response) => response.json())
      .then((data) => {
        setLocals(data);
      })
      .catch((error) => console.error('Error fetching empty locals:', error));

    fetch('http://127.0.0.1:5000/api/demographics')
      .then((response) => response.json())
      .then((data) => {
        setNeighborhoods(data);
      })
      .catch((error) => console.error('Error fetching demographics:', error));
  }, []);

  return (
    <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '100vh', width: '100%' }}>
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
    />
  
    {/* Check if MarkerClusterGroup is available before rendering */}
    {typeof MarkerClusterGroup !== 'undefined' && (
      <MarkerClusterGroup>
        <EmptyLocalMarkers filteredLocals={locals} icon={icon} />
      </MarkerClusterGroup>
    )}
  
    {neighborhoods && (
      <GeoJSON data={neighborhoods} style={{ color: '#4CAF50', weight: 2 }} />
    )}
  </MapContainer>
  
  );
};

export default EmptyLocalsMap;
