import React from 'react';

const CategoriaPrecioFilter = ({ selectedCategoriaPrecio, setSelectedCategoriaPrecio, categoriasPrecio }) => (
  <div className="col-md-4">
    <label className="form-label">Categoría Precio:</label>
    <select
      className="form-select"
      value={selectedCategoriaPrecio}
      onChange={(e) => setSelectedCategoriaPrecio(e.target.value)}
    >
      <option value="">Todas</option>
      {categoriasPrecio.map(categoria => (
        <option key={categoria} value={categoria}>{categoria}</option>
      ))}
    </select>
  </div>
);

export default CategoriaPrecioFilter;
