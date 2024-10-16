import React, { useEffect, useState } from 'react';
import LocalCountMap from './LocalCountMap';
import AveragePriceMap from './AveragePriceMap';
import axios from 'axios';

const NeighborhoodStatsContainer = () => {
  const [localCounts, setLocalCounts] = useState([]);
  const [averagePrices, setAveragePrices] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    const fetchLocalCounts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/empty_locals_count_by_neighborhood');
        setLocalCounts(response.data);
      } catch (error) {
        console.error('Error fetching local counts:', error);
      }
    };

    const fetchAveragePrices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/empty_locals_average_price_by_neighborhood');
        setAveragePrices(response.data);
      } catch (error) {
        console.error('Error fetching average prices:', error);
      }
    };

    const fetchNeighborhoods = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/neighborhoods');
        setNeighborhoods(response.data);
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
      }
    };

    fetchLocalCounts();
    fetchAveragePrices();
    fetchNeighborhoods();
  }, []);

  return (
    <div className="neighborhood-stats-container">
      <h2>Estadísticas de Locales por Barrio</h2>
      <div className="map-grid">
        <div className="map-container">
          <h3>Número de Locales</h3>
          <LocalCountMap localCounts={localCounts} neighborhoods={neighborhoods} />
        </div>
        <div className="map-container">
          <h3>Precio Medio por Barrio</h3>
          <AveragePriceMap averagePrices={averagePrices} neighborhoods={neighborhoods} />
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodStatsContainer;
