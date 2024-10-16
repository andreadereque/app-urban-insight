import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const AveragePriceBarChart = ({ localPrices }) => {
  const [visibleCount, setVisibleCount] = useState(20); // Controla cuántos barrios mostrar

  // Función para obtener los colores según el número de locales
  const getColor = (average_price, opacity = 1) => {
    return average_price > 700 ? `rgba(128, 0, 38, 0.7)` :    // #800026
           average_price > 500 ? `rgba(189, 0, 38,  0.7)` :    // #BD0026
           average_price > 300 ? `rgba(227, 26, 28,  0.7)` :   // #E31A1C
           average_price > 200 ? `rgba(252, 78, 42,  0.7)` :   // #FC4E2A
           average_price > 100 ? `rgba(253, 141, 60,  0.7)` :  // #FD8D3C
           average_price > 50  ? `rgba(254, 178, 76,  0.7)` :  // #FEB24C
                                 `rgba(255, 237, 160,  0.7)`;  // #FFEDA0
};



  // Datos visibles limitados por el número de barrios mostrados
  const visibleData = localPrices.slice(0, visibleCount);

  const data = {
    labels: visibleData.map(item => item.Barrio),
    datasets: [
      {
        label: 'Precio medio de Locales',
        data: visibleData.map(item => item.average_price),
        backgroundColor: visibleData.map(item => getColor(item.average_price)), // Colores del gráfico
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
    if (visibleCount >= localPrices.length) {
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

export default AveragePriceBarChart;
