import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Filters from '../filters/Filters';
import RestaurantMap from './RestaurantMap';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cambiar el estado de selectedBarrio a selectedBarrios
  const [selectedBarrios, setSelectedBarrios] = useState([]);
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

  // Actualizar el filtro para usar selectedBarrios
  const filtered = useMemo(() => {
    return restaurants.filter(restaurant => (
      (selectedBarrios.length === 0 || selectedBarrios.includes(restaurant.Barrio)) &&
      (selectedCategoriaCocina === '' || restaurant['Categoría Cocina'] === selectedCategoriaCocina) &&
      (filterByNota(restaurant, selectedNota)) &&
      (selectedCategoriaPrecio === '' || restaurant['Categoría Precio'] === selectedCategoriaPrecio)
    ));
  }, [selectedBarrios, selectedCategoriaCocina, selectedNota, selectedCategoriaPrecio, restaurants]);

  useEffect(() => {
    setFilteredRestaurants(filtered);
  }, [filtered]);

  if (loading) return <p>Cargando los datos de los restaurantes...</p>;
  if (error) return <p>{error}</p>;

  const barrios = [...new Set(restaurants.map(r => r.Barrio))];
  const categoriasCocina = [...new Set(restaurants.map(r => r['Categoría Cocina']))];
  const categoriasPrecio = [...new Set(restaurants.map(r => r['Categoría Precio']))];

  return (
    <div style={{ padding: '20px',  borderRadius: '8px' }}>
      <h1 style={{ margin: '20px', fontSize: '2em', color: '#2A3A67' }}>Análisis de Restaurantes</h1>
      <p style={{
        margin: '20px',
        fontSize: '1.1em',
        color: '#4B4B4B',
        lineHeight: '1.6',
        borderLeft: '4px solid #FF6F61',
        paddingLeft: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        🧭 Utiliza el análisis de esta pestaña para explorar la distribución de restaurantes en los barrios de Barcelona. Filtra por <strong>categoría de cocina</strong>, <strong>calificación</strong> y <strong>rango de precios</strong> para descubrir zonas ideales para tu negocio.
        <br />
        🔍 Identifica áreas con alta concentración de competencia o descubre <strong>oportunidades estratégicas</strong> en barrios menos saturados.
        <br />
        📊 Visualiza patrones de consumo y preferencias por barrio, usando datos precisos para apoyar tus decisiones.
      </p>
      <p style={{ margin: '20px', fontSize: '1em', color: '#4B4B4B' }}>
        Total de restaurantes: <span className="badge" style={{ backgroundColor: '#FF6F61', color: '#FFFFFF', fontSize: '0.9em', padding: '8px 12px', borderRadius: '4px' }}>{filteredRestaurants.length}</span>
      </p>
      <Filters
        selectedBarrios={selectedBarrios}
        setSelectedBarrios={setSelectedBarrios}
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

}

export default RestaurantList;
