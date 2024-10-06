import React, { useEffect } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement);

const ViabilityIndicatorsChart = ({ viabilityData }) => {
  // Revisamos los datos para asegurarnos de que están correctos
  useEffect(() => {
    console.log("Datos de viabilidad por barrio:", viabilityData);
  }, [viabilityData]);

  const barrios = viabilityData.map(item => item.Barrio); // Nombres de los barrios
  const viabilityScores = viabilityData.map(item => item.ViabilityScore); // Puntajes de viabilidad

  const data = {
    labels: barrios,
    datasets: [
      {
        label: 'Puntaje de Viabilidad de Negocios',
        data: viabilityScores,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: { title: { display: true, text: 'Barrio' } },
      y: { title: { display: true, text: 'Puntaje de Viabilidad' } },
    },
  };

  const radarData = {
    labels: barrios,
    datasets: [
      {
        label: 'Puntaje de Viabilidad de Negocios',
        data: viabilityScores,
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  return (
    <div className="chart-container">
      <h2>Indicadores de Viabilidad de Negocios por Barrio</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: '45%' }}>
          <Bar data={data} options={options} />
        </div>
        <div style={{ width: '45%' }}>
          <Radar data={radarData} />
        </div>
      </div>
    </div>
  );
};

export default ViabilityIndicatorsChart;
