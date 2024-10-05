import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import proj4 from 'proj4';  // Coordinate conversion
import InformationPanel from './InformationPanel';  // Import the InformationPanel
import ComparePanel from './ComparePanels';  // Import the ComparePanel

const InteractiveMaps = ({ filters }) => {
  const mapRef = useRef(null);  // Reference for the map
  const [barcelonaData, setBarcelonaData] = useState(null);  // Aggregated data for Barcelona
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);  // Selected neighborhood data
  const [neighborhoods, setNeighborhoods] = useState([]);  // Store neighborhoods data
  const [showComparePanel, setShowComparePanel] = useState(false);  // State to toggle compare panel

  useEffect(() => {
    const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";  // UTM zone for Barcelona

    // Fetch filtered data from the backend
    axios.get("http://127.0.0.1:5000/api/demographics", { params: filters })
      .then(response => {
        const neighborhoods = response.data;
        setNeighborhoods(neighborhoods);  // Store the data
        if (neighborhoods && neighborhoods.length) {
          calculateBarcelonaData(neighborhoods);  // Aggregate data for Barcelona

          // Initialize the map
          if (!mapRef.current) {
            const barcelonaBounds = [[41.3200, 2.0691], [41.4700, 2.2299]];

            mapRef.current = L.map('map', {
              center: [41.3851, 2.1734],  // Center on Barcelona
              zoom: 12,
              dragging: false,  // Disable dragging
              maxBounds: barcelonaBounds,
              zoomControl: true,
              minZoom: 12,
              maxZoom: 19,
            });

            // Add tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap © CARTO',
            }).addTo(mapRef.current);
          }

          // Add polygons for neighborhoods
          neighborhoods.forEach((neighborhood) => {
            const coordinates = neighborhood.Geometry.coordinates[0];

            const latLngs = coordinates.map(coord => {
              const [easting, northing] = coord;
              const latLng = proj4(utmZone, "WGS84", [easting, northing]);
              return [latLng[1], latLng[0]];
            });

            L.polygon(latLngs, { color: 'magenta', fillOpacity: 0.2 })
              .addTo(mapRef.current)
              .on('click', () => {
                setSelectedNeighborhood(neighborhood);  // Set the selected neighborhood
              });
          });
        }
      })
      .catch(error => console.error("Error fetching data: ", error));
  }, [filters]);

  // Function to calculate aggregated data for Barcelona
  const calculateBarcelonaData = (neighborhoods) => {
    const aggregatedData = {
      renta: 0,
      poblacion: 0,
      estudiosBajos: 0,
      trabajadoresBajaCalificacion: 0,
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

    setBarcelonaData(aggregatedData);
  };

  // Function to toggle the compare panel
  const toggleComparePanel = () => {
    setShowComparePanel(!showComparePanel);
  };

  return (
    <div style={{ flexDirection: 'column', height: "170vh", backgroundColor: "#f7e6e6" }}>
  {/* Button to toggle the compare panel */}
  <div style={{ padding: "10px", backgroundColor: "#fff7f8", textAlign: "center" }}>
    <button onClick={toggleComparePanel} style={{ marginBottom: '10px' }}>
      {showComparePanel ? 'Hide Compare Panel' : 'Compare Two Neighborhoods'}
    </button>
  </div>

  {/* Map and Information Panel Section */}
  <div style={{ display: 'flex', height: "65%", backgroundColor: "#f7e6e6" }}>
    {/* Map Section */}
    <div id="map" style={{ height: "100%", width: "80%" }}>
      {/* Map container */}
    </div>

    {/* Information Panel Section */}
    <div style={{ width: "40%", padding: "10px", overflowY: "scroll", backgroundColor: "#fff7f8" }}>
      <InformationPanel selectedNeighborhood={selectedNeighborhood} barcelonaData={barcelonaData} />
    </div>
  </div>

  {/* Compare Panel Section */}
  {showComparePanel && (
    <div style={{ height: "25%", backgroundColor: "#fff7f8", padding: "10px" }}>
      <ComparePanel neighborhoodsData={neighborhoods} />
    </div>
  )}
</div>

  
  );
};

export default InteractiveMaps;
