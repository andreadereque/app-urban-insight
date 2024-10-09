// EmptyLocalsMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import EmptyLocalMarkers from './EmptyLocalMarkers';
import EmptyLocalFilters from './EmptyLocalFilters';
import MapController from './MapController';
import L from 'leaflet';
import idealistaIconPath from '../../assets/icons/ide.png';
import '../../styles/EmptyLocalMaps.css'

const EmptyLocalsMap = () => {
  const [locals, setLocals] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filters, setFilters] = useState({ barrio: '', precioMin: '', precioMax: '' });

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

  const handleFilterChange = (filterName, filterValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: filterValue,
    }));
  };

  // Filter locals based on selected filters
  const filteredLocals = locals.filter((local) => {
    const matchesBarrio = filters.barrio ? local.Barrio === filters.barrio : true;
    const matchesPrecioMin = filters.precioMin ? parseFloat(local.Precio) >= parseFloat(filters.precioMin) : true;
    const matchesPrecioMax = filters.precioMax ? parseFloat(local.Precio) <= parseFloat(filters.precioMax) : true;
    return matchesBarrio && matchesPrecioMin && matchesPrecioMax;
  });

  const barrios = [...new Set(locals.map((local) => local.Barrio))].filter(Boolean);

  const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
  
    let size = 'large';
    let dimension = 40; // Reducir el tamaño a 40 o cualquier valor menor
  
    if (count < 10) {
      size = 'small';
      dimension = 25; // Reducir aún más para los clústeres más pequeños
    } else if (count >= 10 && count < 50) {
      size = 'medium';
      dimension = 35;
    }
  
    return new L.DivIcon({
      html: `<div class="cluster-icon ${size}">${count}</div>`,
      className: 'cluster-icon-wrapper',
      iconSize: L.point(dimension, dimension, true),
    });
  };
  
  
  

  return (
    <>
      <EmptyLocalFilters barrios={barrios} onFilterChange={handleFilterChange} />
      <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '90vh', width: '100%' }}>
        <MapController neighborhoods={neighborhoods} />
        {typeof MarkerClusterGroup !== 'undefined' && (
          <MarkerClusterGroup
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
          >
            <EmptyLocalMarkers filteredLocals={filteredLocals} icon={icon} />
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </>
  );
};

export default EmptyLocalsMap;
