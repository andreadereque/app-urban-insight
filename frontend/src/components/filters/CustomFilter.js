import React from 'react';

const CustomFilter = ({ selectedValue, setSelectedValue, options, placeholder }) => (
  <select
    className="filter-select"
    value={selectedValue}
    onChange={(e) => setSelectedValue(e.target.value)}
  >
    <option value="">{`${placeholder}`}</option>  {/* Cambiamos el texto por defecto */}
    {options.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

export default CustomFilter;
