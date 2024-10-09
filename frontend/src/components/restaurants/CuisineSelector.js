import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CuisineSelector = ({ selectedCuisine, setSelectedCuisine }) => {
  const [restaurantTypes, setRestaurantTypes] = useState([]);

  useEffect(() => {
    // Fetch the restaurant types from the backend
    axios.get("http://127.0.0.1:5000/api/restaurant_types")
      .then(response => {
        setRestaurantTypes(response.data.types);
      })
      .catch(error => {
        console.error("Error fetching restaurant types", error);
      });
  }, []);

  return (
    <select
      value={selectedCuisine}
      onChange={(e) => setSelectedCuisine(e.target.value)}
      style={{
        marginBottom: '10px',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        fontSize: '16px',
      }}
    >
      <option value="">Seleccionar tipo de cocina</option>
      {restaurantTypes.map((type, index) => (
        <option key={index} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
};

export default CuisineSelector;
