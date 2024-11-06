import React from 'react';
import BarrioFilter from './BarrioFilter';
import CustomFilter from './CustomFilter';

const Filters = ({
  selectedBarrios, setSelectedBarrios,
  selectedCategoriaCocina, setSelectedCategoriaCocina,
  selectedNota, setSelectedNota,
  selectedCategoriaPrecio, setSelectedCategoriaPrecio,
  barrios, categoriasCocina, categoriasPrecio
}) => {

  const clearFilters = () => {
    setSelectedBarrios([]);
    setSelectedCategoriaCocina('');
    setSelectedNota('');
    setSelectedCategoriaPrecio('');
  };

  return (
    <div className="filter-container">
     
      <BarrioFilter selectedBarrios={selectedBarrios} setSelectedBarrios={setSelectedBarrios} barrios={barrios} />

      <CustomFilter selectedValue={selectedCategoriaCocina} setSelectedValue={setSelectedCategoriaCocina} options={categoriasCocina} placeholder="Tipo de Cocina" />
      <CustomFilter selectedValue={selectedNota} setSelectedValue={setSelectedNota} options={['1-2', '2-3', '3-4', '4-5']} placeholder="Nota" />
      <CustomFilter selectedValue={selectedCategoriaPrecio} setSelectedValue={setSelectedCategoriaPrecio} options={categoriasPrecio} placeholder="Rango de Precio" />
      
      {/* Botón para limpiar los filtros */}
      <button onClick={clearFilters} className="btn-clear-filters">
        Limpiar Filtros
      </button>
    </div>
  );
};

export default Filters;
