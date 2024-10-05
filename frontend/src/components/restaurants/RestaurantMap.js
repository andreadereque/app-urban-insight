import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import HeatmapLegend from './HeatmapLegend';
import RestaurantMarkers from './RestaurantMarkers';
import NeighborhoodPolygons from './NeighborhoodPolygons';
import restIconPath from '../../assets/icons/rest_icon.png';

const restaurantIcon = new L.Icon({
  iconUrl: restIconPath,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="
            background-color: rgba(255, 182, 193, 0.8);
            color: #fff;
            border-radius: 50%;
            padding: 5px;
            border: 1px solid #ff69b4;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            font-weight: bold;
            font-size: 12px;">
            ${count}
          </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(30, 30, true),
  });
};

const RestaurantMap = ({ filteredRestaurants }) => {
  const mapRef = useRef(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [restaurantCounts, setRestaurantCounts] = useState({});
  const neighborhoodLayersRef = useRef([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/demographics")
      .then(response => {
        setNeighborhoods(response.data);
      })
      .catch(error => console.error("Error al cargar los datos de barrios", error));
  }, []);

  useEffect(() => {
    const counts = filteredRestaurants.reduce((acc, restaurant) => {
      const barrio = restaurant.Barrio;
      if (!acc[barrio]) acc[barrio] = 0;
      acc[barrio] += 1;
      return acc;
    }, {});
    setRestaurantCounts(counts);
  }, [filteredRestaurants]);

  const getColorForRestaurantCount = (count) => {
    return count > 150 ? '#800026' :
           count > 120 ? '#BD0026' :
           count > 90  ? '#E31A1C' :
           count > 60  ? '#FC4E2A' :
           count > 30  ? '#FD8D3C' :
           count > 14  ? '#FEB24C' :
                         '#FFEDA0';
  };

  const clearLayers = () => {
    neighborhoodLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    neighborhoodLayersRef.current = [];
  };

  return (
    <div>
      <button
        onClick={() => setShowNeighborhoods(!showNeighborhoods)}
        style={{
          marginBottom: '10px',
          padding: '10px 20px',
          backgroundColor: showNeighborhoods ? '#f7c5cc' : '#e4a0b3',
          color: '#fff',
          border: '2px solid #f3b2c0',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = showNeighborhoods ? '#f9dfe2' : '#f4b6c2'}
        onMouseOut={(e) => e.target.style.backgroundColor = showNeighborhoods ? '#f7c5cc' : '#e4a0b3'}
      >
        {showNeighborhoods ? 'Ocultar Barrios' : 'Mostrar Barrios'}
      </button>
      <button
        onClick={() => setHeatmapActive(!heatmapActive)}
        style={{
          marginBottom: '10px',
          marginLeft: '15px',
          padding: '10px 20px',
          backgroundColor: heatmapActive ? '#ffccac' : '#ffb07c',
          color: '#fff',
          border: '2px solid #ffc3a1',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = heatmapActive ? '#ffe0d0' : '#ffc49b'}
        onMouseOut={(e) => e.target.style.backgroundColor = heatmapActive ? '#ffccac' : '#ffb07c'}
      >
        {heatmapActive ? 'Desactivar Heatmap' : 'Activar Heatmap'}
      </button>
      <MapContainer ref={mapRef} center={[41.3851, 2.1734]} zoom={13} style={{ height: 'calc(100vh - 300px)', width: '100%', position: 'relative' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          <RestaurantMarkers filteredRestaurants={filteredRestaurants} icon={restaurantIcon} />
        </MarkerClusterGroup>
        <NeighborhoodPolygons
          mapRef={mapRef}
          neighborhoods={neighborhoods}
          showNeighborhoods={showNeighborhoods}
          heatmapActive={heatmapActive}
          restaurantCounts={restaurantCounts}
          getColorForRestaurantCount={getColorForRestaurantCount}
          clearLayers={clearLayers}
        />
        {heatmapActive && <HeatmapLegend />}
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;