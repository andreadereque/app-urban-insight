import React, { useEffect, useState } from 'react';
import LocalCountMap from './charts/locals/LocalCountMap';
import LocalCountBarChart from './charts/locals/LocalCountBarChart';
import axios from 'axios';
import '../../styles/NeighborhoodStatsContainer.css';

const NeighborhoodStatsContainer = () => {
    const [localCounts, setLocalCounts] = useState([]);
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

        const fetchNeighborhoods = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/neighborhoods');
                setNeighborhoods(response.data);
            } catch (error) {
                console.error('Error fetching neighborhoods:', error);
            }
        };

        fetchLocalCounts();
        fetchNeighborhoods();
    }, []);

    return (
        <div >
        <h4>Número de locales disponibles por barrio</h4>
        <div className="map-and-chart-half">
            <div className="map-container-half">
                <LocalCountMap localCounts={localCounts} neighborhoods={neighborhoods} />
            </div>
            <div className="chart-container-half">
                <LocalCountBarChart localCounts={localCounts} /> {/* Gráfico de barras */}
            </div>
        </div>
    </div>
    
    );




};

export default NeighborhoodStatsContainer;
