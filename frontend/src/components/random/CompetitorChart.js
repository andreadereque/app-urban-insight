import React from 'react';
import AccesibilityChart from './charts/demo/AccesibilityChart.js';
import CuisineChart from './charts/demo/CuisineChart.js';
import RatingChart from './charts/demo/RatingChart.js';
import PriceChart from './charts/demo/PriceChart.js';
const CompetitorChart = ({ data , accessibility}) => {
  return (
    <div>
      <h3>Análisis de competidores</h3>
      <p><b>Número de competidores cercanos: {data['Numero de restaurantes']} </b></p>
      <h4>Accesibilidad</h4>
      <p><b>La accesibilidad del local es de: {parseFloat(accessibility).toFixed(2)}</b></p>
      <AccesibilityChart data={data.Accesibilidad}  />
      <CuisineChart data={data["Categoria Cocina"]} />
      <RatingChart data={data.Nota} />
      <PriceChart data={data.Precio} />
    </div>
  );
};

export default CompetitorChart;
