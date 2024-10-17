import React, { useEffect, useState } from 'react';
import LocalCountMap from './charts/locals/LocalCountMap';
import LocalCountBarChart from './charts/locals/LocalCountBarChart';
import axios from 'axios';
import '../../styles/NeighborhoodStatsContainer.css';
import AveragePriceMap from './charts/locals/AveragePriceMap';
import AveragePriceBarChart from './charts/locals/AveragePriceBarChart';

const NeighborhoodStatsContainer = () => {
    const [localCounts, setLocalCounts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [localPrices, setLocalPrices] = useState([]);


    useEffect(() => {
        const fetchLocalCounts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/empty_locals_count_by_neighborhood');
                setLocalCounts(response.data);

            } catch (error) {
                console.error('Error fetching local counts:', error);
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
        const fetchLocalPrices = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/empty_locals_average_price_by_neighborhood');
                setLocalPrices(response.data);
            } catch (error) {
                console.error('Error fetching local prices:', error);
            }
        };
        fetchLocalCounts();
        fetchNeighborhoods();
        fetchLocalPrices();
    }, []);


    return (
        <div>
            <h4>Número de locales disponibles por barrio</h4>
            <div className="map-and-chart-half">
                {neighborhoods.length > 0 && localCounts.length > 0 && (
                  <div className="map-container-half">
                      <LocalCountMap localCounts={localCounts} neighborhoods={neighborhoods} />
                  </div>
                )}
                {localCounts.length > 0 && (
                  <div className="chart-container-half">
                      <LocalCountBarChart localCounts={localCounts} /> {/* Gráfico de barras */}
                  </div>
                )}
            </div>
            <h4>Media de precio por local por barrio</h4>
            <div className="map-and-chart-half">
                {neighborhoods.length > 0 && localPrices.length > 0 && (
                  <div className="map-container-half">
                      <AveragePriceMap localPrices={localPrices} neighborhoods={neighborhoods} />
                  </div>
                )}
                {localPrices.length > 0 && (
                  <div className="chart-container-half">
                      <AveragePriceBarChart localPrices={localPrices} neighborhoods={neighborhoods} />
                  </div>
                )}
            </div>
        </div>
    );
};






export default NeighborhoodStatsContainer;
