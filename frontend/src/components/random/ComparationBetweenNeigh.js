import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import '../../styles/SelectedLocal.css';

// Register Chart.js elements
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ComparationBetweenNeigh = ({ renta }) => {
    const [similarNeighborhoods, setSimilarNeighborhoods] = useState([]);
    const [showNeighborhoods, setShowNeighborhoods] = useState(false);

    // Toggle for showing/hiding neighborhoods
    const handleToggle = () => {
        setShowNeighborhoods(!showNeighborhoods);
    };

    // Fetching similar neighborhoods based on renta
    const fetchSimilarNeighborhoods = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/similar_neighborhoods_by_renta/${renta}`);
            if (!response.ok) {
                throw new Error('Error fetching similar neighborhoods');
            }
            const data = await response.json();
            setSimilarNeighborhoods(data);
        } catch (error) {
            console.error('Error fetching similar neighborhoods:', error);
        }
    };

    // Fetch additional neighborhood data (restaurant counts, popular cuisines, price categories)
    const fetchAdditionalNeighborhoodData = async (neighborhoods) => {
        try {
            const enrichedNeighborhoods = await Promise.all(neighborhoods.map(async (barrio) => {
                const responseCount = await fetch(`http://127.0.0.1:5000/api/restaurant_count_by_neighborhood/${barrio.Nombre}`);
                const responseCuisines = await fetch(`http://127.0.0.1:5000/api/top_5_cuisine_types_by_neighborhood/${barrio.Nombre}`);
                const responsePriceCategories = await fetch(`http://127.0.0.1:5000/api/restaurant_price_categories_by_neighborhood/${barrio.Nombre}`);

                const countData = await responseCount.json();
                const cuisineData = await responseCuisines.json();
                const priceData = await responsePriceCategories.json();

                return {
                    ...barrio,
                    restaurantCount: countData.count,
                    popularCuisine: cuisineData.map(item => `${item.Tipo} (${item.count})`).join(", "),
                    priceCategories: priceData
                };
            }));
            setSimilarNeighborhoods(enrichedNeighborhoods);
        } catch (error) {
            console.error('Error fetching neighborhood data:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`http://127.0.0.1:5000/api/similar_neighborhoods_by_renta/${renta}`);
            const data = await response.json();
            if (data.length > 0) {
                await fetchAdditionalNeighborhoodData(data);
            }
        };

        fetchData();
    }, [renta]);

    // Helper function to render price categories
    const renderPriceCategories = (priceCategories) => {
        return Object.entries(priceCategories).map(([category, count], index) => (
            <div key={index}>{category}: {count} restaurantes</div>
        ));
    };

    // Create a pie chart for the price categories
    const generatePieChart = (priceCategories) => {
        const labels = Object.keys(priceCategories);
        const data = Object.values(priceCategories);

        return (
            <Pie
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: 'Distribución de Precios',
                            data: data,
                            backgroundColor: ['#F3B2C0', '#FFC914', '#FFB774', '#A4D4AE', '#B39CD0'], // Rosa Pálido, Mostaza Suave, Naranja Claro, Verde Pastel, Lavanda
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        datalabels: {
                            display: false,
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                }}
            />
        );
    };

    // Create a bar chart for the top 3 cuisines
    const generateBarChart = (neighborhood) => {
        if (!neighborhood.popularCuisine) {
            return <p style={{ color: '#4B4B4B' }}>No hay datos disponibles para los tipos de cocina.</p>;
        }

        const labels = neighborhood.popularCuisine.split(', ').map(cuisine => cuisine.split(' ')[0]);
        const data = neighborhood.popularCuisine.split(', ').map(cuisine => Number(cuisine.match(/\d+/)));

        return (
            <Bar
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: `Tipos de Cocina en ${neighborhood.Nombre}`,
                            data: data,
                            backgroundColor: ['#FF6F61', '#FFC914', '#ADD8E6'], // Coral Suave, Mostaza Suave, Azul Claro
                            borderColor: '#2A3A67', // Azul Marino Oscuro
                            borderWidth: 1,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        datalabels: {
                            display: false,
                        },
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#4B4B4B' },
                        },
                        x: {
                            ticks: { color: '#4B4B4B' },
                        },
                    },
                }}
            />
        );
    };

    const openMapInNewTab = (neighborhoodName) => {
        const mapUrl = `http://localhost:3000/map/${neighborhoodName}`;
        window.open(mapUrl, '_blank');
    };

    return (
        <div className="container">
            <button 
                onClick={handleToggle} 
                style={{ 
                    backgroundColor: '#FF6F61', // Coral Suave para botón principal
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                }}
            >
                {showNeighborhoods ? 'Ocultar Barrios Similares' : 'Mostrar Barrios Similares'}
            </button>
            <br /><br />
            {showNeighborhoods && (
                <div>
                    <h3 style={{ color: '#2A3A67' }}>Barrios Similares por Renta</h3>
                    <div className="comparison-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {similarNeighborhoods.map((barrio, index) => (
                            <div key={index} className="comparison-column" style={{ backgroundColor: '#F5F7FA', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                                <div className="comparison-item">
                                    <span className="comparison-label">Barrio:</span>
                                    <span className="comparison-content" style={{ color: '#2A3A67' }}>{barrio.Nombre}</span>
                                    <button
                                        onClick={() => openMapInNewTab(barrio.Nombre)}
                                        style={{ 
                                            marginLeft: '10px', 
                                            padding: '5px 10px', 
                                            borderRadius: '5px', 
                                            backgroundColor: '#ADD8E6', // Azul Claro para un botón de acción secundaria
                                            color: '#2A3A67', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold' 
                                        }}
                                    >
                                        Ver Mapa
                                    </button>
                                </div>
                                <div className="comparison-item">
                                    <span className="comparison-label">Renta:</span>
                                    <span className="comparison-content" style={{ color: '#4B4B4B' }}>{barrio.Renta}€</span>
                                </div>
                                <div className="comparison-item">
                                    <span className="comparison-label">Nº Restaurantes:</span>
                                    <span className="comparison-content" style={{ color: '#4B4B4B' }}>{barrio.restaurantCount}</span>
                                </div>
                                <div className="comparison-item chart">
                                    <span className="comparison-label">Top 5 Tipos de Cocina:</span>
                                    <div className="comparison-content">
                                        {generateBarChart(barrio)}
                                    </div>
                                </div>
                                <div className="comparison-item chart">
                                    <span className="comparison-label">Distribución de Precios:</span>
                                    <div className="comparison-content">
                                        {generatePieChart(barrio.priceCategories)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparationBetweenNeigh;
