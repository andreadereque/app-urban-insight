import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AppInfo = () => {
  return (
    <Container style={{ padding: '20px', backgroundColor: '#F5F7FA' }}>
      <h1 style={{ color: '#2A3A67', textAlign: 'center' }}>Bienvenido a Urban Insight</h1>
      
      <Row>
        <Col md={12}>
          <Card style={{ margin: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Card.Body>
              <Card.Title style={{ color: '#2A3A67' }}>¿Qué es Urban Insight?</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Urban Insight es una plataforma diseñada para ayudar a los emprendedores a tomar decisiones informadas sobre la ubicación de nuevos restaurantes. La herramienta proporciona análisis avanzados de datos sociodemográficos, competencia y accesibilidad, permitiendo a los usuarios visualizar la información de manera efectiva.
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>Misión</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Facilitar a los emprendedores la capacidad de realizar un estudio de mercado exhaustivo, aumentando así las posibilidades de éxito en la apertura de nuevos restaurantes.
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>Visión</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Que ningún restaurante tenga que cerrar por escoger una mala ubicación.
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>Valores</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                <ul>
                  <li>🌟 <strong>Enfoque en la experiencia del usuario.</strong></li>
                  <li>🔍 <strong>Calidad y precisión de los datos.</strong></li>
                  <li>💡 <strong>Innovación constante en análisis de datos.</strong></li>
                  <li>📊 <strong>Transparencia en la proveniencia y metodología de los datos.</strong></li>
                </ul>
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>¿Por qué somos los mejores?</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Urban Insight combina datos precisos y actualizados con una interfaz intuitiva, facilitando el acceso a información clave para la toma de decisiones. Nuestro compromiso con la calidad y la atención al detalle nos posiciona como líderes en el análisis del mercado.
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>¿Qué nos diferencia?</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                A diferencia de otras plataformas, Urban Insight no solo ofrece datos, sino que los presenta de manera visual y comprensible, permitiendo a los usuarios realizar análisis comparativos de forma sencilla. Además, contamos con un equipo de expertos que asegura la calidad de los datos y proporciona soporte continuo a nuestros usuarios.
              </Card.Text>

              <Card.Title style={{ color: '#2A3A67' }}>¿Cómo usar la aplicación?</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Utiliza la barra de navegación en la parte superior para acceder a las diferentes secciones de la aplicación:
                <ul>
                  <li>🌆 <strong>Análisis de Restaurantes:</strong> Explora la distribución de restaurantes en Barcelona y filtra por categorías de cocina, calificación y precio.</li>
                  <li>🏢 <strong>Análisis de Espacios Comerciales:</strong> Visualiza locales vacíos y su competencia cercana, con información clave para evaluar la viabilidad de un nuevo negocio.</li>
                  <li>👥 <strong>Perfil del Consumidor:</strong> Analiza la demografía de los barrios para entender el perfil de tus potenciales clientes y cómo se alinean con tu oferta.</li>
                </ul>
              </Card.Text>
              
              <Card.Title style={{ color: '#2A3A67' }}>Navegación</Card.Title>
              <Card.Text style={{ color: '#4B4B4B' }}>
                Usa la barra de navegación en la parte superior para acceder a las diferentes secciones de la aplicación. Simplemente selecciona la pestaña que deseas explorar.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AppInfo;
