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
                await fetchAdditionalNeighborhoodData(data); // Add additional restaurant data
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
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        datalabels: {
                            display: false,  // Esto asegura que los números NO se muestren
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
        const labels = neighborhood.popularCuisine.split(', ').map(cuisine => cuisine.split(' ')[0]); // Extract cuisine names
        const data = neighborhood.popularCuisine.split(', ').map(cuisine => Number(cuisine.match(/\d+/))); // Extract counts

        return (
            <Bar
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: `Tipos de Cocina en ${neighborhood.Nombre}`,
                            data: data,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        datalabels: {
                            display: false,  // Esto asegura que los números NO se muestren
                          },
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        );
    };
    const openMapInNewTab = (neighborhoodName) => {
        const mapUrl = `http://localhost:3000/map/${neighborhoodName}`;
        window.open(mapUrl, '_blank'); // Open the map in a new tab
    };


    return (
        <div className="container">

            <button onClick={handleToggle}>
                {showNeighborhoods ? 'Ocultar Barrios Similares' : 'Mostrar Barrios Similares'}
            </button>
            <br /><br />
            {showNeighborhoods && (
                <div>
                    <h3>Barrios Similares por Renta</h3>
                    <div className="comparison-container">
                        {similarNeighborhoods.map((barrio, index) => (
                            <div key={index} className="comparison-column">
                                <div className="comparison-item">
                                    <span className="comparison-label">Barrio:</span>
                                    <span className="comparison-content">{barrio.Nombre}</span>
                                    <button
                                        onClick={() => {
                                            if (barrio.Nombre) {
                                                // Save the neighborhood in localStorage
                                                localStorage.setItem('lastNeighborhood', barrio.Nombre);
                                                window.open(`/map/${barrio.Nombre}`, '_blank');
                                            } else {
                                                console.error("Neighborhood name is undefined");
                                            }
                                        }}
                                        style={{ marginLeft: '10px', padding: '5px 10px', borderRadius: '5px', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>
                                        Ver Mapa
                                    </button>

                                </div>
                                <div className="comparison-item">
                                    <span className="comparison-label">Renta:</span>
                                    <span className="comparison-content">{barrio.Renta}€</span>
                                </div>
                                <div className="comparison-item">
                                    <span className="comparison-label">Nº Restaurantes:</span>
                                    <span className="comparison-content">{barrio.restaurantCount}</span>
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
