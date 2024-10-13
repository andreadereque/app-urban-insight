import React from 'react';
import AccesibilityChart from './charts/AccesibilityChart.js';
import CuisineChart from './charts/CuisineChart.js';
import RatingChart from './charts/RatingChart.js';
import PriceChart from './charts/PriceChart.js';
const CompetitorChart = ({ data }) => {
  return (
    <div>
      <h3>Competidores Cercanos</h3>
      <AccesibilityChart data={data.Accesibilidad} />
      <CuisineChart data={data["Categoria Cocina"]} />
      <RatingChart data={data.Nota} />
      <PriceChart data={data.Precio} />
    </div>
  );
};

export default CompetitorChart;
