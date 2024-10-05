import React from 'react';
import { Bar } from 'react-chartjs-2';

const InformationPanel = ({ selectedNeighborhood, barcelonaData }) => {
  const data = selectedNeighborhood || barcelonaData;
  console.log('Datos del barrio seleccionado o Barcelona:', data);  // Debugging

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

  // Log para depurar
  console.log('Distribución de edad:', distribucionEdad);
  console.log('Distribución de inmigración:', distribucionInmigracion);
  console.log('Distribución por habitaciones:', distribucionHabitaciones);

  // Age Distribution Chart
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

  // Immigration Distribution Chart
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

  // Rooms Distribution Chart
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

  // Opciones de tamaño para los gráficos
  const chartOptions = {
    maintainAspectRatio: false, // Permite controlar mejor el tamaño
    responsive: true,
  };

  return (
    <div className="information-panel">
      <h2>{selectedNeighborhood ? selectedNeighborhood.Nombre : 'Barcelona'}</h2>
      <p><strong>District:</strong> {selectedNeighborhood ? selectedNeighborhood.Distrito : 'All districts'}</p>
      <p><strong>Renta (Average):</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Renta : data.renta)}</p>
      <p><strong>Población:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood.Poblacion : data.poblacion)}</p>
      <p><strong>Población con estudios bajos:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población con estudios bajos'] : data.estudiosBajos)}%</p>
      <p><strong>Trabajadores de baja calificación:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Trabajadores de baja calificación'] : data.trabajadoresBajaCalificacion)}%</p>
      <p><strong>Población ocupada:</strong> {formatNumber(selectedNeighborhood ? selectedNeighborhood['Población ocupada'] : data.poblacionOcupada)}%</p>

      {/* Age Distribution Chart */}
      <h3>Distribución por Edad</h3>
      {distribucionEdad ? (
        <div style={{ height: '150px', width:'400px' }}>
          <Bar data={barDataEdad} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}

      {/* Immigration Distribution Chart */}
      <h3>Distribución por Inmigración</h3>
      {distribucionInmigracion ? (
        <div style={{ height: '150px' , width:'400px'}}>
          <Bar data={barDataInmigracion} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}

      {/* Rooms Distribution Chart */}
      <h3>Distribución por Habitaciones</h3>
      {distribucionHabitaciones ? (
        <div style={{ height: '150px' , width:'400px'}}>
          <Bar data={barDataHabitaciones} options={chartOptions} />
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default InformationPanel;
