import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import proj4 from 'proj4';
import InformationPanel from './InformationPanel';
import ComparePanel from './ComparePanels';
import ComparationBetweenNeigh from '../random/ComparationBetweenNeigh';
import '../../styles/Tooltip.css';

const InteractiveMaps = ({ filters }) => {
  const mapRef = useRef(null);
  const neighborhoodLayersRef = useRef([]);
  const [barcelonaData, setBarcelonaData] = useState(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [showCompareSimilarPanel, setShowCompareSimilarPanel] = useState(false);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState(null);

  const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/demographics", { params: filters })
      .then(response => {
        const neighborhoods = response.data;
        setNeighborhoods(neighborhoods);
        if (neighborhoods && neighborhoods.length) {
          calculateBarcelonaData(neighborhoods);
          if (!mapRef.current) {
            const barcelonaBounds = [[41.3200, 2.0691], [41.4700, 2.2299]];
            mapRef.current = L.map('map', {
              center: [41.3851, 2.1734],
              zoom: 12,
              dragging: true,
              maxBounds: barcelonaBounds,
              zoomControl: true,
              minZoom: 12,
              maxZoom: 19,
              scrollWheelZoom: true,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap © CARTO',
            }).addTo(mapRef.current);
          }
          neighborhoods.forEach((neighborhood) => {
            if (neighborhood.Geometry && neighborhood.Geometry.coordinates.length > 0) {
              const coordinates = neighborhood.Geometry.coordinates[0];
              const latLngs = coordinates.map(coord => {
                const [easting, northing] = coord;
                const latLng = proj4(utmZone, "WGS84", [easting, northing]);
                return [latLng[1], latLng[0]];
              });
              const polygon = L.polygon(latLngs, {
                color: '#2A3A67', // Azul Marino Oscuro para el borde
                fillOpacity: 0.3,
                fillColor: '#A4D4AE', // Verde Pastel para relleno
                weight: 2,
              }).addTo(mapRef.current);
              polygon.bindPopup(`
                 <div style="text-align: center; font-size: 14px; font-family: 'Helvetica Neue', sans-serif; color: #4B4B4B; font-weight: bold;">
                  <b>${neighborhood.Nombre}</b><br/>
                </div>`, {
                className: 'custom-popup',
                closeButton: false,
                autoPan: true,
              });
              polygon.on('mouseover', () => {
                polygon.openPopup();
                setHoveredNeighborhood(neighborhood);
              });
              polygon.on('mouseout', () => {
                polygon.closePopup();
                setHoveredNeighborhood(null);
              });
              polygon.on('click', () => {
                setSelectedNeighborhood(neighborhood);
              });
              neighborhoodLayersRef.current.push(polygon);
            }
          });
          const bounds = neighborhoodLayersRef.current.map(layer => layer.getBounds());
          if (bounds.length > 0) {
            const combinedBounds = bounds.reduce((acc, val) => acc.extend(val), L.latLngBounds(bounds[0]));
            mapRef.current.fitBounds(combinedBounds);
          }
        }
      })
      .catch(error => console.error("Error fetching data: ", error));
  }, [filters]);

  const calculateBarcelonaData = (neighborhoods) => {
    const aggregatedData = {
      renta: 0,
      poblacion: 0,
      estudiosBajos: 0,
      trabajadoresBajaCalificacion: 0,
      poblacionOcupada: 0,
      distribucionEdad: {},
      distribucionInmigracion: {},
      distribucionHabitaciones: {},
    };
    let totalPopulation = 0;
    neighborhoods.forEach((neighborhood) => {
      const neighborhoodPopulation = parseInt(neighborhood.Poblacion);
      aggregatedData.poblacion += neighborhoodPopulation;
      aggregatedData.renta += parseFloat(neighborhood.Renta) * neighborhoodPopulation;
      aggregatedData.estudiosBajos += parseFloat(neighborhood['Población con estudios bajos']) * neighborhoodPopulation;
      aggregatedData.trabajadoresBajaCalificacion += parseFloat(neighborhood['Trabajadores de baja calificación']) * neighborhoodPopulation;
      aggregatedData.poblacionOcupada += parseFloat(neighborhood['Población ocupada']) * neighborhoodPopulation;
      totalPopulation += neighborhoodPopulation;
      Object.entries(neighborhood['Distribución edad']).forEach(([key, value]) => {
        aggregatedData.distribucionEdad[key] = (aggregatedData.distribucionEdad[key] || 0) + value;
      });
      Object.entries(neighborhood['Distribución immigración']).forEach(([key, value]) => {
        aggregatedData.distribucionInmigracion[key] = (aggregatedData.distribucionInmigracion[key] || 0) + value;
      });
      Object.entries(neighborhood['Distribución habitación por casas']).forEach(([key, value]) => {
        aggregatedData.distribucionHabitaciones[key] = (aggregatedData.distribucionHabitaciones[key] || 0) + value;
      });
    });
    aggregatedData.renta = aggregatedData.renta / totalPopulation;
    aggregatedData.estudiosBajos = aggregatedData.estudiosBajos / totalPopulation;
    aggregatedData.trabajadoresBajaCalificacion = aggregatedData.trabajadoresBajaCalificacion / totalPopulation;
    aggregatedData.poblacionOcupada = aggregatedData.poblacionOcupada / totalPopulation;
    setBarcelonaData(aggregatedData);
  };

  const toggleComparePanel = () => {
    setShowComparePanel(!showComparePanel);
  };
  const toggleCompareSimilarPanel = () => {
    setShowCompareSimilarPanel(!showCompareSimilarPanel);
  };

  return (
    <div style={{ flexDirection: 'column', height: "170vh", backgroundColor: "#F5F7FA", margin:'20px'}}>
       <h1 style={{ margin: '20px', fontSize: '2em', color: '#2A3A67' }}>Perfil del Consumidor</h1>
      <p style={{
        margin: '20px',
        fontSize: '1.1em',
        color: '#4B4B4B',
        lineHeight: '1.6',
        borderLeft: '4px solid #FF6F61',
        paddingLeft: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        📊 En esta pestaña, analiza la <strong>demografía de los barrios de Barcelona</strong> para comprender mejor el <strong>perfil de los consumidores potenciales</strong>.
        <br />
        🌍 Utiliza el <strong>mapa interactivo</strong> para explorar datos clave como la <strong>población total</strong>, la <strong>distribución por edades</strong>, y los <strong>niveles de ingresos</strong> de cada barrio, lo que te permitirá tomar decisiones informadas sobre la ubicación de tu negocio.
        <br />
        🔍 Compara diferentes barrios basándote en sus <strong>características demográficas</strong> para identificar áreas que se alineen con tu mercado objetivo.
      </p>
       {/* Indicación para seleccionar un barrio */}
       <p style={{
        margin: '20px',
        fontSize: '1em',
        color: '#4B4B4B',
        fontStyle: 'italic'
      }}>
        🔔 <strong>Selecciona un barrio en el mapa</strong> para obtener más información detallada sobre su demografía y características sociodemográficas.
      </p>
      <div style={{ display: 'flex', height: "65%", backgroundColor: "#F5F7FA" }}>
        <div id="map" style={{ height: "100%", width: "80%" }}>
        </div>
        <div style={{ width: "40%", padding: "10px", overflowY: "scroll", backgroundColor: "#fff7f8" }}>
          <InformationPanel selectedNeighborhood={selectedNeighborhood} barcelonaData={barcelonaData} />
        </div>
      </div>
      <div>
        <div style={{ padding: "10px",  textAlign: "center" }}>
          <button onClick={toggleComparePanel} style={{ marginBottom: '10px', backgroundColor: "#FF6F61", color: "#FFFFFF", padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
            {showComparePanel ? 'Ocultar panel comparación' : 'Comparar barrios demográficamente'}
          </button>
        </div>
        {showComparePanel && (
          <div style={{ height: "25%", backgroundColor: "#fff7f8", padding: "10px" }}>
            <ComparePanel neighborhoodsData={neighborhoods} />
          </div>
        )}
      </div>
      <div style={{ padding: "10px",  textAlign: "center" }}>
        <button onClick={toggleCompareSimilarPanel} style={{ marginBottom: '10px', backgroundColor: "#FF6F61", color: "#FFFFFF", padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          {showCompareSimilarPanel ? 'Ocultar panel barrios similares' : 'Comparar barrios por oferta'}
        </button>
      </div>
      {showCompareSimilarPanel && (
        <div style={{ height: "25%", backgroundColor: "#fff7f8", padding: "10px" }}>
          {selectedNeighborhood && selectedNeighborhood['Renta'] ? (
            <div>
              <h1>Barrio seleccionado: {selectedNeighborhood['Nombre']}</h1>
              <h2>Pertenece al distrito: {selectedNeighborhood['Distrito']}</h2>
              <p>La renta del barrio seleccionado es: <b>{selectedNeighborhood['Renta']}€</b></p>
              <ComparationBetweenNeigh renta={selectedNeighborhood['Renta']} />
            </div>
          ) : (
            <div
              style={{
                display: 'center',
                width: '40%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFC914',
                color: '#2A3A67',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #F5C6CB',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <i style={{ marginRight: '8px', fontSize: '20px' }} className="fas fa-exclamation-circle"></i>
              Primero debe seleccionar un barrio
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMaps;
