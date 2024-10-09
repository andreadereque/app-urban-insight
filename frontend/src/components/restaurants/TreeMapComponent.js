import React, { useEffect } from 'react';
import * as d3 from 'd3';

const TreeMapComponent = ({ data }) => {
  useEffect(() => {
    console.log('Datos recibidos en TreeMapComponent:', data);
    
    const width = 800;
    const height = 400;
    const legendWidth = 150;  // Ancho de la leyenda
    const totalWidth = width + legendWidth;  // Sumar el espacio de la leyenda al total

    // Definir la paleta de colores "coquette"
    const colors = [
      '#FADADD', // Soft Pink
      '#F5B7B1', // Light Coral
      '#FDEDEC', // Blush
      '#A9CCE3', // Light Blue
      '#AED6F1', // Soft Sky Blue
      '#D4E6F1', // Light Periwinkle
      '#D5DBDB', // Light Grey
      '#D2B4DE', // Lavender
      '#F9E79F', // Light Yellow
      '#F7DC6F'  // Soft Lemon
    ];

    // Crear rangos de valores basados en el número de nodos
    const maxValue = d3.max(data.children, d => d.value) || 0;  // Máximo valor
    const step = Math.ceil(maxValue / colors.length);  // Calcular el tamaño de los rangos
    const colorRanges = colors.map((color, i) => ({
      color,
      range: [i * step, (i + 1) * step - 1],
    }));

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapLayout = d3.treemap().size([width, height]).padding(2);
    treemapLayout(root);

    // Limpiar el contenido anterior
    d3.select('#treemap').selectAll('*').remove();

    const svg = d3.select('#treemap')
      .attr('width', totalWidth)  // Ajustar el ancho para incluir la leyenda
      .attr('height', height);

    const nodes = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Asignar colores basados en los rangos de valor
    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        const range = colorRanges.find(r => d.value >= r.range[0] && d.value <= r.range[1]);
        return range ? range.color : '#D5DBDB';  // Si no hay coincidencia, usar gris claro
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .text(d => `${d.data.name}: ${d.value}`)
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .style('font-weight', 'bold');

    // Crear la leyenda
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 10)`);  // Posicionar la leyenda al lado derecho

    // Añadir los rectángulos de color en la leyenda
    legend.selectAll('rect')
      .data(colorRanges)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 30)  // Espacio entre los elementos de la leyenda
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => d.color);

    // Añadir etiquetas de texto a la leyenda con los rangos de valores
    legend.selectAll('text')
      .data(colorRanges)
      .enter()
      .append('text')
      .attr('x', 30)  // Espacio a la derecha del rectángulo de color
      .attr('y', (d, i) => i * 30 + 15)  // Alinear con el rectángulo de color
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '12px')
      .text(d => `${d.range[0]} - ${d.range[1]}`);
      
  }, [data]);

  // Si los datos son inválidos o vacíos, no renderizar el Tree Map
  if (!data || !data.children || data.children.length === 0) {
    return <p>No hay datos disponibles para el Tree Map</p>;
  }

  return <svg id="treemap"></svg>;
};

export default TreeMapComponent;
