import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import TreeMapComponent from './TreeMapComponent';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels);

const Dashboard = ({ filteredRestaurants }) => {
    const [topChartData, setTopChartData] = useState(null);
    const [maxTopCount, setMaxTopCount] = useState(null);
    const [treeMapData, setTreeMapData] = useState(null);
    const [selectedBarrio, setSelectedBarrio] = useState(''); // Definir selectedBarrio aquí

    useEffect(() => {
        if (!filteredRestaurants || filteredRestaurants.length === 0) {
            setTopChartData(null);
            setTreeMapData(null);
            return;
        }

        const restaurantCountsByBarrio = filteredRestaurants.reduce((acc, restaurant) => {
            const barrio = restaurant.Barrio;
            if (!acc[barrio]) acc[barrio] = 0;
            acc[barrio] += 1;
            return acc;
        }, {});

        const sortedBarrios = Object.entries(restaurantCountsByBarrio).sort((a, b) => b[1] - a[1]);

        const top10Barrios = sortedBarrios.slice(0, 10);
        const topBarrios = top10Barrios.map((item) => item[0]);
        const topCountsArray = top10Barrios.map((item) => item[1]);

        const maxCount = Math.max(...topCountsArray);
        setMaxTopCount(maxCount);

        // Asignar los datos al gráfico de barras
        setTopChartData({
            labels: topBarrios,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: topCountsArray,
                    backgroundColor: topCountsArray.map(value => getHeatmapColor(value, maxCount)),
                    borderWidth: 0,
                },
            ],
        });

        // Preparar los datos para TreeMap
        const treeMapChildren = sortedBarrios.map(([barrio, value]) => ({
            name: barrio,
            value,
            color: getHeatmapColor(value, maxCount)
        })).slice(0, 10);

        setTreeMapData({
            name: 'Barrios',
            children: treeMapChildren
        });

    }, [filteredRestaurants]);

    // Función para obtener color basado en el valor máximo
    const getHeatmapColor = (value, maxValue) => {
        const ratio = value / maxValue;
        if (ratio > 0.9) return 'rgba(255, 69, 0, 0.8)';
        if (ratio > 0.7) return 'rgba(255, 140, 0, 0.8)';
        if (ratio > 0.5) return 'rgba(255, 195, 0, 0.8)';
        if (ratio > 0.3) return 'rgba(240, 240, 0, 0.8)';
        if (ratio > 0.1) return 'rgba(173, 255, 47, 0.8)';
        return 'rgba(0, 255, 127, 0.8)';
    };

    // Manejar el cambio de barrio para el heatmap de cocina
    const handleBarrioChange = (event) => {
        setSelectedBarrio(event.target.value);
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* Gráfico de barras (Top 10 Barrios) */}
            <div style={styles.chartContainer}>
                {topChartData && topChartData.labels ? (
                    <>
                        <Bar
                            data={topChartData}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'x',
                                barThickness: 25,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Distrito (Top 10)',
                                            font: {
                                                size: 14,
                                                weight: 'bold',
                                            },
                                        },
                                        ticks: {
                                            maxRotation: 90,
                                            minRotation: 90,
                                            font: {
                                                size: 12,
                                            },
                                        },
                                    },
                                    y: {
                                        display: false,
                                    },
                                },
                                plugins: {
                                    datalabels: {
                                        display: false,  // Esto asegura que los números NO se muestren
                                      },
                                    legend: { display: false },
                                    title: {
                                        display: true,
                                        text: 'Top 10 Barrios por Densidad de Restaurantes',
                                        font: {
                                            size: 16,
                                            weight: 'bold',
                                        },
                                    },
                                    datalabels: {
                                        display: false,
                                        color: '#fff',
                                        font: {
                                            weight: 'bold',
                                            size: 14,
                                        },
                                        anchor: 'center',
                                        align: 'center',
                                        formatter: (value) => value,
                                    },
                                },
                            }}
                        />
                        {maxTopCount && <HeatmapLegend maxCount={maxTopCount} />}
                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>



            {/* Dropdown estilizado para seleccionar el Barrio */}
            <div className="select-container" style={{ margin: '20px 0', textAlign: 'center' }}>
                <label
                    htmlFor="barrio-select"
                    className="select-label"
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#555',
                        marginRight: '10px'
                    }}
                >
                    Seleccionar Barrio:
                </label>
                <select
                    id="barrio-select"
                    className="select-dropdown"
                    onChange={handleBarrioChange}
                    value={selectedBarrio}
                    style={{
                        padding: '10px 15px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        backgroundColor: '#fff',
                        color: '#333',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = '#FF6F91'}
                    onMouseOut={(e) => e.target.style.borderColor = '#ccc'}
                >
                    <option value="" disabled>Seleccione un barrio</option>
                    {[...new Set(filteredRestaurants.map(restaurant => restaurant.Barrio))].map(barrio => (
                        <option key={barrio} value={barrio}>
                            {barrio}
                        </option>
                    ))}
                </select>
            </div>


            {/* Heatmap de Tipos de Cocina */}
            {selectedBarrio && <CuisineHeatmapChart filteredRestaurants={filteredRestaurants} selectedBarrio={selectedBarrio} />}
        </div>
    );
};

// Leyenda para el Heatmap
const HeatmapLegend = ({ maxCount }) => {
    const legendData = [
        { color: 'rgba(255, 69, 0, 0.8)', label: `> ${Math.round(maxCount * 0.9)} - ${maxCount}` },
        { color: 'rgba(255, 140, 0, 0.8)', label: `${Math.round(maxCount * 0.7)} - ${Math.round(maxCount * 0.9)}` },
        { color: 'rgba(255, 195, 0, 0.8)', label: `${Math.round(maxCount * 0.5)} - ${Math.round(maxCount * 0.7)}` },
        { color: 'rgba(240, 240, 0, 0.8)', label: `${Math.round(maxCount * 0.3)} - ${Math.round(maxCount * 0.5)}` },
        { color: 'rgba(173, 255, 47, 0.8)', label: `${Math.round(maxCount * 0.1)} - ${Math.round(maxCount * 0.3)}` },
        { color: 'rgba(0, 255, 127, 0.8)', label: `0 - ${Math.round(maxCount * 0.1)}` },
    ];

    return (
        <div style={styles.legendContainer}>
            {legendData.map((item, index) => (
                <div key={index} style={styles.legendItem}>
                    <span style={{ ...styles.legendColor, backgroundColor: item.color }}></span>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

// Heatmap de Cocina
const CuisineHeatmapChart = ({ filteredRestaurants, selectedBarrio }) => {
    const [cuisineChartData, setCuisineChartData] = useState(null);
    const [maxCuisineCount, setMaxCuisineCount] = useState(null);

    useEffect(() => {
        if (!filteredRestaurants || filteredRestaurants.length === 0 || !selectedBarrio) {
            setCuisineChartData(null);
            return;
        }

        const restaurantsInBarrio = filteredRestaurants.filter(restaurant => restaurant.Barrio === selectedBarrio);

        const cuisineCounts = restaurantsInBarrio.reduce((acc, restaurant) => {
            const cuisine = restaurant["Categoría Cocina"];
            if (!acc[cuisine]) acc[cuisine] = 0;
            acc[cuisine] += 1;
            return acc;
        }, {});

        const sortedCuisines = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]);
        const cuisineLabels = sortedCuisines.map(item => item[0]);
        const cuisineCountsArray = sortedCuisines.map(item => item[1]);

        const maxCount = Math.max(...cuisineCountsArray);
        setMaxCuisineCount(maxCount);

        setCuisineChartData({
            labels: cuisineLabels,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: cuisineCountsArray,
                    backgroundColor: cuisineCountsArray.map(value => getHeatmapColor(value, maxCount)),
                    borderWidth: 0,
                },
            ],
        });
    }, [filteredRestaurants, selectedBarrio]);

    const getHeatmapColor = (value, maxValue) => {
        const ratio = value / maxValue;
        if (ratio > 0.9) return 'rgba(255, 69, 0, 0.8)';
        if (ratio > 0.7) return 'rgba(255, 140, 0, 0.8)';
        if (ratio > 0.5) return 'rgba(255, 195, 0, 0.8)';
        if (ratio > 0.3) return 'rgba(240, 240, 0, 0.8)';
        if (ratio > 0.1) return 'rgba(173, 255, 47, 0.8)';
        return 'rgba(0, 255, 127, 0.8)';
    };

    return (
        <div style={styles.cuisineChartContainer}>
            {cuisineChartData && cuisineChartData.labels ? (
                <Bar
                    data={cuisineChartData}
                    options={{
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        barThickness: 25,
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Tipos de Cocina',
                                    font: {
                                        size: 14,
                                        weight: 'bold',
                                    },
                                },
                                ticks: {
                                    font: {
                                        size: 12,
                                    },
                                },
                            },
                            x: {
                                display: false,
                            },
                        },
                        plugins: {
                            datalabels: {
                                display: false,  // Esto asegura que los números NO se muestren
                              },
                            legend: { display: false },
                            title: {
                                display: true,
                                text: `Tipos de Cocina en ${selectedBarrio}`,
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                },
                            },
                            
                        },
                    }}
                />
            ) : (
                <p>No hay datos disponibles para el barrio seleccionado</p>
            )}
        </div>
    );
};

// Estilos
const styles = {
    dashboardContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '30px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginTop: '30px',
        gap: '40px',
    },
    chartContainer: {
        width: '90%',
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '450px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    treeMapContainer: {
        width: '90%',
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '450px',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cuisineChartContainer: {
        width: '90%',
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '450px',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15px',
        backgroundColor: '#ffffff',
        padding: '15px 25px',
        borderRadius: '12px',
        width: '100%',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '15px',
    },
    legendColor: {
        width: '25px',
        height: '25px',
        borderRadius: '4px',
        marginRight: '10px',
    },
};

export default Dashboard;
