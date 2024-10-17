import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import RestaurantTable from './clickLocal/RestaurantTable';
import RestaurantTypeChart from './clickLocal/RestaurantsTypeChart';

const ClickedLocalDetails = ({ title, infoNearRestaurants }) => {
    const [priceOptions, setPriceOptions] = useState([]); // Estado para opciones de precio
    const [typeOptions, setTypeOptions] = useState([]);   // Estado para opciones de tipo
    const [selectedPrices, setSelectedPrices] = useState([]); // Estado para los precios seleccionados
    const [selectedTypes, setSelectedTypes] = useState([]);   // Estado para los tipos seleccionados
  
    // useEffect para cargar los datos de precio y tipo del backend
    useEffect(() => {
      const fetchFilterOptions = async () => {
        try {
          // Obtener opciones de precio desde el backend
          const priceResponse = await fetch('http://127.0.0.1:5000/api/restaurant_price_categories');
          const priceData = await priceResponse.json();
          setPriceOptions(priceData);
  
          // Obtener opciones de tipo desde el backend
          const typeResponse = await fetch('http://127.0.0.1:5000/api/restaurant_cuisine_categories');
          const typeData = await typeResponse.json();
          setTypeOptions(typeData);
        } catch (error) {
          console.error('Error fetching filter options:', error);
        }
      };
  
      fetchFilterOptions();
    }, []);
  
    if (!title) return null; // No mostrar nada si no hay título
  
    // Manejar selección múltiple de precios
    const handlePriceChange = (event, value) => {
      setSelectedPrices(value);
    };
  
    // Manejar selección múltiple de tipos
    const handleTypeChange = (event, value) => {
      setSelectedTypes(value);
    };
  
    return (
      <div className="clicked-local-details">
        <h2>Local seleccionado: {title}</h2>
  
        {/* Filtro por precio */}
        <Autocomplete
          multiple
          options={priceOptions} // Opciones dinámicas obtenidas del backend
          value={selectedPrices}
          onChange={handlePriceChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por precio" placeholder="Selecciona precios" />
          )}
          style={{ width: 300, marginBottom: '20px' }}
        />
  
        {/* Filtro por tipo */}
        <Autocomplete
          multiple
          options={typeOptions} // Opciones dinámicas obtenidas del backend
          value={selectedTypes}
          onChange={handleTypeChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Filtrar por tipo" placeholder="Selecciona tipos" />
          )}
          style={{ width: 300, marginBottom: '20px' }}
        />
  
        {/* Tabla de restaurantes */}
        <RestaurantTable 
          infoNearRestaurants={infoNearRestaurants} 
          selectedPrices={selectedPrices} 
          selectedTypes={selectedTypes}
        />
  
        {/* Gráfico de tipos de restaurante */}
        <RestaurantTypeChart infoNearRestaurants={infoNearRestaurants} />
      </div>
    );
  };
  
  export default ClickedLocalDetails;