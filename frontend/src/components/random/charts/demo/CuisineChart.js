import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, ChartDataLabels);

const CuisineChart = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Categoría Cocina',
        data: values,
        backgroundColor: '#FFB774', // Naranja Claro
        borderColor: '#2A3A67',     // Azul Marino
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      datalabels: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FF6F61',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFC914',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4B4B4B',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#4B4B4B',
        },
      },
    },
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#F5F7FA', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#2A3A67', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Distribución de Categorías de Cocina</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ backgroundColor: '#FFB774', width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
          <span style={{ color: '#2A3A67', fontSize: '12px' }}>Categoría Cocina</span>
        </div>
      </div>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default CuisineChart;
