import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import RestaurantList from './components/restaurants/RestaurantList';  // Restaurant map component
import NavigationBar from './components/Navbar';  // Navbar
import InteractiveMaps from './components/demographic_map/InteractiveMaps';
import EmptyLocalsMap from './components/random/EmptyLocalMap';
import NeighborhoodMap from './components/random/NeighborhoodMap';


function App() {
  return (
    <Router>
      <div>
        <NavigationBar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<RestaurantList />} />  {/* Default route */}
            <Route path="/idealista" element={<EmptyLocalsMap />} />  {/* Dashboard route */}
            <Route path="/interactive-maps" element={<InteractiveMaps />} />  {/* Dashboard route */}
            <Route path="/map/:neighborhood" element={<NeighborhoodMap />} />


          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
