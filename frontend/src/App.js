import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import RestaurantList from './components/restaurants/RestaurantList';  // Restaurant map component
import NationalityAnalysisDashboard from './components/random/NationalityAnalysisDashboard';  // New dashboard component
import NavigationBar from './components/general/Navbar';  // Navbar
import InteractiveMaps from './components/demographic_map/InteractiveMaps';

function App() {
  return (
    <Router>
      <div>
        <NavigationBar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<RestaurantList />} />  {/* Default route */}
            <Route path="/nationality-analysis" element={<NationalityAnalysisDashboard />} />  {/* Dashboard route */}
            <Route path="/interactive-maps" element={<InteractiveMaps />} />  {/* Dashboard route */}

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
