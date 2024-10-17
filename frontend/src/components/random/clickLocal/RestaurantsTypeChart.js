import React from 'react';
import { Bar } from 'react-chartjs-2';

const RestaurantTypeChart = ({ infoNearRestaurants }) => {
  // Contar cuántos restaurantes hay de cada tipo
  const typeCount = infoNearRestaurants.reduce((acc, restaurant) => {
    const type = restaurant.type || 'Desconocido'; // Si no tiene tipo, marcarlo como 'Desconocido'
    if (!acc[type]) {
      acc[type] = 1;
    } else {
      acc[type]++;
    }
    return acc;
  }, {});

  // Convertir el objeto en arrays para usar en el gráfico
  const data = {
    labels: Object.keys(typeCount),
    datasets: [
      {
        label: 'Número de restaurantes por tipo',
        data: Object.values(typeCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
      <h4>Distribución de tipos de restaurante en este barrio</h4>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RestaurantTypeChart;
