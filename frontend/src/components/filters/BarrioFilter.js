import React, { useState, useEffect, useRef } from 'react';

const BarrioFilter = ({ selectedBarrio, setSelectedBarrio, barrios }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredBarrios, setFilteredBarrios] = useState([]);
  const dropdownRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === '') {
      setFilteredBarrios([]); // Si el campo de texto está vacío, ocultamos el desplegable
    } else {
      const filtered = barrios.filter((barrio) =>
        barrio.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBarrios(filtered);
    }
  };

  const handleSelectBarrio = (barrio) => {
    setSelectedBarrio(barrio);
    setInputValue(barrio);
    setFilteredBarrios([]);
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
    <div className="col-md-4" ref={dropdownRef} style={{ position: 'relative', width: '200px' }}> {/* Ampliamos el ancho del input */}
      <input
        type="text"
        className="filter-select"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Escribe un barrio..."
        style={{
          width: '100%',  /* El input ocupará el 100% del contenedor */
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
          width: '100%',  /* El desplegable tendrá el mismo ancho que el input */
          borderRadius: '10px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          zIndex: '1000',
          maxHeight: '200px',  /* Aumentamos la altura del desplegable */
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
                backgroundColor: '#f9f9f9',
                padding: '10px 15px',
                borderBottom: '1px solid #ececec',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ffedea'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f9f9f9'}
            >
              {barrio}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BarrioFilter;
