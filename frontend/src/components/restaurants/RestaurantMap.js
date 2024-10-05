import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import axios from 'axios';
import proj4 from 'proj4';  // Para convertir coordenadas

// Función para personalizar el icono de los clusters con números más pequeños
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  let sizeClass = 'large';

  if (count < 10) {
    sizeClass = 'small';
  } else if (count < 100) {
    sizeClass = 'medium';
  }

  // Ajuste del tamaño en función de la clase
  const size = sizeClass === 'small' ? 20 :
               sizeClass === 'medium' ? 30 :
               40;  // Tamaño ajustado a 40 como máximo

  // Ajuste del tamaño del número
  const fontSize = sizeClass === 'small' ? '10px' :
                   sizeClass === 'medium' ? '12px' :
                   '14px';  // Tamaño de fuente más pequeño

  return L.divIcon({
    html: `<div style="font-size: ${fontSize};"><span>${count}</span></div>`,  // Tamaño del número ajustado
    className: `custom-cluster-icon custom-cluster-${sizeClass}`,
    iconSize: L.point(size, size, true),  // Tamaño personalizado del icono
  });
};

const RestaurantMap = ({ filteredRestaurants }) => {
  const mapRef = useRef(null);  // Referencia para el mapa
  const neighborhoodLayersRef = useRef([]);  // Referencia para almacenar los polígonos de los barrios
  const labelLayersRef = useRef([]);  // Referencia para almacenar las etiquetas de los números
  const [neighborhoods, setNeighborhoods] = useState([]);  // Almacenar datos de los barrios
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);  // Estado para mostrar u ocultar los barrios
  const [heatmapActive, setHeatmapActive] = useState(false);  // Estado para activar/desactivar el heatmap
  const [restaurantCounts, setRestaurantCounts] = useState({});  // Almacenar el número de restaurantes por barrio

  // Función para contar el número de restaurantes por barrio
  useEffect(() => {
    const counts = filteredRestaurants.reduce((acc, restaurant) => {
      const barrio = restaurant.Barrio;
      if (!acc[barrio]) acc[barrio] = 0;
      acc[barrio] += 1;
      return acc;
    }, {});
    setRestaurantCounts(counts);  // Guardar la cuenta de restaurantes por barrio
  }, [filteredRestaurants]);

  useEffect(() => {
    // Cargar los datos de los barrios desde el backend
    axios.get("http://127.0.0.1:5000/api/demographics")  // Ajusta esta URL según tu backend
      .then(response => {
        const neighborhoodsData = response.data;
        setNeighborhoods(neighborhoodsData);  // Almacenar los datos de los barrios
      })
      .catch(error => console.error("Error al cargar los datos de barrios:", error));
  }, []);

  // Función para determinar el color en función del número de restaurantes (rango ajustado de 14 a 180)
  const getColorForRestaurantCount = (count) => {
    return count > 150 ? '#800026' :
           count > 120 ? '#BD0026' :
           count > 90  ? '#E31A1C' :
           count > 60  ? '#FC4E2A' :
           count > 30  ? '#FD8D3C' :
           count > 14  ? '#FEB24C' :
                         '#FFEDA0';
  };

  // Función para eliminar los polígonos y etiquetas del mapa
  const clearLayers = () => {
    neighborhoodLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);  // Remover cada polígono del mapa
    });
    labelLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);  // Remover las etiquetas de los números
    });
    neighborhoodLayersRef.current = [];  // Limpiar las referencias de los polígonos
    labelLayersRef.current = [];  // Limpiar las referencias de las etiquetas
  };

  useEffect(() => {
    if (mapRef.current) {
      // Si se deben mostrar los barrios, añadirlos al mapa
      if (showNeighborhoods && neighborhoods.length) {
        clearLayers();  // Limpiar los polígonos y etiquetas previos antes de redibujar

        const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";  // Zona UTM para Barcelona

        // Dibujar los polígonos y añadir etiquetas con el número de restaurantes
        neighborhoods.forEach((neighborhood) => {
          const coordinates = neighborhood.Geometry.coordinates[0];
          const restaurantCount = restaurantCounts[neighborhood.Nombre] || 0;  // Obtener número de restaurantes
          const color = heatmapActive ? getColorForRestaurantCount(restaurantCount) : 'purple';  // Obtener color si heatmap está activo

          const latLngs = coordinates.map(coord => {
            const [easting, northing] = coord;
            const latLng = proj4(utmZone, "WGS84", [easting, northing]);
            return [latLng[1], latLng[0]];
          });

          const polygon = L.polygon(latLngs, { color, fillOpacity: 0.5 }).addTo(mapRef.current);
          neighborhoodLayersRef.current.push(polygon);  // Almacenar la referencia del polígono

          // Si el heatmap está activo, añadir etiquetas con el número de restaurantes
          if (heatmapActive) {
            const centroid = polygon.getBounds().getCenter();  // Obtener el centro del polígono
            const label = L.marker(centroid, {
              icon: L.divIcon({
                className: 'restaurant-count-label',
                html: `<div style="
                  font-weight: bold;
                  font-size: 10px;  /* Tamaño de fuente reducido */
                  color: #333;
                  background-color: rgba(255, 255, 255, 0.8);
                  border: 1px solid #ccc;
                  border-radius: 8px;  /* Borde más redondeado */
                  padding: 2px 4px;  /* Padding más pequeño */
                  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
                ">${restaurantCount}</div>`,
                iconSize: [30, 30]  // Tamaño más pequeño del icono
              })
            }).addTo(mapRef.current);
            labelLayersRef.current.push(label);  // Almacenar la referencia de la etiqueta
          }
        });
      } 
      // Si se deben ocultar los barrios, remover los polígonos y etiquetas del mapa
      else {
        clearLayers();
      }
    }
  }, [neighborhoods, showNeighborhoods, restaurantCounts, heatmapActive]);

  // Función para alternar la visibilidad de los barrios
  const toggleNeighborhoods = () => {
    setShowNeighborhoods(!showNeighborhoods);
  };

  // Función para alternar el heatmap
  const toggleHeatmap = () => {
    setHeatmapActive(!heatmapActive);
  };

  return (
    <div>
      {/* Botón para mostrar/ocultar barrios */}
      <button onClick={toggleNeighborhoods} style={{ marginBottom: '10px' }}>
        {showNeighborhoods ? 'Ocultar Barrios' : 'Mostrar Barrios'}
      </button>

      {/* Botón para activar/desactivar heatmap */}
      <button onClick={toggleHeatmap} style={{ marginBottom: '10px', marginLeft: '10px' }}>
        {heatmapActive ? 'Desactivar Heatmap' : 'Activar Heatmap'}
      </button>

      <MapContainer ref={mapRef} center={[41.3851, 2.1734]} zoom={13} style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marcadores de restaurantes */}
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          {filteredRestaurants.length > 0 && filteredRestaurants.map((restaurant, index) => {
            const coordinates = restaurant.Coordinates || [];
            if (coordinates.length === 2) {
              const [lng, lat] = coordinates;
              if (lat && lng) {
                return (
                  <Marker key={index} position={[lat, lng]}>
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
            return null;  // Si las coordenadas no son válidas, no renderizar el marcador
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;
