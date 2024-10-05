// Initialize Leaflet map
var map = L.map('map').setView([41.3851, 2.1734], 13); // Barcelona coordinates

// Add tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Fetch population and restaurant data from backend (Flask)
fetch('/api/get_data')
    .then(response => response.json())
    .then(data => {
        // Add population density layer
        var populationLayer = L.geoJson(data.population, {
            style: function (feature) {
                return {
                    fillColor: getDensityColor(feature.properties.density),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<b>" + feature.properties.name + "</b><br>Population Density: " + feature.properties.density);
            }
        }).addTo(map);

        // Add restaurant layer
        var restaurantLayer = L.geoJson(data.restaurants, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<b>" + feature.properties.name + "</b><br>Type: " + feature.properties.type);
            }
        }).addTo(map);

        // Filters for dynamic updates
        document.getElementById('age-range').addEventListener('change', function () {
            var ageRange = this.value;
            fetch(`/api/filter?age_range=${ageRange}`)
                .then(response => response.json())
                .then(filteredData => {
                    populationLayer.clearLayers();
                    restaurantLayer.clearLayers();
                    populationLayer.addData(filteredData.population);
                    restaurantLayer.addData(filteredData.restaurants);
                });
        });

        // More filters (income, household size, restaurant type) could be added similarly
    });

// Function to assign colors based on population density
function getDensityColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
                      '#FFEDA0';
}

// Initialize Chart.js for population and income data
var ctx = document.getElementById('populationChart').getContext('2d');
var populationChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['0-19', '20-34', '35-54', '55-74', '75+'],
        datasets: [{
            label: 'Population by Age',
            data: [1000, 2000, 3000, 4000, 5000],  // Replace this with actual data from backend
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    }
});

// Add more charts or visualizations for income distribution, rental prices, etc.
