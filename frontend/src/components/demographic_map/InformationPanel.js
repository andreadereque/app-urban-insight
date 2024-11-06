import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartDataLabels);

const InformationPanel = ({ selectedNeighborhood, barcelonaData }) => {
  const data = selectedNeighborhood || barcelonaData;

  if (!data) return null;

  const formatNumber = (value) => {
    if (value == null || isNaN(parseFloat(value))) {
      return 'N/A';
    }
    return parseFloat(value.toString().replace(',', '.')).toFixed(2);
  };

  const distribucionEdad = data.distribucionEdad || data['Distribución edad'];
  const distribucionInmigracion = data.distribucionInmigracion || data['Distribución immigración'];
  const distribucionHabitaciones = data.distribucionHabitaciones || data['Distribución habitación por casas'];

  const generateChartData = (data, label, backgroundColor) => ({
    labels: Object.keys(data || {}),
    datasets: [
      {
        label,
        data: Object.values(data || {}).map((value) => parseFloat(value)),
        backgroundColor,
        borderColor: '#2A3A67', // Azul Marino
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    plugins: {
      datalabels: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FF6F61', // Coral
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFC914', // Mostaza
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4B4B4B', // Gris oscuro
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#4B4B4B', // Gris oscuro
        },
      },
    },
  };

  const renderBarChart = (chartData, title, legendColor) => (
    <div style={{ padding: '15px', backgroundColor: '#F5F7FA', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#2A3A67', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ backgroundColor: legendColor, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
          <span style={{ color: '#2A3A67', fontSize: '12px' }}>{title}</span>
        </div>
      </div>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#F5F7FA', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ color: '#2A3A67', fontSize: '18px', fontWeight: 'bold' }}>{selectedNeighborhood ? selectedNeighborhood.Nombre : 'Barcelona'}</h2>
      <p style={{ color: '#4B4B4B' }}><strong>District:</strong> {selectedNeighborhood ? selectedNeighborhood.Distrito : 'All districts'}</p>
      <p style={{ color: '#4B4B4B' }}><strong>Renta (Average):</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Renta : data.renta)}</p>
      <p style={{ color: '#4B4B4B' }}><strong>Población:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Poblacion : data['Poblacion'] || '1655956')}</p>
      <p style={{ color: '#4B4B4B' }}><strong>Densidad de Población:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Densidad poblacion'] : '16339,0')}</p>
      <p style={{ color: '#4B4B4B' }}><strong>Población con estudios bajos:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población con estudios bajos'] : data['estudiosBajos'])}%</p>
      <p style={{ color: '#4B4B4B' }}><strong>Trabajadores de baja calificación:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Trabajadores de baja calificación'] : data['trabajadoresBajaCalificacion'])}%</p>
      <p style={{ color: '#4B4B4B' }}><strong>Población ocupada:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población ocupada'] : data['poblacionOcupada'])}%</p>

      {/* Gráfico de Distribución por Edad */}
      {renderBarChart(
        generateChartData(distribucionEdad, 'Distribución por Edad', '#FF6F61'),
        'Distribución por Edad',
        '#FF6F61'
      )}

      {/* Gráfico de Distribución por Inmigración */}
      {renderBarChart(
        generateChartData(distribucionInmigracion, 'Distribución por Inmigración', '#A4D4AE'),
        'Distribución por Inmigración',
        '#A4D4AE'
      )}

      {/* Gráfico de Distribución por Habitaciones */}
      {renderBarChart(
        generateChartData(distribucionHabitaciones, 'Distribución por Habitaciones', '#ADD8E6'),
        'Distribución por Habitaciones',
        '#ADD8E6'
      )}
    </div>
  );
};

export default InformationPanel;
