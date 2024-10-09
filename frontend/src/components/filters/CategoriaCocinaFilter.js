import React from 'react';

const CategoriaCocinaFilter = ({ selectedCategoriaCocina, setSelectedCategoriaCocina, categoriasCocina }) => (
  <div className="col-md-4">
    <label className="form-label">Categoría Cocina:</label>
    <select className="form-select" value={selectedCategoriaCocina} onChange={e => setSelectedCategoriaCocina(e.target.value)}>
      <option value=''>Todas</option>
      {categoriasCocina.map(categoria => (
        <option key={categoria} value={categoria}>{categoria}</option>
      ))}
    </select>
  </div>
);

export default CategoriaCocinaFilter;
