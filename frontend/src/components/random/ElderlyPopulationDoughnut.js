import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,  // Correct element for doughnut chart
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register necessary Chart.js components for Doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ElderlyPopulationDoughnut = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/demographics');
        const demographics = response.data;

        const neighborhoods = demographics.map(d => d.Nombre);
        const elderlyPopulation = demographics.map(d => d['Distribución edad']['75-100 años']);

        // Prepare chart data
        setChartData({
          labels: neighborhoods,
          datasets: [{
            label: 'Elderly Population (75+ years)',
            data: elderlyPopulation,
            backgroundColor: neighborhoods.map((_, index) => `rgba(${(index * 50) % 255}, 99, 132, 0.6)`),
          }]
        });

        setLoading(false);
      } catch (error) {
        setError('Error loading demographic data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Elderly Population (75+) per Neighborhood</h2>
      {chartData.labels ? (
        <Doughnut 
        data={chartData} 
        options={{
          responsive: false,  // Disable responsiveness
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Elderly Population (75+) per Neighborhood' }
          }
        }}
        width={400}  // Set fixed width
        height={300}  // Set fixed height
      />
      
      ) : (
        <p>No data available for the chart.</p>
      )}
    </div>
  );
};

export default ElderlyPopulationDoughnut;
