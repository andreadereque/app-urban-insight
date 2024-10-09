import React, { useState, useEffect, useRef } from 'react';

const BarrioFilter = ({ selectedBarrios, setSelectedBarrios, barrios }) => {
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
      setSelectedBarrios([...selectedBarrios, barrio]);
    }
    setInputValue('');
    setFilteredBarrios([]);
  };

  const handleRemoveBarrio = (barrio) => {
    setSelectedBarrios(selectedBarrios.filter((selected) => selected !== barrio));
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
    <div className="col-md-4" ref={dropdownRef} style={{ position: 'relative', width: '200px' }}>
      <input
        type="text"
        className="filter-select"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Escribe un barrio..."
        style={{
          width: '100%',
          borderRadius: '25px',
          padding: '10px 15px',
          border: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9',
          fontSize: '14px',
          transition: 'box-shadow 0.3s ease',
        }}
      />
      {filteredBarrios.length > 0 && (
        <ul className="list-group" style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          width: '100%',
          borderRadius: '10px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          zIndex: '1000',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '5px',
        }}>
          {filteredBarrios.map((barrio, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelectBarrio(barrio)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedBarrios.includes(barrio) ? '#ffedea' : '#f9f9f9',
                padding: '10px 15px',
                borderBottom: '1px solid #ececec',
                transition: 'background-color 0.2s',
              }}
            >
              {barrio}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '10px' }}>
        {selectedBarrios.map((barrio, index) => (
          <span key={index} style={{
            display: 'inline-block',
            backgroundColor: '#ffedea',
            borderRadius: '15px',
            padding: '5px 10px',
            margin: '5px',
            position: 'relative',
          }}>
            {barrio}
            <button
              onClick={() => handleRemoveBarrio(barrio)}
              style={{
                position: 'absolute',
                top: '-10px',  // Coloca el botón sobre el contorno
                right: '-10px',  // Alinea el botón a la derecha
                backgroundColor: 'transparent',
                border: 'none',
                color: '#000000',  // Cambia el color a negro
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default BarrioFilter;
