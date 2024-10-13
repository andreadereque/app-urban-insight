import React, { useEffect } from 'react';
import L from 'leaflet';

const HeatmapLegend = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    // Crear el control de la leyenda
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 10, 25, 50, 75, 100, 150];
      const colors = [
        '#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'
      ];

      // Añadir un estilo personalizado a la leyenda
      div.innerHTML = '<h4 style="margin: 5px 0; font-size: 16px; font-weight: bold;">Nº Restaurantes</h4>';
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      div.style.fontSize = '14px';
      div.style.color = '#333';

      // Crear la leyenda con los colores y los valores
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border-radius: 4px;"></i> ` +
          `${grades[i]}${(grades[i + 1] ? `&ndash;${grades[i + 1]}<br>` : '+')}`;
      }
      return div;
    };

    legend.addTo(map);

    // Remover leyenda cuando el componente se desmonte
    return () => {
      map.removeControl(legend);
    };
  }, [map]);

  return null; // No renderiza elementos JSX directamente
};

export default HeatmapLegend;
