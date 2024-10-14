import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const PopularCategoriesChart = ({ categoryCountsByBarrio }) => {
  // Revisamos los datos para asegurarnos de que están correctos
  useEffect(() => {
    console.log("Datos de categorías por barrio:", categoryCountsByBarrio);
  }, [categoryCountsByBarrio]);

  const barrios = Object.keys(categoryCountsByBarrio); // Nombres de los barrios
  const popularCounts = barrios.map(barrio => categoryCountsByBarrio[barrio]?.[1] || 0); // Cantidad de restaurantes en esa categoría

  const data = {
    labels: barrios,
    datasets: [{
      label: 'Número de Restaurantes',
      data: popularCounts,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    scales: {
      x: { title: { display: true, text: 'Barrio' } },
      y: { title: { display: true, text: 'Número de Restaurantes' } }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const barrio = context.label; // Nombre del barrio
            const categoryInfo = categoryCountsByBarrio[barrio]; // Buscar la información de la categoría en el barrio
            if (categoryInfo) {
              const category = categoryInfo[0]; // Categoría más popular
              const count = context.raw; // Número de restaurantes
              return `${category}: ${count} restaurantes`;
            } else {
              return 'Categoría no disponible'; // Caso en que no haya datos disponibles
            }
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Categoría Más Popular por Barrio</h2>
      <div className="card" style={{ padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
  
};

export default PopularCategoriesChart;
