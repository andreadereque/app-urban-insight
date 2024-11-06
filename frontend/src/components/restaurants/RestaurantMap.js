import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import proj4 from 'proj4';
import RestaurantMarkers from './Icons/RestaurantMarkers';
import ClusterCustomIcon from './Icons/ClusterCustomIcon';
import RestaurantIcon from './Icons/RestaurantIcon';
import TransportIcon from './Icons/TransportIcon';
import HeatmapLegend from './HeatmapLegend'; // Importar la leyenda
import L from 'leaflet';
import Dashboard from './Dashboard';


const RestaurantMap = ({ filteredRestaurants }) => {
  const mapRef = useRef(null);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showTransports, setShowTransports] = useState(false);
  const [transportData, setTransportData] = useState([]);
  const [selectedTransportType, setSelectedTransportType] = useState('');

  const [neighborhoods, setNeighborhoods] = useState([]);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [restaurantCounts, setRestaurantCounts] = useState({});
  const [showWarning, setShowWarning] = useState(false);

  const neighborhoodLayersRef = useRef([]);
  const transportLayersRef = useRef([]);

  // Función para obtener el color basado en el número de restaurantes
  const getColorForRestaurantCount = (count) => {
    if (count > 150) return '#800026';
    if (count > 100) return '#BD0026';
    if (count > 75) return '#E31A1C';
    if (count > 50) return '#FC4E2A';
    if (count > 25) return '#FD8D3C';
    if (count > 10) return '#FEB24C';
    if (count > 0) return '#FED976';
    return '#FFEDA0'; // Para barrios sin restaurantes
  };

  // Cargar barrios desde la API
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/neighborhoods")
      .then(response => {
        setNeighborhoods(response.data);
      })
      .catch(error => console.error("Error al cargar los datos de barrios", error));
  }, []);

  // Recalcular los conteos de restaurantes por barrio basados en los restaurantes filtrados
  useEffect(() => {
    const countsByNeighborhood = {};

    filteredRestaurants.forEach(restaurant => {
      const neighborhood = restaurant.Barrio;
      if (neighborhood) {
        if (!countsByNeighborhood[neighborhood]) {
          countsByNeighborhood[neighborhood] = 0;
        }
        countsByNeighborhood[neighborhood] += 1;
      }
    });

    setRestaurantCounts(countsByNeighborhood); // Actualiza el estado con los nuevos conteos
  }, [filteredRestaurants]);

  // Mostrar/Ocultar los barrios y aplicar heatmap
  useEffect(() => {
    if (mapRef?.current) {
      neighborhoodLayersRef.current.forEach(layer => {
        if (mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      neighborhoodLayersRef.current = [];

      if (showNeighborhoods) {
        const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";

        neighborhoods.forEach((neighborhood) => {
          const coordinates = neighborhood.Geometry.coordinates[0];
          const latLngs = coordinates.map(coord => {
            const [easting, northing] = coord;
            const latLng = proj4(utmZone, "WGS84", [easting, northing]);
            return [latLng[1], latLng[0]];
          });

          const count = restaurantCounts[neighborhood.Nombre] || 0;  // Obtener el número de restaurantes filtrados
          const color = heatmapActive ? getColorForRestaurantCount(count) : 'purple';  // Cambia entre el color de heatmap o el color original

          const polygon = L.polygon(latLngs, {
            color: 'purple',
            fillColor: color,  // Usa el color basado en si el heatmap está activo
            fillOpacity: heatmapActive ? 0.7 : 0.5  // Ajusta la opacidad basado en si el heatmap está activo
          }).addTo(mapRef.current);

          // Añadir evento mouseover para mostrar el nombre del barrio
          polygon.on('mouseover', function (e) {
            const popup = L.popup()
              .setLatLng(e.latlng)
              .setContent(`<div style="font-size: 16px; font-weight: bold;">${neighborhood.Nombre}</div>`)
              .openOn(mapRef.current);
          });

          // Añadir evento mouseout para cerrar el popup
          polygon.on('mouseout', function () {
            mapRef.current.closePopup();
          });

          neighborhoodLayersRef.current.push(polygon);
        });
      }
    }
  }, [showNeighborhoods, neighborhoods, heatmapActive, restaurantCounts]);


  // Cargar y mostrar transportes
  useEffect(() => {
    if (showTransports) {
      axios.get("http://127.0.0.1:5000/transport")
        .then(response => {
          setTransportData(response.data);
        })
        .catch(error => console.error("Error al cargar los datos de transporte", error));
    } else {
      clearTransportLayers();
    }
  }, [showTransports]);

  // Mostrar los transportes en el mapa
  useEffect(() => {
    const mapInstance = mapRef.current; // Copiamos el valor de mapRef.current a una variable local

    const handleZoomChange = () => {
      if (!mapInstance) return; // Asegurarse de que mapInstance no es null

      const currentZoom = mapInstance.getZoom(); // Obtener el nivel de zoom actual

      // Verifica que el zoom sea igual o superior a 17 y que haya transportes para mostrar
      if (currentZoom >= 17 && showTransports && transportData.length) {
        clearTransportLayers(); // Limpiar capas de transporte anteriores
        transportData.forEach((transport) => {
          if (!selectedTransportType || transport.Tipo === selectedTransportType) {
            const { coordinates } = transport.Geometry;
            const marker = L.marker([coordinates[1], coordinates[0]], { icon: TransportIcon }).addTo(mapInstance);
            marker.bindPopup(`<b>Tipo:</b> ${transport.Tipo}<br/><b>Líneas:</b> ${transport.Lineas.join(", ")}`);
            transportLayersRef.current.push(marker);
          }
        });
      } else {
        clearTransportLayers(); // Limpiar las capas si el zoom es inferior a 17
      }
    };

    // Verifica que el mapa esté montado y el mapa ref no sea null
    if (mapInstance) {
      mapInstance.on('zoomend', handleZoomChange); // Escucha cambios en el zoom
      handleZoomChange(); // Ejecuta la lógica inmediatamente en el primer render
    }

    // Limpia el listener cuando se desmonta el componente
    return () => {
      if (mapInstance) {
        mapInstance.off('zoomend', handleZoomChange);
      }
    };
  }, [showTransports, transportData, selectedTransportType]);


  const handleHeatmapClick = () => {
    if (!showNeighborhoods) {
      setShowWarning(true); // Mostrar advertencia si no están activados los barrios
    } else {
      setHeatmapActive(!heatmapActive);  // Alternar el estado del heatmap
    }
  };

  const closeWarning = () => {
    setShowWarning(false); // Cerrar popup
  };

  const clearTransportLayers = () => {
    transportLayersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    transportLayersRef.current = [];
  };

  return (
    <div  style={{ height: '800px', width: 'flex' , margin: '20px'}}>
        <div style={{backgroundColor:'#FFFFF'}}>
            {/* Botón Mostrar/Ocultar Barrios */}
            <button
                onClick={() => setShowNeighborhoods(!showNeighborhoods)}
                style={{
                    marginBottom: '10px',
                    padding: '10px 25px',
                    backgroundColor: showNeighborhoods ? '#2A3A67' : '#FF6F61', // Azul Marino y Coral Suave
                    color: '#FFFFFF',
                    border: `2px solid ${showNeighborhoods ? '#2A3A67' : '#FF6F61'}`, // Color de borde igual al fondo
                    borderRadius: '15px',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = showNeighborhoods ? '#4B4B4B' : '#FFC914')}
                onMouseOut={(e) => (e.target.style.backgroundColor = showNeighborhoods ? '#2A3A67' : '#FF6F61')}
            >
                {showNeighborhoods ? 'Ocultar Barrios' : 'Mostrar Barrios'}
            </button>

            {/* Botón Activar/Desactivar Heatmap */}
            <button
                onClick={handleHeatmapClick}
                style={{
                    marginBottom: '10px',
                    marginLeft: '15px',
                    padding: '10px 25px',
                    backgroundColor: heatmapActive ? '#ADD8E6' : '#A4D4AE', // Azul Claro y Verde Pastel
                    color: '#2A3A67', // Azul Marino para el texto
                    border: `2px solid ${heatmapActive ? '#ADD8E6' : '#A4D4AE'}`, // Borde igual al fondo
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    fontSize: '16px'
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = heatmapActive ? '#FFC914' : '#FFB774')}
                onMouseOut={(e) => (e.target.style.backgroundColor = heatmapActive ? '#ADD8E6' : '#A4D4AE')}
            >
                {heatmapActive ? 'Desactivar Heatmap' : 'Activar Heatmap'}
            </button>

            {/* Botón Mostrar/Ocultar Transportes */}
            <button
                onClick={() => setShowTransports(!showTransports)}
                style={{
                    marginBottom: '10px',
                    marginLeft: '15px',
                    padding: '10px 25px',
                    backgroundColor: showTransports ? '#B5E48C' : '#FFC914', // Verde Suave y Mostaza
                    color: '#4B4B4B', // Gris Oscuro para el texto
                    border: `2px solid ${showTransports ? '#B5E48C' : '#FFC914'}`, // Borde igual al fondo
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold',
                    fontSize: '16px'
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = showTransports ? '#FF6F61' : '#A4D4AE')}
                onMouseOut={(e) => (e.target.style.backgroundColor = showTransports ? '#B5E48C' : '#FFC914')}
            >
                {showTransports ? 'Ocultar Transportes' : 'Mostrar Transportes'}
            </button>

            {/* Select de transporte */}
            {showTransports && (
              <>
                <select
                    value={selectedTransportType}
                    onChange={(e) => setSelectedTransportType(e.target.value)}
                    style={{
                        marginBottom: '10px',
                        marginLeft: '15px',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid #4B4B4B', // Gris Oscuro para el borde del selector
                        fontSize: '16px',
                        backgroundColor: '#E8E8E8', // Gris Claro como fondo
                        color: '#2A3A67' // Azul Marino para el texto
                    }}
                >
                    <option value="">Todos los transportes</option>
                    <option value="BUS">BUS</option>
                    <option value="METRO">METRO</option>
                    <option value="FGC">FGC</option>
                    <option value="RENFE">RENFE</option>
                    <option value="Parking">PARKING</option>
                </select>
                 {/* Texto informativo sobre el zoom */}
        <p style={{
          marginLeft: '15px',
          fontSize: '14px',
          color: '#4B4B4B', // Gris Oscuro para el texto
          fontStyle: 'italic',
      }}>
          🚍 Si haces zoom, podrás ver los diferentes transportes que hay en cada zona.
      </p>
                </>
            )}

            {showWarning && (
                <div style={{ padding: '20px', backgroundColor: '#FF6F61', border: '1px solid #FF6F61', marginTop: '20px' }}>
                    <p>No puedes activar el heatmap sin antes mostrar los barrios.</p>
                    <button
                        onClick={closeWarning}
                        style={{
                            padding: '10px',
                            backgroundColor: '#FFC914', // Mostaza para el botón de cerrar advertencia
                            color: '#FFFFFF',
                            border: `2px solid #FFC914`, // Borde igual al fondo
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
        
        {/* Map Container */}
        <MapContainer
            ref={mapRef}
            center={[41.3851, 2.1734]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            minZoom={12}
            maxZoom={18}
            maxBounds={[[41.2, 2.0], [41.5, 2.3]]}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'"
                attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
            />
            <MarkerClusterGroup iconCreateFunction={ClusterCustomIcon}>
                <RestaurantMarkers filteredRestaurants={filteredRestaurants} icon={RestaurantIcon} />
            </MarkerClusterGroup>

            {/* Añadir la leyenda del heatmap */}
            <HeatmapLegend map={mapRef.current} />
        </MapContainer>

        <div style={{ width: '100%' }}>
            {/* HeatmapCharts - los gráficos debajo del mapa */}
            <Dashboard filteredRestaurants={filteredRestaurants} />
        </div>
    </div>
);

}

export default RestaurantMap;
