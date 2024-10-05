import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataFetch = () => {
  const [demographics, setDemographics] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // Fetch demographic data
    axios.get('http://127.0.0.1:5000/api/demographics')
      .then(response => {
        setDemographics(response.data);
      })
      .catch(error => console.log('Error fetching demographics:', error));

    // Fetch restaurant data
    axios.get('http://127.0.0.1:5000/api/restaurants')
      .then(response => {
        setRestaurants(response.data);
      })
      .catch(error => console.log('Error fetching restaurants:', error));
  }, []);

  return (
    <div>
      <h1>Data Fetch Example</h1>
      <p>Demographic Data: {JSON.stringify(demographics)}</p>
      <p>Restaurant Data: {JSON.stringify(restaurants)}</p>
    </div>
  );
};

export default DataFetch;
