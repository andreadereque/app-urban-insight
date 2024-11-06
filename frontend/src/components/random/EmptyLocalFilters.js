import React, { useState, useEffect, useRef } from 'react';

const EmptyLocalFilters = ({ barrios, onFilterChange }) => {
  const [selectedBarrios, setSelectedBarrios] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredBarrios, setFilteredBarrios] = useState([]);
  const dropdownRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === '') {
      setFilteredBarrios([]);
    } else {
      const filtered = barrios.filter((barrio) =>
        barrio.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBarrios(filtered);
    }
  };

  const handleSelectBarrio = (barrio) => {
    if (!selectedBarrios.includes(barrio)) {
      const updatedBarrios = [...selectedBarrios, barrio];
      setSelectedBarrios(updatedBarrios);
      onFilterChange('barrio', updatedBarrios);
    }
    setInputValue('');
    setFilteredBarrios([]);
  };

  const handleRemoveBarrio = (barrio) => {
    const updatedBarrios = selectedBarrios.filter((selected) => selected !== barrio);
    setSelectedBarrios(updatedBarrios);
    onFilterChange('barrio', updatedBarrios);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredBarrios([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        backgroundColor: '#F5F7FA',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Selector de Barrio */}
      <div style={{ position: 'relative', width: '220px', flexShrink: 0 }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Escribe un barrio..."
          style={{
            width: '100%',
            borderRadius: '20px',
            padding: '8px 12px',
            border: '1px solid #A4D4AE',
            backgroundColor: '#F5F7FA',
            fontSize: '14px',
            color: '#2A3A67',
          }}
        />
        {filteredBarrios.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              width: '100%',
              borderRadius: '10px',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
              zIndex: '1000',
              maxHeight: '150px',
              overflowY: 'auto',
              marginTop: '5px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {filteredBarrios.map((barrio, index) => (
              <li
                key={index}
                onClick={() => handleSelectBarrio(barrio)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedBarrios.includes(barrio) ? '#FFB774' : '#F5F7FA',
                  padding: '8px 12px',
                  borderBottom: '1px solid #ECECEC',
                  color: '#2A3A67',
                }}
              >
                {barrio}
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {selectedBarrios.map((barrio, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#FFC914',
                borderRadius: '15px',
                padding: '5px 10px',
                color: '#2A3A67',
                fontSize: '13px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {barrio}
              <button
                onClick={() => handleRemoveBarrio(barrio)}
                style={{
                  marginLeft: '5px',
                  color: '#FF6F61',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontSize: '12px',
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Precio Mínimo */}
      <div style={{ width: '100px', flexShrink: 0 }}>
        <input
          type="number"
          onChange={(e) => onFilterChange('precioMin', e.target.value)}
          placeholder="Mínimo"
          style={{
            width: '100%',
            borderRadius: '20px',
            padding: '8px 10px',
            border: '1px solid #FFC914',
            backgroundColor: '#FFFFFF',
            color: '#4B4B4B',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Precio Máximo */}
      <div style={{ width: '100px', flexShrink: 0 }}>
        <input
          type="number"
          onChange={(e) => onFilterChange('precioMax', e.target.value)}
          placeholder="Máximo"
          style={{
            width: '100%',
            borderRadius: '20px',
            padding: '8px 10px',
            border: '1px solid #FFC914',
            backgroundColor: '#FFFFFF',
            color: '#4B4B4B',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
};

export default EmptyLocalFilters;
