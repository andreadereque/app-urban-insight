import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import TreeMapComponent from './TreeMapComponent';  // Importamos el nuevo componente TreeMap

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels);

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

        const top10Barrios = sortedBarrios.slice(0, 15);
        const topBarrios = top10Barrios.map((item) => item[0]);
        const topCountsArray = top10Barrios.map((item) => item[1]);

        const maxTopCount = Math.max(...topCountsArray);

        const bottom10Barrios = sortedBarrios.slice(-10);
        const bottomBarrios = bottom10Barrios.map((item) => item[0]);
        const bottomCountsArray = bottom10Barrios.map((item) => item[1]);

        const maxBottomCount = Math.max(...bottomCountsArray);

        setTopChartData({
            labels: topBarrios,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: topCountsArray,
                    backgroundColor: topCountsArray.map(value => `rgba(255, ${Math.round(200 * (value / maxTopCount))}, 150, 0.8)`),
                    borderWidth: 0,
                },
            ],
        });

        setBottomChartData({
            labels: bottomBarrios,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes',
                    data: bottomCountsArray,
                    backgroundColor: bottomCountsArray.map(value => `rgba(255, ${Math.round(200 * (value / maxBottomCount))}, 150, 0.8)`),
                    borderWidth: 0,
                },
            ],
        });
    }, [filteredRestaurants]);

    // Preparar los datos para el Tree Map
    // Preparar los datos para el Tree Map
const treeMapData = {
    name: 'Barrios',
    children: Object.values(
        filteredRestaurants.reduce((acc, restaurant) => {
            const barrio = restaurant.Barrio;
            if (!acc[barrio]) {
                acc[barrio] = { name: barrio, value: 0 };
            }
            acc[barrio].value += 1;
            return acc;
        }, {})
    )
    // Ordenar por valor (cantidad de restaurantes) y tomar los 50 mayores
    .sort((a, b) => b.value - a.value)  // Orden descendente
    .slice(0, 15)  // Tomar solo los 50 primeros
};


    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', paddingTop: '30px' }}>
            {/* Top 10 Barrios Chart */}
            <div style={{ width: '40%', position: 'relative', height: '400px', marginRight: '50px' }}>
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
                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>

            {/* Tree Map usando el nuevo componente */}
            <div style={{ width: '40%', position: 'relative', height: '400px', marginLeft: '50px' }}>
                <TreeMapComponent data={treeMapData} /> {/* Pasamos los datos al Tree Map */}
            </div>
        </div>
    );
};

export default HeatmapCharts;
