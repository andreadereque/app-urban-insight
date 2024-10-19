import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';

// Registra el plugin
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, ChartDataLabels);

const RatingChart = ({ data }) => {
  const labels = data[1];
  const values = data[0];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nota',
        data: values,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      datalabels: {
        display: false,  // Ocultar números en las barras
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h4>Nota</h4>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default RatingChart;
