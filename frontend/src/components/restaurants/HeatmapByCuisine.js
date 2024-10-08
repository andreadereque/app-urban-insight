import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels); // Register the plugin

const HeatmapCharts = ({ filteredRestaurants }) => {
    const [topChartData, setTopChartData] = useState(null);
    const [bottomChartData, setBottomChartData] = useState(null);

    useEffect(() => {
        if (!filteredRestaurants || filteredRestaurants.length === 0) {
            setTopChartData(null);
            setBottomChartData(null);
            return;
        }

        const restaurantCountsByBarrio = filteredRestaurants.reduce((acc, restaurant) => {
            const barrio = restaurant.Barrio;
            if (!acc[barrio]) acc[barrio] = 0;
            acc[barrio] += 1;
            return acc;
        }, {});

        const sortedBarrios = Object.entries(restaurantCountsByBarrio).sort((a, b) => b[1] - a[1]);

        // Top 10 barrios
        const top10Barrios = sortedBarrios.slice(0, 10);
        const topBarrios = top10Barrios.map((item) => item[0]);
        const topCountsArray = top10Barrios.map((item) => item[1]);

        const maxTopCount = Math.max(...topCountsArray);

        // Bottom 10 barrios
        const bottom10Barrios = sortedBarrios.slice(-10);
        const bottomBarrios = bottom10Barrios.map((item) => item[0]);
        const bottomCountsArray = bottom10Barrios.map((item) => item[1]);

        const maxBottomCount = Math.max(...bottomCountsArray);

        // Define a fancy coquette color palette for the bars and legend
        const coquetteColors = (value, maxCount) => {
            const intensity = value / maxCount;
            // Gradient from light pink to dark pink/purple
            return `rgba(${255 - (150 * intensity)}, ${182 + (50 * intensity)}, ${255 - (193 * intensity)}, 0.8)`;
        };

        const getBarColor = (value, maxValue) => {
            const intensity = value / maxValue;
            // Define a color scale, de más suave a más intenso (colores coquette y fancy)
            const red = 255 * intensity;
            const green = 200 + (55 * (1 - intensity)); // Variación suave en verde
            const blue = 255 * (1 - intensity);

            return `rgba(${red}, ${green}, ${blue}, 0.8)`; // Ajuste coquette con más contraste
        };

        // Modificación en el uso del color en el dataset:
        setTopChartData({
            labels: topBarrios,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: topCountsArray,
                    backgroundColor: topCountsArray.map(value => getBarColor(value, maxTopCount)),
                    borderWidth: 0,
                },
            ],
        });

        // Para el gráfico inferior:
        setBottomChartData({
            labels: bottomBarrios,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: bottomCountsArray,
                    backgroundColor: bottomCountsArray.map(value => getBarColor(value, maxBottomCount)),
                    borderWidth: 0,
                },
            ],
        });

    }, [filteredRestaurants]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100vw', paddingTop: '30px' }}>
            {/* Top 10 Barrios Chart */}
            <div style={{ width: '40%', position: 'relative', height: '400px', marginRight: '50px' }}>
                {topChartData && topChartData.labels ? (
                    <>
                        <Bar
                            data={topChartData}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'x',
                                barThickness: 25, // Narrower bars
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
                                    legend: { display: false },
                                    title: {
                                        display: true,
                                        text: 'Top 10 Barrios por Densidad de Restaurantes Mexicanos',
                                        font: {
                                            size: 16,
                                            weight: 'bold',
                                        },
                                    },
                                    datalabels: {
                                        display: true,
                                        color: '#fff',
                                        font: {
                                            weight: 'bold',
                                            size: 14,
                                        },
                                        anchor: 'center',
                                        align: 'center',
                                        formatter: (value) => value,  // Show the number in the middle of the bar
                                    },
                                },
                            }}
                        />
                        {/* Heatmap Legend */}
                        <div style={{ position: 'absolute', right: '-40px', top: '50px', width: '20px', height: '300px' }}>
                            <div
                                style={{
                                    background: `linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 120, 120, 1))`, // De blanco a un rojo coquette
                                    width: '20px',
                                    height: '100%',
                                }}
                            />
                            <div style={{ position: 'absolute', top: '0', right: '40px', fontSize: '12px', color: '#333' }}>Alto</div>
                            <div style={{ position: 'absolute', bottom: '0', right: '40px', fontSize: '12px', color: '#333' }}>Bajo</div>
                        </div>

                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>

            {/* Bottom 10 Barrios Chart */}
            <div style={{ width: '40%', position: 'relative', height: '400px', marginLeft: '50px' }}>
                {bottomChartData && bottomChartData.labels ? (
                    <>
                        <Bar
                            data={bottomChartData}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'x',
                                barThickness: 25, // Narrower bars
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Distrito (Bottom 10)',
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
                                    legend: { display: false },
                                    title: {
                                        display: true,
                                        text: 'Bottom 10 Barrios por Densidad de Restaurantes Mexicanos',
                                        font: {
                                            size: 16,
                                            weight: 'bold',
                                        },
                                    },
                                    datalabels: {
                                        display: true,
                                        color: '#fff',
                                        font: {
                                            weight: 'bold',
                                            size: 14,
                                        },
                                        anchor: 'center',
                                        align: 'center',
                                        formatter: (value) => value,  // Show the number in the middle of the bar
                                    },
                                },
                            }}
                        />
                        {/* Heatmap Legend */}
                        <div style={{ position: 'absolute', right: '-40px', top: '50px', width: '20px', height: '300px' }}>
                            <div
                                style={{
                                    background: `linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 120, 120, 1))`, // De blanco a un rojo coquette
                                    width: '20px',
                                    height: '100%',
                                }}
                            />
                            <div style={{ position: 'absolute', top: '0', right: '40px', fontSize: '12px', color: '#333' }}>Alto</div>
                            <div style={{ position: 'absolute', bottom: '0', right: '40px', fontSize: '12px', color: '#333' }}>Bajo</div>
                        </div>

                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
};

export default HeatmapCharts;
