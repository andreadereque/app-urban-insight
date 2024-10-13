import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels);

const CuisineHeatmapChart = ({ filteredRestaurants, selectedBarrio }) => {
    const [cuisineChartData, setCuisineChartData] = useState(null);
    const [maxCuisineCount, setMaxCuisineCount] = useState(null);

    useEffect(() => {
        if (!filteredRestaurants || filteredRestaurants.length === 0 || !selectedBarrio) {
            setCuisineChartData(null);
            return;
        }

        // Filter restaurants based on the selected barrio
        const restaurantsInBarrio = filteredRestaurants.filter(restaurant => restaurant.Barrio === selectedBarrio);

        // Count the restaurants by cuisine type
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

        // Set the chart data for the cuisines
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

    // Function to get the color based on value and max value
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
        <div style={{ width: '100%', paddingTop: '20px' }}>
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
                            legend: { display: false },
                            title: {
                                display: true,
                                text: `Tipos de Cocina en ${selectedBarrio}`,
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
                                formatter: (value) => value,
                            },
                        },
                    }}
                />
            ) : (
                <p>No data available for selected barrio</p>
            )}
        </div>
    );
};

export default CuisineHeatmapChart;
