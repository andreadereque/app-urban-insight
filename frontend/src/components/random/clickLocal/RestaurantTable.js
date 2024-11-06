import React, { useState } from 'react';
import '../../../styles/ClickedLocalDetails.css';

const RestaurantTable = ({ infoNearRestaurants, selectedPrices, selectedTypes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar restaurantes por los precios seleccionados y los tipos seleccionados
  const filteredRestaurants = infoNearRestaurants.filter((restaurant) => {
    const priceMatch = selectedPrices.length > 0 ? selectedPrices.includes(restaurant.price) : true;
    const typeMatch = selectedTypes.length > 0 ? selectedTypes.includes(restaurant.type) : true;
    return priceMatch && typeMatch;
  });

  // Calcular el índice de los elementos a mostrar
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  // Cambiar de página
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredRestaurants.length / itemsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', backgroundColor: '#f7f9fc', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#FF6F61', color: '4B4B4B', padding:'12px'}}>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>Nombre</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>Precio</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>Calificación</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRestaurants.map((restaurant, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F5F9' }}>
              <td style={{ padding: '10px', textAlign: 'center' }}>{restaurant.name}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{restaurant.price}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{restaurant.rating}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{restaurant.type || 'Desconocido'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1} 
          style={{
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            color: currentPage === 1 ? '#A4D4AE' : '#2A3A67',
            cursor: currentPage === 1 ? 'default' : 'pointer',
            fontWeight: 'bold',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          ←
        </button>
        <span style={{ margin: '0 10px', color: '#4B4B4B', fontWeight: 'bold' }}>
          Página {currentPage} de {Math.ceil(filteredRestaurants.length / itemsPerPage)}
        </span>
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage)} 
          style={{
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            color: currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage) ? '#A4D4AE' : '#2A3A67',
            cursor: currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage) ? 'default' : 'pointer',
            fontWeight: 'bold',
            opacity: currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage) ? 0.5 : 1
          }}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default RestaurantTable;
