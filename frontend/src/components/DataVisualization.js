import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const NationalityAnalysis = () => {
  const [demographics, setDemographics] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/demographics')
      .then(response => setDemographics(response.data))
      .catch(error => console.log('Error fetching demographics:', error));

    axios.get('http://127.0.0.1:5000/api/restaurants')
      .then(response => setRestaurants(response.data))
      .catch(error => console.log('Error fetching restaurants:', error));
  }, []);

  useEffect(() => {
    if (demographics.length && restaurants.length) {
      const labels = [];
      const data = [];

      demographics.forEach(demo => {
        const nationality = demo.nationality;
        const population = demo.population;
        const restaurantCount = restaurants.filter(restaurant => restaurant.cuisine === nationality).length;

        // Store data for chart
        labels.push(nationality);
        data.push(population / (restaurantCount || 1)); // Opportunity score
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Opportunity Score',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }
        ]
      });
    }
  }, [demographics, restaurants]);

  return (
    <div>
      <h1>Restaurant Opportunities by Nationality</h1>
      <Bar
        data={chartData}
        options={{
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

export default NationalityAnalysis;
