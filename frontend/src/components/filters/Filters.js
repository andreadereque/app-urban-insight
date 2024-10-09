import React from 'react';
import BarrioFilter from './BarrioFilter';
import CustomFilter from './CustomFilter';

const Filters = ({
    selectedBarrios, setSelectedBarrios,
  selectedCategoriaCocina, setSelectedCategoriaCocina,
  selectedNota, setSelectedNota,
  selectedCategoriaPrecio, setSelectedCategoriaPrecio,
  barrios, categoriasCocina, categoriasPrecio
}) => (
  <div className="filter-container">
    <div className="filter-wrapper">
    <BarrioFilter selectedBarrios={selectedBarrios} setSelectedBarrios={setSelectedBarrios} barrios={barrios} />
    </div>
    <div className="filter-wrapper">
      <CustomFilter selectedValue={selectedCategoriaCocina} setSelectedValue={setSelectedCategoriaCocina} options={categoriasCocina} placeholder="Tipo de Cocina" />
    </div>
    <div className="filter-wrapper">
      <CustomFilter selectedValue={selectedNota} setSelectedValue={setSelectedNota} options={['1-2', '2-3', '3-4', '4-5']} placeholder="Nota" />
    </div>
    <div className="filter-wrapper">
      <CustomFilter selectedValue={selectedCategoriaPrecio} setSelectedValue={setSelectedCategoriaPrecio} options={categoriasPrecio} placeholder="Rango de Precio" />
    </div>
  </div>
);

export default Filters;
