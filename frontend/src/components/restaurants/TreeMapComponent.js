import React, { useEffect } from 'react';
import * as d3 from 'd3';

const TreeMapComponent = ({ data }) => {
  useEffect(() => {
    console.log('Datos recibidos en TreeMapComponent:', data);
    
    const width = 400;
    const height = 400;
    const legendWidth = 150;  // Ancho de la leyenda
    const totalWidth = width + legendWidth;  // Sumar el espacio de la leyenda al total

    // Definir la paleta de colores "coquette"
    const colors = [
      '#FADADD', '#F5B7B1', '#FDEDEC', '#A9CCE3', '#AED6F1',
      '#D4E6F1', '#D5DBDB', '#D2B4DE', '#F9E79F', '#F7DC6F'
    ];

    const maxValue = d3.max(data.children, d => d.value) || 0;
    const step = Math.ceil(maxValue / colors.length);
    const colorRanges = colors.map((color, i) => ({
      color,
      range: [i * step, (i + 1) * step - 1],
    }));

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapLayout = d3.treemap().size([width, height]).padding(2);
    treemapLayout(root);

    d3.select('#treemap').selectAll('*').remove();

    const svg = d3.select('#treemap')
      .attr('width', totalWidth)
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
        return range ? range.color : '#D5DBDB';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Ajustar el tamaño de la fuente dinámicamente
    nodes.append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .style('font-weight', 'bold')
      .text(d => `${d.data.name}: ${d.value}`)
      .style('font-size', function(d) {
        const boxWidth = d.x1 - d.x0;
        const boxHeight = d.y1 - d.y0;
        // Calcular un tamaño de fuente que se ajuste al tamaño del rectángulo
        return `${Math.min(boxWidth / d.data.name.length, boxHeight / 3)}px`;  
      })
      .each(function(d) {
        const text = d3.select(this);
        const boxWidth = d.x1 - d.x0;
        // Si el texto es más largo que el cuadro, acortarlo con "..."
        while (text.node().getComputedTextLength() > boxWidth - 6) {
          const str = text.text();
          text.text(str.slice(0, -1) + '...');
        }
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 10)`);

    legend.selectAll('rect')
      .data(colorRanges)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 30)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => d.color);

    legend.selectAll('text')
      .data(colorRanges)
      .enter()
      .append('text')
      .attr('x', 30)
      .attr('y', (d, i) => i * 30 + 15)
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '12px')
      .text(d => `${d.range[0]} - ${d.range[1]}`);
      
  }, [data]);

  if (!data || !data.children || data.children.length === 0) {
    return <p>No hay datos disponibles para el Tree Map</p>;
  }

  return <svg id="treemap"></svg>;
};

export default TreeMapComponent;
