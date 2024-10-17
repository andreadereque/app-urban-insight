import React, { useState } from 'react';
import '../../../styles/ClickedLocalDetails.css'



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
      <div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Calificación</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRestaurants.map((restaurant, index) => (
              <tr key={index}>
                <td>{restaurant.name}</td>
                <td>{restaurant.price}</td>
                <td>{restaurant.rating}</td>
                <td>{restaurant.type || 'Desconocido'}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <span style={{ margin: '0 10px' }}>
            Página {currentPage} de {Math.ceil(filteredRestaurants.length / itemsPerPage)}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage)}>
            Siguiente
          </button>
        </div>
      </div>
    );
  };
  
  export default RestaurantTable;