import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import EmptyLocalMarkers from './EmptyLocalMarkers';
import EmptyLocalFilters from './EmptyLocalFilters';
import MapController from './MapController';
import L from 'leaflet';
import idealistaIconPath from '../../assets/icons/ide.png';
import restaurantIconPath from '../../assets/icons/rest_icon.png';
import '../../styles/EmptyLocalFilters.css'; // Asegúrate de tener este archivo CSS
import '../../styles/EmptyLocalMaps.css'; // Asegúrate de tener este archivo CSS
import axios from 'axios';
import CompetitorChart from './CompetitorChart'; // Nuevo componente para gráficos
import ClickedLocalDetails from './ClickedLocalDetails'; // Nuevo componente para gráficos

import NeighborhoodStatsContainer from './NeighborhoodStatsContainer';
// Función para crear iconos personalizados para los clústeres
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();

  let size = 'large';
  let dimension = 50; // Tamaño base

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
    className: 'custom-cluster', // Clase personalizada (opcional)
    iconSize: L.point(dimension, dimension, true),
  });
};

const EmptyLocalsMap = () => {
  const [locals, setLocals] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filters, setFilters] = useState({ barrio: '', precioMin: '', precioMax: '' });
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [competitorsData, setCompetitorsData] = useState(null);
  const [localAccessibility, setLocalAccessibility] = useState(null);
  const [clickedLocalTitle, setClickedLocalTitle] = useState(null); // Nuevo estado para el título
  const [clickedLocal, setClickedLocal] = useState(null); // Nuevo estado para el título
  const [neighborhood, setNeighborhood] = useState([]);





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
    // Cargar locales vacíos y datos de demografía
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

  const handleFilterChange = (filterName, filterValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: filterValue,
    }));
  };

  const handlePopupOpen = async (lat, lon) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/nearby_restaurants?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error('Error al obtener los restaurantes cercanos');
      }
      const data = await response.json();
      setNearbyRestaurants(data);
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
    }
  };


  const fetchNeighbourCompetitors = async (coordinates) => {
    try {
      const [lon, lat] = coordinates; // Asegúrate de extraer latitud y longitud correctamente
      // Realiza la solicitud GET con los parámetros adecuados
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
  const setTheNeighborhood = async (barrio) => {
    try {
      // Call the demographics endpoint with the specific neighborhood name
      const response = await axios.get(`http://127.0.0.1:5000/api/demographics_by_name?barrio=${encodeURIComponent(barrio)}`);
      
      if (response.data) {
        setNeighborhood(response.data); // Set the retrieved neighborhood data in the state
      } else {
        console.error(`No data found for neighborhood: ${barrio}`);
      }
    } catch (error) {
      console.error('Error fetching neighborhood data:', error);
    }
  };

  const handleMarkerClick = (local) => {
    const coordinates = local["Coordinates"] || []; // Asegúrate de usar "Coordinates" en lugar de Geometry.coordinates
    fetchNeighbourCompetitors(coordinates);
    const accesibilidad1 = local['Accesibilidad']// Llamas a la función con las coordenadas
  
    setLocalAccessibility(accesibilidad1); // Guardas la accesibilidad del local seleccionado
    setClickedLocalTitle(local['Título']); // Almacenar el título del local clicado
    setClickedLocal(local)
    setTheNeighborhood(local['Barrio'])

  };
  useEffect(() => {
    if (localAccessibility !== null) {
    }
  }, [localAccessibility]);



  const filteredLocals = locals.filter((local) => {
    const matchesBarrio = filters.barrio ? local.Barrio === filters.barrio : true;
    const matchesPrecioMin = filters.precioMin ? parseFloat(local['Precio total (€)']) >= parseFloat(filters.precioMin) : true;
    const matchesPrecioMax = filters.precioMax ? parseFloat(local['Precio total (€)']) <= parseFloat(filters.precioMax) : true;
    return matchesBarrio && matchesPrecioMin && matchesPrecioMax;
  });


  const barrios = [...new Set(locals.map((local) => local.Barrio))].filter(Boolean);

  return (
    <>
      <EmptyLocalFilters barrios={barrios} onFilterChange={handleFilterChange} />
      <p>Al final de esta pestaña encontraras un apartado donde te ira dando informaicón y comparativas acerca los locales seleccionados</p>

      <div className="map-container">

        <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <MapController neighborhoods={neighborhoods} />
          {typeof MarkerClusterGroup !== 'undefined' && (
            <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>
              <EmptyLocalMarkers filteredLocals={filteredLocals} icon={emptyLocalIcon} onMarkerClick={handleMarkerClick} onPopupOpen={handlePopupOpen} />
            </MarkerClusterGroup>
          )}
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
        {competitorsData && (
          <div className="sidebar">
            <CompetitorChart data={competitorsData} accessibility={localAccessibility} />
          </div>
        )}

      </div>
      <div>
        <h2>Estadísticas de Locales por Barrio</h2>
        <NeighborhoodStatsContainer />
      </div>
      <br /> 
      <ClickedLocalDetails title={clickedLocalTitle} infoNearRestaurants={nearbyRestaurants} local={clickedLocal} neighborhood={neighborhood} />

    </>
  );
}

export default EmptyLocalsMap;
