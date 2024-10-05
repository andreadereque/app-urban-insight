import React, { useState } from 'react';

const FiltersInteractiveMaps = ({ onFilterChange }) => {
  const [ageRange, setAgeRange] = useState('');
  const [income, setIncome] = useState('');
  const [householdSize, setHouseholdSize] = useState('');

  const handleFilterChange = () => {
    onFilterChange({ ageRange, income, householdSize });
  };

  return (
    <div className="filters">
      <label>Rango de Edad:
        <select value={ageRange} onChange={e => setAgeRange(e.target.value)}>
          <option value="all">Todos</option>
          <option value="0-19">0-19 años</option>
          <option value="20-34">20-34 años</option>
          <option value="35-54">35-54 años</option>
        </select>
      </label>

      <label>Ingresos:
        <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Ingrese el ingreso mínimo" />
      </label>

      <label>Tamaño del Hogar:
        <select value={householdSize} onChange={e => setHouseholdSize(e.target.value)}>
          <option value="all">Todos</option>
          <option value="1">1 persona</option>
          <option value="2">2 personas</option>
          <option value="3">3 personas</option>
        </select>
      </label>

      <button onClick={handleFilterChange}>Aplicar Filtros</button>
    </div>
  );
};

export default FiltersInteractiveMaps;
