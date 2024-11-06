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
    <div className="col-md-4" ref={dropdownRef} style={{ position: 'relative', width: '400px' }}>
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
          border: '1px solid #A4D4AE',  // Verde Pastel para borde suave
          backgroundColor: '#F5F7FA',  // Fondo gris suave
          fontSize: '14px',
          color: '#2A3A67',  // Azul Marino Oscuro para el texto
          transition: 'box-shadow 0.3s ease',
          boxShadow: inputValue ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',  // Sombra solo cuando se escribe
        }}
      />
      {filteredBarrios.length > 0 && (
        <ul
          className="list-group"
          style={{
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
            backgroundColor: '#FFFFFF',  // Fondo blanco para la lista
          }}
        >
          {filteredBarrios.map((barrio, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelectBarrio(barrio)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedBarrios.includes(barrio) ? '#FFB774' : '#F5F7FA',  // Naranja Claro al seleccionar
                padding: '10px 15px',
                borderBottom: '1px solid #ECECEC',
                color: '#2A3A67',  // Azul Marino Oscuro
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
          <span
            key={index}
            style={{
              display: 'inline-block',
              backgroundColor: '#FFC914',  // Mostaza Suave
              borderRadius: '20px',
              padding: '5px 15px',
              margin: '5px',
              color: '#2A3A67',  // Azul Marino Oscuro para el texto
              fontWeight: '500',
              position: 'relative',
              fontSize: '14px',
            }}
          >
            {barrio}
            <button
              onClick={() => handleRemoveBarrio(barrio)}
              style={{
                marginLeft: '8px',
                color: '#FF6F61',  // Coral Suave para la "✕"
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                border: 'none',
                background: 'none',
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
