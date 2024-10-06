import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const ViabilityIndicatorsChart = ({ viabilityData }) => {
  // Revisamos los datos para asegurarnos de que están correctos
  useEffect(() => {
    console.log("Datos de viabilidad por barrio:", viabilityData);
  }, [viabilityData]);

  const barrios = viabilityData.map(item => item.Barrio); // Nombres de los barrios
  const viabilityScores = viabilityData.map(item => item.ViabilityScore); // Puntajes de viabilidad

  const data = {
    labels: barrios,
    datasets: [{
      label: 'Puntaje de Viabilidad de Negocios',
      data: viabilityScores,
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    scales: {
      x: { title: { display: true, text: 'Barrio' } },
      y: { title: { display: true, text: 'Puntaje de Viabilidad' } }
    }
  };

  return (
    <div className="chart-container">
      <h2>Indicadores de Viabilidad de Negocios por Barrio</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ViabilityIndicatorsChart;
