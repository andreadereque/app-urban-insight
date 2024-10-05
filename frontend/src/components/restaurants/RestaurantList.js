import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Filters from '../filters/Filters';
import RestaurantMap from './RestaurantMap';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [selectedCategoriaCocina, setSelectedCategoriaCocina] = useState('');
  const [selectedNota, setSelectedNota] = useState('');
  const [selectedCategoriaPrecio, setSelectedCategoriaPrecio] = useState('');

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

  const filterByNota = (restaurant, selectedNota) => {
    const nota = parseFloat(restaurant.Nota);
    if (!selectedNota) return true;

    const [min, max] = selectedNota.split('-').map(n => parseFloat(n));
    return nota >= min && nota <= max;
  };

  const filtered = useMemo(() => {
    return restaurants.filter(restaurant => (
      (selectedBarrio === '' || restaurant.Barrio === selectedBarrio) &&
      (selectedCategoriaCocina === '' || restaurant['Categoría Cocina'] === selectedCategoriaCocina) &&
      (filterByNota(restaurant, selectedNota)) &&
      (selectedCategoriaPrecio === '' || restaurant['Categoría Precio'] === selectedCategoriaPrecio)
    ));
  }, [selectedBarrio, selectedCategoriaCocina, selectedNota, selectedCategoriaPrecio, restaurants]);

  useEffect(() => {
    setFilteredRestaurants(filtered);
  }, [filtered]);

  if (loading) return <p>Cargando los datos de los restaurantes...</p>;
  if (error) return <p>{error}</p>;

  const barrios = [...new Set(restaurants.map(r => r.Barrio))];
  const categoriasCocina = [...new Set(restaurants.map(r => r['Categoría Cocina']))];
  const categoriasPrecio = [...new Set(restaurants.map(r => r['Categoría Precio']))];

  return (
    <div className="container">
      <h1 className="my-4">Mapa de Restaurantes</h1>
      <p className="text-muted mb-3">
        Total de restaurantes: <span className="badge bg-primary">{filteredRestaurants.length}</span>
      </p>
      <Filters
        selectedBarrio={selectedBarrio}
        setSelectedBarrio={setSelectedBarrio}
        selectedCategoriaCocina={selectedCategoriaCocina}
        setSelectedCategoriaCocina={setSelectedCategoriaCocina}
        selectedNota={selectedNota}
        setSelectedNota={setSelectedNota}
        selectedCategoriaPrecio={selectedCategoriaPrecio}
        setSelectedCategoriaPrecio={setSelectedCategoriaPrecio}
        barrios={barrios}
        categoriasCocina={categoriasCocina}
        categoriasPrecio={categoriasPrecio}
      />
      <RestaurantMap filteredRestaurants={filteredRestaurants} />
    </div>
  );
};

export default RestaurantList;
