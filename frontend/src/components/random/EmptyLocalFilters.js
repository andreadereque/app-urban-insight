import React from 'react';
import '../../styles/EmptyLocalFilters.css'; // Cambia esta línea

const EmptyLocalFilters = ({ barrios, onFilterChange }) => {
  return (
    <div className="filter-container">
      <label className="filter-label">
        Barrio:
        <select className="filter-select" onChange={(e) => onFilterChange('barrio', e.target.value)}>
          <option value="">Todos</option>
          {barrios.map((barrio, index) => (
            <option key={index} value={barrio}>
              {barrio}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-label">
        Precio Mínimo:
        <input
          type="number"
          className="filter-input"
          onChange={(e) => onFilterChange('precioMin', e.target.value)}
          placeholder="Mínimo"
        />
      </label>

      <label className="filter-label">
        Precio Máximo:
        <input
          type="number"
          className="filter-input"
          onChange={(e) => onFilterChange('precioMax', e.target.value)}
          placeholder="Máximo"
        />
      </label>
    </div>
  );
};

export default EmptyLocalFilters;
