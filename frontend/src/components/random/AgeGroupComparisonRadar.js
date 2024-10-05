import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Register the required components from Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const AgeGroupComparisonRadar = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/demographics');
        const demographics = response.data;

        // Process data for age groups across neighborhoods
        const labels = demographics.map(d => d.Nombre);
        const ageGroup1 = demographics.map(d => d['AgeGroup1']);
        const ageGroup2 = demographics.map(d => d['AgeGroup2']);
        const ageGroup3 = demographics.map(d => d['AgeGroup3']);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Age Group 1',
              data: ageGroup1,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Age Group 2',
              data: ageGroup2,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Age Group 3',
              data: ageGroup3,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
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
      <h2>Age Group Comparison</h2>
      {chartData.labels ? (
       <Radar 
       data={chartData} 
       options={{
         responsive: false,  // Disable responsiveness
         maintainAspectRatio: false,
         plugins: {
           legend: { position: 'top' },
           title: { display: true, text: 'Age Group Comparison' }
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

export default AgeGroupComparisonRadar;
