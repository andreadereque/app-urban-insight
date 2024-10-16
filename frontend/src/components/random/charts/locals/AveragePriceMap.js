import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import L from 'leaflet';
import '../../../../styles/Tooltip.css';

const AveragePriceMap = ({ localPrices, neighborhoods }) => {
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

  const getColorForLocalPrice = (average_price) => {
    return average_price > 700 ? '#800026' :
           average_price > 500 ? '#BD0026' :
           average_price > 300 ? '#E31A1C' :
           average_price > 200 ? '#FC4E2A' :
           average_price > 100 ? '#FD8D3C' :
           average_price > 50  ? '#FEB24C' :
                                 '#FFEDA0'; // Colores para precios medios
};



  // Añadir la leyenda personalizada
  const addLegend = (map) => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend cute-legend');
      const grades = [0, 50, 100, 200, 300, 500, 700];
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColorForLocalPrice(grades[i] + 1) + '"></i> ' +
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

                const count = localPrices.find(item => item.Barrio.toLowerCase() === neighborhood.Nombre.toLowerCase())?.average_price || 0;
                const color = getColorForLocalPrice(count);
                const polygon = L.polygon(latLngs, {
                    color: 'purple',
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 2
                }).addTo(mapRef.current);

                polygon.bindTooltip(`
                  <div class="small-tooltip" style="text-align: center;">
                    <b>${neighborhood.Nombre}</b><br/>
                    Precio medio: ${count}€
                  </div>`, 
                {
                  permanent: true,
                  direction: "auto",
                  className: "custom-tooltip",
                  offset: L.point(0, 0),
                  interactive: true
                });

                polygon.feature = { properties: { name: neighborhood.Nombre } };
                neighborhoodLayersRef.current.push(polygon);
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

        // Asegurarse de que la leyenda se añada al mapa después de cargarlo
        if (!document.querySelector('.leaflet-control .legend')) {
            addLegend(mapRef.current);
        }
    }
}, [neighborhoods, localPrices]);

  return (
    <>
<div style={{ height: '100%', width: '100%' }}>
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

export default AveragePriceMap;
