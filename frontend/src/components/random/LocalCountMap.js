import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import L from 'leaflet';
import '../../styles/Tooltip.css';

const LocalCountMap = ({ localCounts, neighborhoods }) => {
  const mapRef = useRef(null);
  const neighborhoodLayersRef = useRef([]);
  const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs"; // Proyección UTM para Barcelona
  const minZoomForAllTooltips = 14;  // Nivel de zoom para mostrar todos los tooltips
  const initialZoom = 12;  // Zoom inicial alejado
  const maxZoom = 18;  // Nivel de zoom máximo (más cercano)

  const importantNeighborhoods = [
    'el Raval', 'la Barceloneta', 'la Sagrada Família', 'la Dreta de l\'Eixample',
    'l\'Antiga Esquerra de l\'Eixample', 'la Nova Esquerra de l\'Eixample', 'Sants', 'les Corts',
    'Vallcarca i els Penitents', 'el Putxet i el Farró', 'el Baix Guinardó', 'el Carmel',
    'la Font d’en Fargues', 'el Camp d’en Grassot i Gràcia Nova', 'el Congrés i els Indians',
    'Navas', 'Vallvidrera, el Tibidabo i les Planes', 'Sant Martí de Provençals',
    'la Marina del Prat Vermell', 'Diagonal Mar i el Front Marítim del Poblenou', 'el Poblenou',
    'Provençals del Poblenou', 'la Verneda i la Pau', 'el Guinardó', 'Can Baró',
    'Sarrià', 'Pedralbes', 'Sant Andreu', 'Hostafrancs', 'el Barri Gòtic', 'el Fort Pienc'
  ]; // Lista de barrios importantes que deben mostrarse siempre

  const getColorForLocalCount = (count) => {
    return count > 100 ? '#800026' :
           count > 50  ? '#BD0026' :
           count > 20  ? '#E31A1C' :
           count > 10  ? '#FC4E2A' :
           count > 5   ? '#FD8D3C' :
           count > 1   ? '#FEB24C' :
                         '#FFEDA0';
  };

  // Añadir la leyenda personalizada
  const addLegend = (map) => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend cute-legend'); // Añadimos la clase CSS `cute-legend`
      const grades = [0, 1, 5, 10, 20, 50, 100];
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColorForLocalCount(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(map);
  };

  const updateTooltipVisibility = (mapZoom) => {
    neighborhoodLayersRef.current.forEach(polygon => {
      const tooltipElement = polygon.getTooltip();
      if (tooltipElement) {
        const tooltipElementDOM = tooltipElement.getElement();
        if (tooltipElementDOM) {
          const neighborhoodName = polygon.feature.properties.name;
          if (importantNeighborhoods.includes(neighborhoodName) || mapZoom >= minZoomForAllTooltips) {
            tooltipElementDOM.style.display = '';  // Mostrar el tooltip
          } else {
            tooltipElementDOM.style.display = 'none';  // Ocultar los tooltips cuando el zoom es bajo
          }
        }
      }
    });
  };

  useEffect(() => {
    if (mapRef?.current && neighborhoods.length > 0) {
      neighborhoodLayersRef.current.forEach(layer => {
        if (mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      neighborhoodLayersRef.current = [];

      neighborhoods.forEach((neighborhood) => {
        if (neighborhood.Geometry && neighborhood.Geometry.coordinates.length > 0) {
          const coordinates = neighborhood.Geometry.coordinates[0];
          const latLngs = coordinates.map(coord => {
            const [easting, northing] = coord;
            const latLng = proj4(utmZone, "WGS84", [easting, northing]);
            return [latLng[1], latLng[0]];  // Leaflet usa formato [lat, lng]
          });

          const count = localCounts.find(item => item.Barrio.toLowerCase() === neighborhood.Nombre.toLowerCase())?.count || 0;
          const color = getColorForLocalCount(count);  // Asignar color basado en el número de locales

          const polygon = L.polygon(latLngs, {
            color: 'purple',
            fillColor: color,
            fillOpacity: 0.7,
            weight: 2
          }).addTo(mapRef.current);

          polygon.bindTooltip(`
            <div class="small-tooltip" style="text-align: center;">
              <b>${neighborhood.Nombre}</b><br/>
              Locales: ${count}
            </div>`, 
            {
              permanent: true,  // El tooltip siempre se muestra
              direction: "auto",  // Cambiar el posicionamiento a automático
              className: "custom-tooltip",  // Clase CSS personalizada
              offset: L.point(0, 0),  // Ajustar la posición
              interactive: true // Permitir la interacción con el tooltip
            });

          polygon.feature = { properties: { name: neighborhood.Nombre } };
          neighborhoodLayersRef.current.push(polygon);  // Añadir el polígono a las capas
        } else {
          console.warn("El barrio no tiene coordenadas válidas:", neighborhood);
        }
      });

      const bounds = neighborhoodLayersRef.current.map(layer => layer.getBounds());
      if (bounds.length > 0) {
        const combinedBounds = bounds.reduce((acc, val) => acc.extend(val), L.latLngBounds(bounds[0]));
        mapRef.current.fitBounds(combinedBounds);
      }

      mapRef.current.on('zoomend', () => {
        const mapZoom = mapRef.current.getZoom();
        updateTooltipVisibility(mapZoom);
      });

      updateTooltipVisibility(mapRef.current.getZoom());

      // Añadir la leyenda al mapa después de cargarlo
      addLegend(mapRef.current);
    }
  }, [neighborhoods, localCounts]);  // Ejecutar cuando se carguen los barrios o cambien los locales

  return (
    <>
      <div style={{ height: '400px', width: '50%' }}>
        <MapContainer
          ref={mapRef}
          center={[41.3851, 2.1734]}  // Centro de Barcelona
          zoom={initialZoom}  // Zoom inicial
          minZoom={initialZoom}  // Zoom más alejado permitido
          maxZoom={maxZoom}  // Zoom más cercano permitido
          scrollWheelZoom={true}  // Permitir zoom con la rueda del ratón
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          />
        </MapContainer>
      </div>
    </>
  );
};

export default LocalCountMap;
