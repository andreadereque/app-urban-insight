import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const LocalCountBarChart = ({ localCounts }) => {
  const [visibleCount, setVisibleCount] = useState(20); // Controla cuántos barrios mostrar

  // Función para obtener los colores según el número de locales
  const getColor = (count) => {
    return count > 100 ? 'rgba(128, 0, 38, 0.7)' :  // Aumenta opacidad
           count > 50  ? 'rgba(189, 0, 38, 0.7)' :
           count > 20  ? 'rgba(227, 26, 28, 0.7)' :
           count > 10  ? 'rgba(252, 78, 42, 0.7)' :
           count > 5   ? 'rgba(253, 141, 60, 0.7)' :
           count > 1   ? 'rgba(254, 178, 76, 0.7)' :
                         'rgba(255, 237, 160, 0.7)'; // Haz que las barras sean menos opacas
};

  // Datos visibles limitados por el número de barrios mostrados
  const visibleData = localCounts.slice(0, visibleCount);

  const data = {
    labels: visibleData.map(item => item.Barrio),
    datasets: [
      {
        label: 'Número de Locales',
        data: visibleData.map(item => item.count),
        backgroundColor: visibleData.map(item => getColor(item.count)), // Colores del gráfico
      },
    ],
  };

  const options = {
    plugins: {
        datalabels: {
          display: true,
          color: 'black', // Color del texto
          font: {
            weight: 'bold', // Negrita
            size: 8, // Tamaño más pequeño
          },
          anchor: 'center',  // Ubicación del texto dentro de la barra
          align: 'center',   // Alinear el texto en el centro de la barra
        },
      },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Funciones para manejar el incremento o decremento de barrios
  const handleShowMore = () => {
    if (visibleCount >= localCounts.length) {
      alert('Ya has alcanzado el máximo número de barrios.');
    } else {
      setVisibleCount(prev => prev + 10);
    }
  };

  const handleShowLess = () => {
    if (visibleCount <= 10) {
      alert('Ya has alcanzado el mínimo de barrios.');
    } else {
      setVisibleCount(prev => prev - 10);
    }
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Bar data={data} options={options} />
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleShowMore} className="button-show">
          Mostrar más barrios
        </button>
        <button onClick={handleShowLess} className="button-show">
          Mostrar menos barrios
        </button>
      </div>
    </div>
  );
};

export default LocalCountBarChart;
