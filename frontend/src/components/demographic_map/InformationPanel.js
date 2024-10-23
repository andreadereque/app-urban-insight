import React from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registra las escalas y elementos necesarios para Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InformationPanel = ({ selectedNeighborhood, barcelonaData }) => {
  const data = selectedNeighborhood || barcelonaData;

  if (!data) return null;

  const formatNumber = (value) => {
    if (value == null || isNaN(parseFloat(value))) {
      return 'N/A';
    }
    return parseFloat(value.toString().replace(',', '.')).toFixed(2);
  };

  // Manejar las diferentes claves para Barcelona y barrios
  const distribucionEdad = data.distribucionEdad || data['Distribución edad'];
  const distribucionInmigracion = data.distribucionInmigracion || data['Distribución immigración'];
  const distribucionHabitaciones = data.distribucionHabitaciones || data['Distribución habitación por casas'];

  // Datos para los gráficos
  const barDataEdad = {
    labels: Object.keys(distribucionEdad || {}),
    datasets: [
      {
        label: 'Distribución por Edad',
        data: Object.values(distribucionEdad || {}).map((value) => parseFloat(value)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  const barDataInmigracion = {
    labels: Object.keys(distribucionInmigracion || {}),
    datasets: [
      {
        label: 'Distribución por Inmigración',
        data: Object.values(distribucionInmigracion || {}).map((value) => parseFloat(value)),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  const barDataHabitaciones = {
    labels: Object.keys(distribucionHabitaciones || {}),
    datasets: [
      {
        label: 'Distribución por Habitaciones',
        data: Object.values(distribucionHabitaciones || {}).map((value) => parseFloat(value)),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  // Opciones de tamaño flexible para los gráficos
  const chartOptions = {
    maintainAspectRatio: true, // Mantener el aspecto, pero flexible
    responsive: true,
    plugins: {
      datalabels: {
        display: false,  // Esto oculta los números dentro de las barras
      },
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="information-panel">

      <h2>{selectedNeighborhood ? selectedNeighborhood.Nombre : 'Barcelona'}</h2>
      <p><strong>District:</strong> {selectedNeighborhood ? selectedNeighborhood.Distrito : 'All districts'}</p>
      <p><strong>Renta (Average):</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Renta : data.renta)}</p>
      <p><strong>Población:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Poblacion : data['Poblacion'] || '1655956')}</p>
      <p><strong>Densidad de Población:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Densidad poblacion'] : '16339,0')}</p>
      <p><strong>Población con estudios bajos:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población con estudios bajos'] : data['estudiosBajos'])}%</p>
      <p><strong>Trabajadores de baja calificación:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Trabajadores de baja calificación'] : data['trabajadoresBajaCalificacion'])}%</p>
      <p><strong>Población ocupada:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población ocupada'] : data['poblacionOcupada'])}%</p>

      {/* Gráfico de Distribución por Edad */}
      <h3>Distribución por Edad</h3>
      {distribucionEdad ? (
        <div style={{ height: 'auto', width: '100%' }}> {/* Ancho 100% para ajustar dinámicamente */}
          <Bar data={barDataEdad} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}

      {/* Gráfico de Distribución por Inmigración */}
      <h3>Distribución por Inmigración</h3>
      {distribucionInmigracion ? (
        <div style={{ height: 'auto', width: '100%' }}> {/* Ancho 100% para ajustar dinámicamente */}
          <Bar data={barDataInmigracion} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}

      {/* Gráfico de Distribución por Habitaciones */}
      <h3>Distribución por Habitaciones</h3>
      {distribucionHabitaciones ? (
        <div style={{ height: 'auto', width: '100%' }}> {/* Ancho 100% para ajustar dinámicamente */}
          <Bar data={barDataHabitaciones} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default InformationPanel;
