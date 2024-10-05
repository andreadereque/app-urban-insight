import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

import Filters from '../filters/Filters';
import RestaurantMap from './RestaurantMap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/customClusterStyles.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/restaurants')
      .then(response => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error al cargar los datos de los restaurantes.');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return restaurants.filter(restaurant => (
      (selectedBarrio === '' || restaurant.Barrio === selectedBarrio) &&
      (selectedTipo === '' || restaurant.Tipo === selectedTipo)
    ));
  }, [selectedBarrio, selectedTipo, restaurants]);

  useEffect(() => {
    setFilteredRestaurants(filtered);
  }, [filtered]);

  if (loading) return <p>Cargando los datos de los restaurantes...</p>;
  if (error) return <p>{error}</p>;

  const barrios = [...new Set(restaurants.map(r => r.Barrio))];
  const tipos = [...new Set(restaurants.map(r => r.Tipo))];

  return (
    <div className="container">
      <h1 className="my-4">Mapa de Restaurantes</h1>
      <p className="text-muted mb-3">
        Total de restaurantes: <span className="badge bg-primary">{filteredRestaurants.length}</span>
      </p>
      <Filters
        selectedBarrio={selectedBarrio}
        setSelectedBarrio={setSelectedBarrio}
        selectedTipo={selectedTipo}
        setSelectedTipo={setSelectedTipo}
        barrios={barrios}
        tipos={tipos}
      />
      <RestaurantMap filteredRestaurants={filteredRestaurants} />
    </div>
  );
};

export default RestaurantList;