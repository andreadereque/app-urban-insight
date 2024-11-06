import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Modal from 'react-modal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels);

const Dashboard = ({ filteredRestaurants }) => {
    const [topChartData, setTopChartData] = useState(null);
    const [cuisineChartData, setCuisineChartData] = useState(null);
    const [maxTopCount, setMaxTopCount] = useState(null);
    const [maxCuisineCount, setMaxCuisineCount] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        if (!filteredRestaurants || filteredRestaurants.length === 0) {
            setTopChartData(null);
            setCuisineChartData(null);
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

        const cuisineCounts = filteredRestaurants.reduce((acc, restaurant) => {
            const cuisine = restaurant["Categoría Cocina"];
            if (!acc[cuisine]) acc[cuisine] = 0;
            acc[cuisine] += 1;
            return acc;
        }, {});

        const sortedCuisines = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]);
        const top10Cuisines = sortedCuisines.slice(0, 10);
        const cuisineLabels = top10Cuisines.map(item => item[0]);
        const cuisineCountsArray = top10Cuisines.map(item => item[1]);

        const maxCuisine = Math.max(...cuisineCountsArray);
        setMaxCuisineCount(maxCuisine);

        setCuisineChartData({
            labels: cuisineLabels,
            datasets: [
                {
                    label: 'Cantidad de Restaurantes por Tipo de Cocina',
                    data: cuisineCountsArray,
                    backgroundColor: cuisineCountsArray.map(value => getHeatmapColor(value, maxCuisine)),
                    borderWidth: 0,
                },
            ],
        });
    }, [filteredRestaurants]);

    const getHeatmapColor = (value, maxValue) => {
        const ratio = value / maxValue;
        if (ratio > 0.9) return '#FF6F61';
        if (ratio > 0.7) return '#FFC914';
        if (ratio > 0.5) return '#FFB774';
        if (ratio > 0.3) return '#A4D4AE';
        if (ratio > 0.1) return '#ADD8E6';
        return '#2A3A67';
    };

    const openModal = (content) => {
        setModalContent(content);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.chartContainer}>
                <button onClick={() => openModal("Este gráfico muestra los barrios con la mayor cantidad de restaurantes en Barcelona. Útil para evaluar áreas de alta concentración de competencia, permitiendo identificar zonas saturadas y explorar alternativas con menos competencia.")} style={styles.infoButton}>
                    Más Info
                </button>
                {topChartData ? (
                    <>
                        <Bar
                            data={topChartData}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'x',
                                barThickness: 20,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Barrio',
                                            font: { size: 12, weight: 'bold' },
                                        },
                                        ticks: { 
                                            maxRotation: 45,
                                            minRotation: 45,
                                            font: { size: 10 }
                                        },
                                    },
                                    y: { title: {
                                        display: true,
                                        text: 'Número de restaurantes',
                                        font: { size: 12, weight: 'bold' },
                                    },},
                                },
                                plugins: {
                                    datalabels: { display: false },
                                    legend: { display: false },
                                    title: {
                                        display: true,
                                        text: ['Top 10', 'Densidad de restaurantes por barrios'],
                                        font: { size: 14, weight: 'bold' },
                                    },
                                },
                            }}
                        />
                        <div style={styles.legendOverlay}>
                            {maxTopCount && <HeatmapLegend maxCount={maxTopCount} />}
                        </div>
                    </>
                ) : (
                    <p>No hay datos disponibles</p>
                )}
            </div>

            <div style={styles.chartContainer}>
                <button onClick={() => openModal("Aquí puedes ver los tipos de cocina más comunes entre los restaurantes de la zona. Esta información es valiosa para adaptar tu oferta y diferenciarte en el mercado según las preferencias de los clientes.")} style={styles.infoButton}>
                    Más Info
                </button>
                {cuisineChartData ? (
                    <>
                        <Bar
                            data={cuisineChartData}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'x',
                                barThickness: 20,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Tipo de Cocina',
                                            font: { size: 12, weight: 'bold' },
                                        },
                                        ticks: { 
                                            maxRotation: 45,
                                            minRotation: 45,
                                            font: { size: 10 }
                                        },
                                    },
                                    y: { title: {
                                        display: true,
                                        text: 'Número de restaurantes',
                                        font: { size: 12, weight: 'bold' },
                                    }, },
                                },
                                plugins: {
                                    datalabels: { display: false },
                                    legend: { display: false },
                                    title: {
                                        display: true,
                                        text: ['Top 10', 'Cantidad de restaurantes por tipo'],
                                        font: { size: 14, weight: 'bold' },
                                    },
                                },
                            }}
                        />
                        <div style={styles.legendOverlay}>
                            {maxCuisineCount && <HeatmapLegend maxCount={maxCuisineCount} />}
                        </div>
                    </>
                ) : (
                    <p>No hay datos disponibles</p>
                )}
            </div>

            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={modalStyles}>
                <h2 style={{ color: '#2A3A67' }}>Información Adicional</h2>
                <p style={{ color: '#4B4B4B' }}>{modalContent}</p>
                <button onClick={closeModal} style={styles.closeButton}>Entendido</button>
            </Modal>
        </div>
    );
};

const HeatmapLegend = ({ maxCount }) => {
    const legendData = [
        { color: '#FF6F61', label: `> ${Math.round(maxCount * 0.9)} - ${maxCount}` },
        { color: '#FFC914', label: `${Math.round(maxCount * 0.7)} - ${Math.round(maxCount * 0.9)}` },
        { color: '#FFB774', label: `${Math.round(maxCount * 0.5)} - ${Math.round(maxCount * 0.7)}` },
        { color: '#A4D4AE', label: `${Math.round(maxCount * 0.3)} - ${Math.round(maxCount * 0.5)}` },
        { color: '#ADD8E6', label: `${Math.round(maxCount * 0.1)} - ${Math.round(maxCount * 0.3)}` },
        { color: '#2A3A67', label: `0 - ${Math.round(maxCount * 0.1)}` }
    ];

    return (
        <div style={styles.legendContainer}>
            {legendData.map((item, index) => (
                <div key={index} style={styles.legendItem}>
                    <span style={{ ...styles.legendColor, backgroundColor: item.color }}></span>
                    <span style={{ fontSize: '10px' }}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const styles = {
    dashboardContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 15px',
        backgroundColor: '#E8E8E8',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        gap: '30px',
        marginTop: '20px',
    },
    chartContainer: {
        position: 'relative',
        width: '40%',
        backgroundColor: '#FFFFFF',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    infoButton: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        padding: '5px 10px',
        backgroundColor: '#FF6F61',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    legendOverlay: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#FFFFFF',
        padding: '5px 10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    legendContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3px',
        color: '#2A3A67',
        fontWeight: 'bold',
    },
    legendColor: {
        width: '10px',
        height: '10px',
        borderRadius: '4px',
        marginRight: '5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    },
    closeButton: {
        marginTop: '20px',
        padding: '8px 12px',
        backgroundColor: '#2A3A67',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

const modalStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
        position: 'fixed',                   // Asegura que cubre toda la ventana
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,                        // Z-index alto para asegurarse de que esté en la parte superior
    },
    content: {
        position: 'fixed',              // Mantener el modal fijo en la pantalla
        bottom: '0',                    // Colocarlo en la parte inferior
        left: '50%',                    // Centrar horizontalmente
        transform: 'translateX(-50%)',  // Alinear en el centro
        borderRadius: '8px',
        padding: '10px 20px',          // Ajustar el padding para un poco de espacio interno
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        maxWidth: '400px',  
        height:'350px',            // Ancho máximo para mantener el tamaño pequeño
        zIndex: 1000,                   // Asegúrate de que esté en la parte superior
    },
};



export default Dashboard;
