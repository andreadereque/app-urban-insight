import React from 'react';
import { Bar } from 'react-chartjs-2';

const CompetitorChart = ({ data }) => {
  // Formatear los datos para el gráfico
  const chartData = {
    labels: data.map((item) => item.Nombre),
    datasets: [
      {
        label: 'Categoría Precio',
        data: data.map((item) => item['Categoría Precio']),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Nota',
        data: data.map((item) => item.Nota),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h3>Competidores Cercanos</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default CompetitorChart;
