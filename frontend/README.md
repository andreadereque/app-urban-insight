### **README del Proyecto**

#### **Descripción General**
Este proyecto es una aplicación web basada en React que integra diversas visualizaciones de datos relacionadas con demografía, restaurantes y datos sociográficos de Barcelona. Los datos se obtienen dinámicamente desde un backend construido en Flask y MongoDB.

#### **Estructura del Proyecto**

- **package.json**: Define las dependencias del frontend, incluyendo React, Leaflet.js (para mapas), y otras librerías. También contiene los scripts para iniciar y construir el proyecto.

- **public/index.html**: La plantilla HTML principal para la aplicación React. React inyecta aquí los componentes de la aplicación.

- **src/index.js**: El punto de entrada de la aplicación React. Renderiza el componente `App.js` en el DOM.

- **src/App.js**: El componente principal de la aplicación que gestiona el diseño e integra varios otros componentes como la barra de navegación, las visualizaciones y los mapas.

- **Componentes**:
  - **DataVisualization.js**: Gestiona el renderizado de gráficos de datos para el análisis demográfico.
  - **RestaurantMap.js**: Muestra un mapa con las ubicaciones de los restaurantes en Barcelona.
  - **FiltersInteractiveMaps.js**: Permite a los usuarios filtrar los datos visualizados en el mapa interactivo, como por ejemplo, por demografía o tipo de restaurante.
  - **InformationPanel.js**: Muestra detalles adicionales cuando los usuarios hacen clic en un barrio o punto de datos en el mapa.
  - **NationalityAnalysis.js**: Proporciona visualizaciones que comparan diferentes nacionalidades dentro de barrios específicos.

- **Integración con Leaflet**:
  - `src/components/demographic_map/libs/leaflet.js` maneja el renderizado de mapas utilizando Leaflet.js para las visualizaciones geográficas interactivas.

#### **Cómo Ejecutar el Proyecto**

1. **Instalar Dependencias**:  
   En el directorio raíz del frontend, ejecuta:
   ```bash
   npm install
   ```

2. **Iniciar la Aplicación**:  
   Inicia el servidor de desarrollo con:
   ```bash
   npm start
   ```

3. **Backend**:  
   El backend está gestionado por un servidor Flask, que interactúa con MongoDB. Asegúrate de que el backend de Flask esté en funcionamiento para obtener los datos necesarios para las visualizaciones.

---

### **Cheatsheet Básica de React y JavaScript**

#### **Conceptos Básicos de React**

1. **Componentes**:  
   Los componentes son los bloques principales de una aplicación React. Hay dos tipos:
   - **Componentes Funcionales**:  
     Ejemplo:
     ```javascript
     function MiComponente() {
       return <div>¡Hola Mundo!</div>;
     }
     ```
   - **Componentes de Clase** (menos comunes en React moderno):
     ```javascript
     class MiComponente extends React.Component {
       render() {
         return <div>¡Hola Mundo!</div>;
       }
     }
     ```

2. **JSX**:  
   JSX es una extensión de sintaxis para JavaScript que permite escribir HTML directamente dentro de los componentes de React.
   Ejemplo:
   ```javascript
   return <h1>Hola, {props.nombre}!</h1>;
   ```

3. **Props**:  
   Las props se utilizan para pasar datos entre componentes.
   ```javascript
   function Saludo(props) {
     return <h1>Hola, {props.nombre}</h1>;
   }
   ```

4. **State**:  
   El estado permite gestionar datos dentro de un componente. Se puede actualizar el estado usando `useState`.
   ```javascript
   const [contador, setContador] = useState(0);
   ```

5. **Manejo de Eventos**:  
   Ejemplo de cómo manejar un evento de clic:
   ```javascript
   function manejarClick() {
     alert('¡Botón clicado!');
   }

   return <button onClick={manejarClick}>Haz clic</button>;
   ```

#### **Conceptos Básicos de JavaScript**

1. **Funciones Flecha**:
   ```javascript
   const sumar = (a, b) => a + b;
   ```

2. **Async/Await**:
   Usa `async/await` para manejar tareas asíncronas como llamadas a API:
   ```javascript
   async function obtenerDatos() {
     const respuesta = await fetch('api/datos');
     const datos = await respuesta.json();
     console.log(datos);
   }
   ```

3. **Métodos de Arrays**:
   Métodos comunes como `map`, `filter` y `reduce` son muy utilizados en React:
   ```javascript
   const numeros = [1, 2, 3];
   const duplicados = numeros.map((numero) => numero * 2);
   ```

---

Estos documentos deberían ayudar a tus compañeros a comprender la estructura básica del proyecto y proporcionar una referencia útil para los conceptos esenciales de React y JavaScript. ¡Dime si necesitas algo más!


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
