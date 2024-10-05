import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GenderDistributionAnalysis = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/demographics');
        const demographics = response.data;

        // Extracting neighborhood names and population data
        const neighborhoods = demographics.map(d => d.Nombre);
        const malePopulation = demographics.map(d => d['Población Hombres']);
        const femalePopulation = demographics.map(d => d['Población Mujeres']);

        // Setting up chart data
        setChartData({
          labels: neighborhoods,
          datasets: [
            {
              label: 'Hombres',
              data: malePopulation,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
              label: 'Mujeres',
              data: femalePopulation,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
          ]
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching demographics data:', error);
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
      <h2>Gender Distribution by Neighborhood</h2>
      {chartData.labels ? (
        <Bar 
        data={chartData} 
        options={{
          responsive: false,  // Disable responsiveness
          maintainAspectRatio: false,  // Prevent maintaining the aspect ratio
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          },
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Gender Distribution by Neighborhood' }
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

export default GenderDistributionAnalysis;
