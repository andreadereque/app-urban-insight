import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Filters from './Filters';
import RestaurantMap from './RestaurantMap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Asegúrate de que Bootstrap esté importado correctamente
import '../../styles/customClusterStyles.css'; // Importa tu archivo de estilos personalizados

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Llamada a la API para obtener los restaurantes
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/restaurants')
      .then(response => {
        setRestaurants(response.data);
        console.log("***********",response.data)
        setLoading(false);
      })
      .catch(error => {
        setError('Error al cargar los datos de los restaurantes.');
        setLoading(false);
      });
  }, []); // Solo se ejecuta una vez al montar el componente

  // Uso de useMemo para evitar renders innecesarios
  const filtered = useMemo(() => {
    return restaurants.filter(restaurant => {
      return (
        (selectedBarrio === '' || restaurant.Barrio === selectedBarrio) &&
        (selectedTipo === '' || restaurant.Tipo === selectedTipo)
      );
    });
  }, [selectedBarrio, selectedTipo, restaurants]);

  // Actualizar los restaurantes filtrados cuando cambien los filtros o los restaurantes
  useEffect(() => {
    setFilteredRestaurants(filtered);
  }, [filtered]);

  if (loading) return <p>Cargando los datos de los restaurantes...</p>;
  if (error) return <p>{error}</p>;

  // Obtener opciones únicas para los filtros
  const barrios = [...new Set(restaurants.map(r => r.Barrio))];
  const tipos = [...new Set(restaurants.map(r => r.Tipo))];

  return (
    <div className="container">
      <h1 className="my-4">Mapa de Restaurantes</h1>
      <p className="text-muted mb-3">
        Total de restaurantes: <span className="badge bg-primary">{filteredRestaurants.length}</span>
      </p>

      {/* Filtros de barrio, nota y tipo */}
      <Filters
        selectedBarrio={selectedBarrio}
        setSelectedBarrio={setSelectedBarrio}
        selectedTipo={selectedTipo}
        setSelectedTipo={setSelectedTipo}
        barrios={barrios}
        tipos={tipos}
      />

      {/* Mapa con restaurantes filtrados */}
      <RestaurantMap filteredRestaurants={filteredRestaurants} />
    </div>
  );
};

export default RestaurantList;
