import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import RestaurantTable from './clickLocal/RestaurantTable';
import '../../styles/ClickedLocalDetails.css';
import ComparationBetweenNeigh from './ComparationBetweenNeigh';

const ClickedLocalDetails = ({ title, infoNearRestaurants, local, neighborhood }) => {
    const [priceOptions, setPriceOptions] = useState([]); 
    const [typeOptions, setTypeOptions] = useState([]);   
    const [selectedPrices, setSelectedPrices] = useState([]); 
    const [selectedTypes, setSelectedTypes] = useState([]);   

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const priceResponse = await fetch('http://127.0.0.1:5000/api/restaurant_price_categories');
                const priceData = await priceResponse.json();
                setPriceOptions(priceData);

                const typeResponse = await fetch('http://127.0.0.1:5000/api/restaurant_cuisine_categories');
                const typeData = await typeResponse.json();
                setTypeOptions(typeData);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

    if (!title) return null; 

    const handlePriceChange = (event, value) => {
        setSelectedPrices(value);
    };

    const handleTypeChange = (event, value) => {
        setSelectedTypes(value);
    };

    return (
        <div className="clicked-local-details">
            <div className="local-info" style={{ backgroundColor: '#F5F7FA', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
                <h2 className="local-info__title" style={{ color: '#2A3A67' }}>Local seleccionado</h2>
                <div className="local-info__details" style={{ color: '#4B4B4B' }}>
                    <p className="local-info__neighborhood">
                        <span className="local-info__label">Barrio:</span>
                        <b className="local-info__name" style={{ color: '#FF6F61' }}>{neighborhood['Nombre']}</b>
                    </p>
                    <p className="local-info__renta">
                        <span className="local-info__label">Renta anual:</span>
                        <b style={{ color: '#FFC914' }}>{neighborhood['Renta']}€</b>
                    </p>
                </div>
                <ComparationBetweenNeigh renta={neighborhood['Renta']} />
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#F5F7FA',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                width: '100%',
                gap: '20px',
                marginTop: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    width: '100%'
                }}>
                    <Autocomplete
                        multiple
                        options={priceOptions} 
                        value={selectedPrices}
                        onChange={handlePriceChange}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip 
                                    variant="outlined" 
                                    label={option} 
                                    {...getTagProps({ index })} 
                                    style={{
                                        backgroundColor: '#FFC914', 
                                        color: '#2A3A67', 
                                        fontWeight: 'bold'
                                    }} 
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} variant="outlined" label="Filtrar por precio" placeholder="Selecciona precios" 
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '8px'
                                }} 
                            />
                        )}
                        style={{ width: 300 }}
                    />

                    <Autocomplete
                        multiple
                        options={typeOptions} 
                        value={selectedTypes}
                        onChange={handleTypeChange}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip 
                                    variant="outlined" 
                                    label={option} 
                                    {...getTagProps({ index })} 
                                    style={{
                                        backgroundColor: '#ADD8E6', 
                                        color: '#2A3A67', 
                                        fontWeight: 'bold'
                                    }} 
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} variant="outlined" label="Filtrar por tipo" placeholder="Selecciona tipos"
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '8px'
                                }} 
                            />
                        )}
                        style={{ width: 300 }}
                    />
                </div>

                <RestaurantTable
                    infoNearRestaurants={infoNearRestaurants}
                    selectedPrices={selectedPrices}
                    selectedTypes={selectedTypes}
                    className="restaurant-table"
                    style={{
                        width: '100%',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                />
            </div>
        </div>
    );
};

export default ClickedLocalDetails;
