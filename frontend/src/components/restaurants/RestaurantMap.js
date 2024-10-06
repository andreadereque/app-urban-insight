import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import HeatmapLegend from './HeatmapLegend';
import RestaurantMarkers from './RestaurantMarkers';
import NeighborhoodPolygons from './NeighborhoodPolygons';
import restIconPath from '../../assets/icons/rest_icon.png';
import busIconPath from '../../assets/icons/bus.png';
import PopularCategoriesChart from './PopularCategoriesChart';
import ViabilityIndicatorsChart from './ViabilityIndicatorsChart';

const restaurantIcon = new L.Icon({
  iconUrl: restIconPath,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const busIcon = new L.Icon({
  iconUrl: busIconPath,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
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
  const [showTransport, setShowTransport] = useState(false);
  const [showPopularCategories, setShowPopularCategories] = useState(false);
  const [selectedTransportType, setSelectedTransportType] = useState('');
  const [restaurantCounts, setRestaurantCounts] = useState({});
  const [transportData, setTransportData] = useState([]);
  const [categoryCountsByBarrio, setCategoryCountsByBarrio] = useState({});
  const neighborhoodLayersRef = useRef([]);
  const transportLayersRef = useRef([]);
  const [showViabilityIndicators, setShowViabilityIndicators] = useState(false);
  const [viabilityData, setViabilityData] = useState([]);




  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/demographics")
      .then(response => {
        setNeighborhoods(response.data);
      })
      .catch(error => console.error("Error al cargar los datos de barrios", error));
  }, []);

  useEffect(() => {
    if (showTransport) {
      axios.get("http://127.0.0.1:5000/transport")
        .then(response => {
          setTransportData(response.data);
        })
        .catch(error => console.error("Error al cargar los datos de transporte", error));
    } else {
      clearTransportLayers();
    }
  }, [showTransport]);

  useEffect(() => {
    const counts = filteredRestaurants.reduce((acc, restaurant) => {
      const barrio = restaurant.Barrio;
      if (!acc[barrio]) acc[barrio] = 0;
      acc[barrio] += 1;
      return acc;
    }, {});
    setRestaurantCounts(counts);

    const categoryCounts = filteredRestaurants.reduce((acc, restaurant) => {
      const barrio = restaurant.Barrio;
      const category = restaurant["Categoría Cocina"];
      if (!acc[barrio]) acc[barrio] = {};
      if (!acc[barrio][category]) acc[barrio][category] = 0;
      acc[barrio][category] += 1;
      return acc;
    }, {});
    setCategoryCountsByBarrio(categoryCounts);
  }, [filteredRestaurants]);

  useEffect(() => {
    if (mapRef.current && showTransport && transportData.length) {
      clearTransportLayers();
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom >= 17) { // Mostrar transporte solo a un nivel de zoom cercano
        transportData.forEach((transport) => {
          if (!selectedTransportType || transport.Tipo === selectedTransportType) {
            const { coordinates } = transport.Geometry;
            const marker = L.marker([coordinates[1], coordinates[0]], { icon: busIcon }).addTo(mapRef.current);
            marker.bindPopup(`<b>Tipo:</b> ${transport.Tipo}<br/><b>Líneas:</b> ${transport.Lineas.join(", ")}`);
            transportLayersRef.current.push(marker);
          }
        });
      }
    }
  }, [mapRef, showTransport, transportData, selectedTransportType]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('zoomend', () => {
        if (showTransport) {
          clearTransportLayers();
          const currentZoom = mapRef.current.getZoom();
          if (currentZoom >= 17) { // Mostrar transporte solo a un nivel de zoom cercano
            transportData.forEach((transport) => {
              if (!selectedTransportType || transport.Tipo === selectedTransportType) {
                const { coordinates } = transport.Geometry;
                const marker = L.marker([coordinates[1], coordinates[0]], { icon: busIcon }).addTo(mapRef.current);
                marker.bindPopup(`<b>Tipo:</b> ${transport.Tipo}<br/><b>Líneas:</b> ${transport.Lineas.join(", ")}`);
                transportLayersRef.current.push(marker);
              }
            });
          }
        }
      });
    }
  }, [mapRef, showTransport, transportData, selectedTransportType]);
  useEffect(() => {
    if (showViabilityIndicators) {
      axios.get("http://127.0.0.1:5000/api/viability")
        .then(response => {
          console.log('***************', response)
          setViabilityData(response.data);
        })
        .catch(error => console.error("Error al cargar los indicadores de viabilidad", error));
    }
  }, [showViabilityIndicators]);

  const getColorForRestaurantCount = (count) => {
    return count > 150 ? '#800026' :
      count > 120 ? '#BD0026' :
        count > 90 ? '#E31A1C' :
          count > 60 ? '#FC4E2A' :
            count > 30 ? '#FD8D3C' :
              count > 14 ? '#FEB24C' :
                '#FFEDA0';
  };

  const getPopularCategoryForBarrio = (barrio) => {
    const categories = categoryCountsByBarrio[barrio];
    if (!categories) return 'Desconocido';
    return Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
  };

  const clearLayers = () => {
    neighborhoodLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    neighborhoodLayersRef.current = [];
  };

  const clearTransportLayers = () => {
    transportLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    transportLayersRef.current = [];
  };
  useEffect(() => {
    if (showPopularCategories) {
      console.log("**Datos filtrados de restaurantes:", filteredRestaurants); // Verifica que cada restaurante tenga el campo 'Barrio'

      const categoryCounts = filteredRestaurants.reduce((acc, restaurant) => {
        const barrio = restaurant.Barrio; // Aquí tomamos el barrio
        if (!barrio || barrio === "Desconocido") return acc; // Ignorar si el barrio está vacío o es "Desconocido"

        const category = restaurant["Tipo"];
        if (!acc[barrio]) acc[barrio] = {};
        if (!acc[barrio][category]) acc[barrio][category] = 0;
        acc[barrio][category] += 1; // Aumentar el conteo de esa categoría en ese barrio
        return acc;
      }, {});

      const popularCategories = {};
      for (let barrio in categoryCounts) {
        const sortedCategories = Object.entries(categoryCounts[barrio]).sort((a, b) => b[1] - a[1]);
        popularCategories[barrio] = sortedCategories[0]; // Obtener la categoría más popular
      }
      setCategoryCountsByBarrio(popularCategories);
    }
  }, [showPopularCategories, filteredRestaurants]);



  const togglePopularCategories = () => {
    setShowPopularCategories(!showPopularCategories);
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
      <button
        onClick={() => setShowTransport(!showTransport)}
        style={{
          marginBottom: '10px',
          marginLeft: '15px',
          padding: '10px 20px',
          backgroundColor: showTransport ? '#d0e6a5' : '#b5e48c',
          color: '#fff',
          border: '2px solid #c4e69e',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = showTransport ? '#e0f0c4' : '#c9eab3'}
        onMouseOut={(e) => e.target.style.backgroundColor = showTransport ? '#d0e6a5' : '#b5e48c'}
      >
        {showTransport ? 'Ocultar Transporte' : 'Mostrar Transporte'}
      </button>
      <button
        onClick={() => setShowPopularCategories(!showPopularCategories)}
        style={{
          marginBottom: '10px',
          marginLeft: '15px',
          padding: '10px 20px',
          backgroundColor: showPopularCategories ? '#c5cae9' : '#7986cb',
          color: '#fff',
          border: '2px solid #9fa8da',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = showPopularCategories ? '#d1d9ff' : '#9fa8da'}
        onMouseOut={(e) => e.target.style.backgroundColor = showPopularCategories ? '#c5cae9' : '#7986cb'}
      >
        {showPopularCategories ? 'Ocultar Categorías Populares' : 'Mostrar Categorías Populares'}
      </button>
      <button
        onClick={() => setShowViabilityIndicators(!showViabilityIndicators)}
        style={{
          marginBottom: '10px',
          marginLeft: '15px',
          padding: '10px 20px',
          backgroundColor: showViabilityIndicators ? '#f5b041' : '#f4d03f',
          color: '#fff',
          border: '2px solid #f8c471',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = showViabilityIndicators ? '#f7ca79' : '#f5e599'}
        onMouseOut={(e) => e.target.style.backgroundColor = showViabilityIndicators ? '#f5b041' : '#f4d03f'}
      >
        {showViabilityIndicators ? 'Ocultar Indicadores de Viabilidad' : 'Mostrar Indicadores de Viabilidad'}
      </button>
      <MapContainer
        ref={mapRef}
        center={[41.3851, 2.1734]}
        zoom={13}
        style={{ height: 'calc(100vh - 300px)', width: '100%', position: 'relative' }}
        minZoom={13}  // Ajusta el valor según lo que desees
        maxZoom={18}  // Ajusta el valor para evitar hacer zoom demasiado cerca
        maxBounds={[[41.2, 2.0], [41.5, 2.3]]}  // Define los límites para ver solo Barcelona
      >        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
        />
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          <RestaurantMarkers filteredRestaurants={filteredRestaurants} icon={restaurantIcon} />
        </MarkerClusterGroup>

        {showNeighborhoods && (
          <NeighborhoodPolygons
            mapRef={mapRef}
            neighborhoods={neighborhoods}
            showNeighborhoods={showNeighborhoods}
            heatmapActive={heatmapActive}
            restaurantCounts={restaurantCounts}
            getColorForRestaurantCount={getColorForRestaurantCount}
            clearLayers={clearLayers}
          />
        )}

        {showPopularCategories && neighborhoods.map((neighborhood, index) => (
          neighborhood.Geometry && neighborhood.Geometry.coordinates && (
            <Polygon
              key={index}
              positions={neighborhood.Geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
              color="blue"
              fillOpacity={0.3}
            >
              <Popup>
                <div>
                  <b>Barrio:</b> {neighborhood.Nombre}<br />
                  <b>Categoría Popular:</b> {getPopularCategoryForBarrio(neighborhood.Nombre)}
                </div>
              </Popup>
            </Polygon>
          )
        ))}
        
        {heatmapActive && <HeatmapLegend />}
      </MapContainer>
      {showViabilityIndicators && <ViabilityIndicatorsChart viabilityData={viabilityData} selectedFilter={filteredRestaurants.length ? filteredRestaurants[0].Barrio : ''} />}
      {showPopularCategories && <PopularCategoriesChart categoryCountsByBarrio={categoryCountsByBarrio} />}

      {showTransport && (
        <select
          value={selectedTransportType}
          onChange={(e) => setSelectedTransportType(e.target.value)}
          style={{
            marginBottom: '10px',
            marginLeft: '15px',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        >
          <option value="">Todos los transportes</option>
          <option value="BUS">BUS</option>
          <option value="METRO">METRO</option>
          <option value="FGC">FGC</option>
          <option value="RENFE">RENFE</option>
        </select>
      )}

    </div>
  );
}

export default RestaurantMap;