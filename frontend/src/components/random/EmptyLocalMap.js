import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import EmptyLocalMarkers from './EmptyLocalMarkers';
import EmptyLocalFilters from './EmptyLocalFilters';
import MapController from './MapController';
import L from 'leaflet';
import idealistaIconPath from '../../assets/icons/ide.png';
import restaurantIconPath from '../../assets/icons/rest_icon.png';
import '../../styles/EmptyLocalFilters.css';
import '../../styles/EmptyLocalMaps.css';
import axios from 'axios';
import CompetitorChart from './CompetitorChart';

const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  let size = 'large';
  let dimension = 50;

  if (count < 10) {
    size = 'small';
    dimension = 25;
  } else if (count >= 10 && count < 50) {
    size = 'medium';
    dimension = 35;
  }

  return new L.DivIcon({
    html: `<div class="cluster-icon-wrapper ${size}">
             <span class="cluster-icon">${count}</span>
           </div>`,
    className: 'custom-cluster',
    iconSize: L.point(dimension, dimension, true),
  });
};

// Componente para resetear el popup cuando cambia el filtro o el marcador
const ResetPopup = ({ map }) => {
  useEffect(() => {
    map.closePopup();
  }, [map]);

  return null;
};

const EmptyLocalsMap = () => {
  const [locals, setLocals] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filters, setFilters] = useState({ barrio: '', precioMin: '', precioMax: '', tipoRestaurante: '' });
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [competitorsData, setCompetitorsData] = useState(null);
  const [localAccessibility, setLocalAccessibility] = useState(null);
  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [selectedPopup, setSelectedPopup] = useState(null);

  const emptyLocalIcon = new L.Icon({
    iconUrl: idealistaIconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const restaurantIcon = new L.Icon({
    iconUrl: restaurantIconPath,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const localsResponse = await fetch('http://127.0.0.1:5000/api/empty_locals');
        const localsData = await localsResponse.json();
        setLocals(localsData);

        const demographicsResponse = await fetch('http://127.0.0.1:5000/api/demographics');
        const demographicsData = await demographicsResponse.json();
        setNeighborhoods(demographicsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Cargar tipos de restaurante
  useEffect(() => {
    const fetchRestaurantTypes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/restaurant_types');
        const types = await response.json();
        setRestaurantTypes(types);
      } catch (error) {
        console.error('Error fetching restaurant types:', error);
      }
    };

    fetchRestaurantTypes();
  }, []);

  const handleFilterChange = (filterName, filterValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: filterValue,
    }));

    if (filterName === 'tipoRestaurante' && filterValue) {
      applyRestaurantFilter(nearbyRestaurants, filterValue);
    }

    // Restablecer el popup cuando cambian los filtros
    setSelectedPopup(null);
  };

  const applyRestaurantFilter = (restaurants, tipoRestaurante, coordinates) => {
    if (!restaurants || restaurants.length === 0) return;

    const filteredRestaurants = restaurants.filter((restaurant) => {
      return tipoRestaurante && restaurant["type"] ? restaurant["type"] === tipoRestaurante : true;
    });

    if (filteredRestaurants.length > 0) {
      setNearbyRestaurants(filteredRestaurants);
      setSelectedPopup({
        position: coordinates || [41.3851, 2.1734],
        count: filteredRestaurants.length,
      });
    } else {
      setSelectedPopup(null);
    }
  };

  const handlePopupOpen = async (lat, lon) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/nearby_restaurants?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error('Error al obtener los restaurantes cercanos');
      }
      const data = await response.json();
      setNearbyRestaurants(data);
      applyRestaurantFilter(data, filters.tipoRestaurante, [lat, lon]);

    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
    }
  };

  const fetchNeighbourCompetitors = async (coordinates) => {
    try {
      const [lon, lat] = coordinates;
      const response = await axios.get('http://127.0.0.1:5000/api/neighbours_competitors', {
        params: {
          lat: lat,
          lon: lon,
        },
      });

      setCompetitorsData(response.data);
    } catch (error) {
      console.error('Error al obtener competidores cercanos:', error);
    }
  };

  const handleMarkerClick = (local) => {
    const coordinates = local["Coordinates"] || [];
    fetchNeighbourCompetitors(coordinates);
    const accesibilidad1 = local['Accesibilidad'];
    setLocalAccessibility(accesibilidad1);

    applyRestaurantFilter(nearbyRestaurants, filters.tipoRestaurante, coordinates);
  };

  const filteredLocals = locals.filter((local) => {
    const matchesBarrio = filters.barrio ? local.Barrio === filters.barrio : true;
    const matchesPrecioMin = filters.precioMin ? parseFloat(local['Precio total (€)']) >= parseFloat(filters.precioMin) : true;
    const matchesPrecioMax = filters.precioMax ? parseFloat(local['Precio total (€)']) <= parseFloat(filters.precioMax) : true;

    return matchesBarrio && matchesPrecioMin && matchesPrecioMax;
  });

  const barrios = [...new Set(locals.map((local) => local.Barrio))].filter(Boolean);

  return (
    <>
      <EmptyLocalFilters
        barrios={barrios}
        restaurantTypes={restaurantTypes}
        onFilterChange={handleFilterChange}
      />
      <div className="map-container">
        <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <MapController neighborhoods={neighborhoods} />
          {typeof MarkerClusterGroup !== 'undefined' && (
            <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>
              <EmptyLocalMarkers filteredLocals={filteredLocals} icon={emptyLocalIcon} onMarkerClick={handleMarkerClick} onPopupOpen={handlePopupOpen} />
            </MarkerClusterGroup>
          )}

          {/* Aquí están los marcadores de restaurantes */}
          {nearbyRestaurants.map((restaurant, index) => (
            <Marker
              key={index}
              position={[restaurant.lat, restaurant.lon]}
              icon={restaurantIcon}
            >
              <Popup>
                <h3>{restaurant.name}</h3>
                <p>Tipo: {restaurant.type}</p>
                <p>Rating: {restaurant.rating}</p>
                <p>Precio: {restaurant.price}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Popup solo si hay un filtro activado */}
        {selectedPopup && filters.tipoRestaurante && (
          <div className="popup-outside-map">
            <p>Número de restaurantes filtrados: {selectedPopup.count}</p>
          </div>
        )}

        {competitorsData && (
          <div className="sidebar">
            <CompetitorChart data={competitorsData} accessibility={localAccessibility} />
          </div>
        )}
      </div>

      <style>{`
        .popup-outside-map {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default EmptyLocalsMap;
