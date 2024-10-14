import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';

// Registra el plugin
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, ChartDataLabels);

const CuisineChart = ({ data }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);
  
    // Encontrar el índice de la clave 'General'
    const generalIndex = labels.indexOf('General');
  
    let generalLabel = null;
    let generalValue = null;
  
    // Si 'General' existe, guardarlo y excluirlo de labels y values
    if (generalIndex !== -1) {
      generalLabel = labels[generalIndex];
      generalValue = values[generalIndex];
  
      labels.splice(generalIndex, 1);
      values.splice(generalIndex, 1);
    }
  

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Categoría Cocina',
        data: values,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
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
      <h4>Categoría Cocina</h4>
      <Bar data={chartData} options={chartOptions} />
    
    </div>
  );
};

export default CuisineChart;
