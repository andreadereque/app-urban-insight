import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const AgeDistributionAnalysis = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/demographics');
        const demographics = response.data;

        const neighborhoods = demographics.map(d => d.Nombre);
        const ageGroups = ['0-19 años', '20-34 años', '35-54 años', '55-74 años', '75-100 años'];

        // Prepare data for each age group
        const dataForGroups = ageGroups.map(group => demographics.map(d => d['Distribución edad'][group]));

        // Prepare chart data
        setChartData({
          labels: neighborhoods,
          datasets: ageGroups.map((group, index) => ({
            label: group,
            data: dataForGroups[index],
            backgroundColor: `rgba(${100 + index * 50}, 99, 132, 0.6)`,
          }))
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
      <h2>Age Distribution by Neighborhood</h2>
      {chartData.labels ? (
        <Bar 
          data={chartData} 
          options={{ 
            scales: { y: { beginAtZero: true } },
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Age Distribution by Neighborhood' }
            }
          }} 
        />
      ) : (
        <p>No data available for the chart.</p>
      )}
    </div>
  );
};

export default AgeDistributionAnalysis;
