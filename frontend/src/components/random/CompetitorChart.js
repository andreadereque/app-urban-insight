import React, { useState } from 'react';
import AccesibilityChart from './charts/demo/AccesibilityChart.js';
import CuisineChart from './charts/demo/CuisineChart.js';
import RatingChart from './charts/demo/RatingChart.js';
import PriceChart from './charts/demo/PriceChart.js';
import Modal from 'react-modal'; // Asegúrate de tener react-modal instalado

const CompetitorChart = ({ data, accessibility }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div style={{
      backgroundColor: '#E8E8E8', /* Gris claro para un fondo neutro */
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      color: '#2A3A67', /* Azul Marino para el texto */
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ color: '#2A3A67', marginBottom: '10px' }}>Análisis de competidores</h3>
      <p style={{ color: '#4B4B4B', fontSize: '16px' }}>
        <b>Número de competidores cercanos: {data['Numero de restaurantes']}</b>
      </p>
      <h4 style={{ color: '#2A3A67', marginTop: '20px', marginBottom: '10px' }}>Accesibilidad</h4>
      <p style={{ color: '#4B4B4B', fontSize: '14px' }}>
        <b>La accesibilidad del local es de: {parseFloat(accessibility).toFixed(2)} 
          <span 
            style={{ fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px' }} 
            onClick={openModal}
          >
            ¿Qué es la accesibilidad?
          </span>
        </b>
      </p>

      {/* Modal para definición de accesibilidad */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
            position: 'fixed',                   // Asegura que cubre toda la ventana
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,                        // Z-index alto para asegurarse de que esté en la parte superior
        },
        content: {
            position: 'fixed',              // Mantener el modal fijo en la pantalla
            bottom: '0',                    // Colocarlo en la parte inferior
            left: '50%',                    // Centrar horizontalmente
            transform: 'translateX(-50%)',  // Alinear en el centro
            borderRadius: '8px',
            padding: '10px 20px',          // Ajustar el padding para un poco de espacio interno
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',  
            height:'235px',            // Ancho máximo para mantener el tamaño pequeño
            zIndex: 1000,                   // Asegúrate de que esté en la parte superior
        },
        }}
      >
        <h2 style={{ color: '#2A3A67' }}>¿Qué es la accesibilidad?</h2>
        <p style={{ color: '#4B4B4B', fontSize: '14px' }}>
          La accesibilidad se refiere a la capacidad de acceder a una ubicación específica mediante transporte público o privado. Para calcularla, se recopilan todas las estaciones de transporte y parkings dentro de un radio determinado alrededor de la ubicación objetivo.
        </p>
        <button onClick={closeModal} style={{ marginTop: '10px', backgroundColor: '#FF6F61', color: '#FFFFFF', borderRadius: '4px', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>
          Cerrar
        </button>
      </Modal>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AccesibilityChart data={data.Accesibilidad} />
        <CuisineChart data={data["Categoria Cocina"]} />
        <RatingChart data={data.Nota} />
        <PriceChart data={data.Precio} />
      </div>
    </div>
  );
};

export default CompetitorChart;
