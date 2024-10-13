from collections import defaultdict
from difflib import SequenceMatcher
import re
from typing import Counter
from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Para habilitar CORS
from bson import ObjectId  # Para convertir ObjectId en str
import logging
from numpy import histogram

import math




from pymongo import GEOSPHERE

app = Flask(__name__)

# Habilitar CORS para permitir solicitudes desde el frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuración de MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/urban_insight_data"
mongo = PyMongo(app)
logging.basicConfig(level=logging.WARNING)

# Colecciones
transport_collection = mongo.db['transport']
demographics_collection = mongo.db['demographic_info']
restaurants_collection = mongo.db['restaurants']
empty_locals_collection = mongo.db['empty_locals']



restaurants_collection.create_index([("Geometry.coordinates", GEOSPHERE)], background=True)

@app.route('/nearby_restaurants', methods=['GET'])
def get_nearby_restaurants():
    try:
        # Get the coordinates of the empty local from request
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))

        # Query MongoDB for restaurants within 500 meters
        query = {
            "Geometry.coordinates": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]  # Note: MongoDB uses [longitude, latitude]
                    },
                    "$maxDistance": 500  # distance in meters
                }
            }
        }

        nearby_restaurants = list(restaurants_collection.find(query))
        
        # Serialize the results
        response = [
            {
                "name": restaurant["Nombre"],
                "lat": restaurant["Geometry"]["coordinates"][1],
                "lon": restaurant["Geometry"]["coordinates"][0],
                "type": restaurant.get("Tipo", "N/A"),
                "rating": restaurant.get("Nota", "N/A"),
                "price": restaurant.get("Precio", "N/A")
            }
            for restaurant in nearby_restaurants
        ]

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Función para verificar si una coordenada es válida
def is_valid_coordinate(coord):
    try:
        return isinstance(coord, (int, float)) and not math.isnan(coord)
    except TypeError:
        return False

import math
import logging

# Función para verificar si un valor es válido (no NaN)
def is_valid_value(value):
    try:
        return not math.isnan(value) if isinstance(value, float) else True
    except TypeError:
        return False

def is_valid_value(value):
    return value is not None and value != '' and not (isinstance(value, float) and value != value)  # Check for NaN

@app.route('/api/empty_locals', methods=['GET'])
def get_empty_locals():
    empty_locals = empty_locals_collection.find({}, {
        '_id': 0,
        'Título': 1,
        'Dirección completa': 1,
        'Precio total (€)': 1,
        'Superficie (m2)': 1,
        'Precio (€/m2)': 1,
        'Barrio': 1,
        'Geometry.coordinates': 1
    })

    locals_list = []

    for local in empty_locals:
        # Retrieve values from the updated structure
        direccion = local.get("Dirección completa")
        coordenadas = local.get("Geometry", {}).get("coordinates", [])
        titulo = local.get("Título")
        precio_total = local.get("Precio total (€)")
        superficie = local.get("Superficie (m2)")
        precio_por_m2 = local.get("Precio (€/m2)")
        barrio = local.get("Barrio")

        # Verificar si la dirección es válida
        if not direccion or direccion.strip() == "":
            continue

        # Verificar si las coordenadas son válidas
        if not coordenadas or len(coordenadas) != 2 or not all(is_valid_value(coord) for coord in coordenadas):
            continue

        # Verificar que el título no sea nulo o vacío
        if not titulo:
            continue

        # Preprocesar el precio total para convertirlo a un número
        precio_num = preprocess_price(precio_total)
        if precio_num is None:  # Filtrar locales con precios no válidos
            continue

        # Verificar si el barrio es un valor válido
        if not is_valid_value(barrio):
            continue

        # Añadir el local a la lista si pasa las verificaciones
        locals_list.append({
            "Título": titulo,
            "Dirección completa": direccion,
            "Precio total (€)": precio_num,
            "Superficie (m2)": superficie,
            "Precio (€/m2)": precio_por_m2,
            "Barrio": barrio,
            "Coordinates": coordenadas
        })

    # Logging para depuración
    logging.info(f"Total de locales válidos: {len(locals_list)}")

    return jsonify(locals_list)


import re
import logging

# Function to validate a coordinate or string value
def is_valid_value(value):
    if isinstance(value, str):
        return bool(value.strip())
    elif isinstance(value, (int, float)):
        return True
    return False

# Function to preprocess the price and convert it to a float
def preprocess_price(precio):
    if isinstance(precio, str):
        # Remove currency symbols and any non-numeric characters
        precio_clean = re.sub(r'[^\d.,]', '', precio)
        
        # Convert to float if possible
        try:
            return float(precio_clean.replace(',', '.'))
        except ValueError:
            logging.warning(f"Precio no válido: {precio}")
            return None
    elif isinstance(precio, (int, float)):
        return precio
    return None





# Ruta: Obtener datos de transporte
@app.route('/transport', methods=['GET'])
def get_transport():
    transport_data = list(transport_collection.find({}, {'_id': 0}))  # Excluir _id de la respuesta
    return jsonify(transport_data)

# Ruta: Obtener datos demográficos con filtros
@app.route('/api/demographics', methods=['GET'])
def get_demographics():
    try:
        filters = request.args
        age_range = filters.get('age_range', 'all')
        income = filters.get('income', 'all')
        household_size = filters.get('household_size', 'all')

        query = {}

        # Filtrar por rango de edad
        if age_range != 'all':
            try:
                min_age, max_age = map(int, age_range.split('-'))
                query['Distribución edad'] = {'$gte': min_age, '$lte': max_age}
            except ValueError:
                return jsonify({"error": "Rango de edad inválido"}), 400

        # Filtrar por renta
        if income != 'all':
            try:
                query['Renta'] = {'$gte': int(income)}
            except ValueError:
                return jsonify({"error": "Ingreso inválido"}), 400

        # Filtrar por tamaño del hogar
        if household_size != 'all':
            query['Distribución habitación por casas'] = household_size

        demographics = list(demographics_collection.find(query, {'_id': 0}))
        return jsonify(demographics), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta: Obtener todos los restaurantes con proyección de campos
@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = restaurants_collection.find({}, {
        "Nombre": 1,
        "Tipo": 1,
        "Categoría Cocina": 1,
        "Nota": 1,
        "Nº Reseñas": 1,
        "Precio": 1,
        "Categoría Precio": 1,
        "Accesibilidad": 1,
        "Barrio": 1,
        "Dirección": 1,
        "Geometry.coordinates": 1
    })


    restaurant_list = []
    for restaurant in restaurants:
        restaurant_list.append({
            "Nombre": restaurant.get("Nombre"),
            "Tipo": restaurant.get("Tipo"),
            "Categoría Cocina": restaurant.get("Categoría Cocina"),
            "Nota": restaurant.get("Nota"),
            "Nº Reseñas": restaurant.get("Nº Reseñas"),
            "Precio": restaurant.get("Precio"),
            "Categoría Precio": restaurant.get("Categoría Precio"),
            "Accesibilidad": restaurant.get("Accesibilidad"),
            "Barrio": restaurant.get("Barrio"),
            "Dirección": restaurant.get("Dirección"),
            "Coordinates": restaurant.get("Geometry", {}).get("coordinates", [])
        })
    return jsonify(restaurant_list)

# Ruta: Obtener datos del mapa con filtros demográficos
@app.route('/api/map_data', methods=['GET'])
def get_map_data():
    try:
        filters = request.args
        age_range = filters.get('age_range', 'all')
        income = filters.get('income', 'all')
        household_size = filters.get('household_size', 'all')

        query = {}
        if age_range != 'all':
            try:
                min_age, max_age = map(int, age_range.split('-'))
                query['Distribución edad'] = {'$gte': min_age, '$lte': max_age}
            except ValueError:
                return jsonify({"error": "Rango de edad inválido"}), 400

        if income != 'all':
            query['Renta'] = {'$gte': int(income)}

        if household_size != 'all':
            query['Distribución habitación por casas'] = household_size

        data = list(demographics_collection.find(query))

        # Convertir ObjectId a string
        for item in data:
            if '_id' in item:
                item['_id'] = str(item['_id'])

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta: Renderizar mapas interactivos
@app.route('/interactive-maps')
def interactive_maps():
    return render_template('interactive_map.html')

# Ruta: Obtener datos de la población y restaurantes
@app.route('/api/get_data')
def get_data():
    population_data = list(demographics_collection.find())
    restaurant_data = list(restaurants_collection.find())
    return jsonify({
        "population": population_data,
        "restaurants": restaurant_data
    })

# Ruta: Filtro general
@app.route('/api/filter', methods=['GET'])
def filter_data():
    age_range = request.args.get('age_range')
    filtered_population = list(demographics_collection.find({"age_range": age_range}))
    filtered_restaurants = list(restaurants_collection.find())
    return jsonify({
        "population": filtered_population,
        "restaurants": filtered_restaurants
    })





# Funciones auxiliares
# Función para normalizar un valor dado un rango mínimo y máximo
def normalize(value, min_value, max_value):
    if max_value - min_value == 0:
        return 0
    return (value - min_value) / (max_value - min_value)

# Función para normalizar el nombre del barrio
def normalize_barrio_name(barrio_name):
    if isinstance(barrio_name, str):
        return barrio_name.strip().lower()
    return barrio_name

# Ruta: Obtener datos de viabilidad de barrios
@app.route('/api/viability', methods=['GET'])
def get_viability_score():
    try:
        # Recuperar datos demográficos y de restaurantes
        demographics = list(demographics_collection.find({}, {'_id': 0}))
        restaurants = list(restaurants_collection.find({}, {'_id': 0}))

        # Determinar los valores mínimos y máximos para normalización
        min_income = min([float(neighborhood.get('Renta', '0').replace(",", ".")) for neighborhood in demographics if neighborhood.get('Renta')])
        max_income = max([float(neighborhood.get('Renta', '0').replace(",", ".")) for neighborhood in demographics if neighborhood.get('Renta')])
        
        min_population_density = min([float(neighborhood.get('Densidad poblacion', 0)) for neighborhood in demographics if neighborhood.get('Densidad poblacion')])
        max_population_density = max([float(neighborhood.get('Densidad poblacion', 0)) for neighborhood in demographics if neighborhood.get('Densidad poblacion')])

        # Calcular el viability score para cada barrio
        viability_scores = []

        for neighborhood in demographics:
            barrio = normalize_barrio_name(neighborhood.get('Nombre', 'Desconocido'))
            income = neighborhood.get('Renta', '0')
            population_density = neighborhood.get('Densidad poblacion', 0)
            household_size = neighborhood.get('Distribución habitación por casas', {})

            # Convertir y normalizar los valores a numéricos si es necesario
            try:
                income = float(income.replace(",", "."))
                income = normalize(income, min_income, max_income)
            except (ValueError, TypeError):
                income = 0.0

            try:
                population_density = float(population_density)
                population_density = normalize(population_density, min_population_density, max_population_density)
            except (ValueError, TypeError):
                population_density = 0.0

            # Calcular el tamaño promedio del hogar (si hay varias categorías)
            if isinstance(household_size, dict) and household_size:
                total_habitaciones = sum(float(v) for v in household_size.values() if isinstance(v, (int, float, str)))
                num_habitaciones = len(household_size)
                average_household_size = total_habitaciones / num_habitaciones if num_habitaciones > 0 else 1
            else:
                average_household_size = 1

            # Contar el número de restaurantes en ese barrio
            restaurant_count = sum(1 for r in restaurants if normalize_barrio_name(r.get('Barrio')) == barrio)

            # Lógica para calcular el puntaje de viabilidad, ajustada con normalización y pesos
            score = (income * 0.3) + (population_density * 0.3) + (restaurant_count * 0.3) + (average_household_size * 0.1)
            score = max(score, 0)  # Asegurarse de que el puntaje no sea negativo

            viability_scores.append({
                'Barrio': neighborhood.get('Nombre', 'Desconocido'),
                'ViabilityScore': score
            })

        return jsonify(viability_scores), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/restaurant_types', methods=['GET'])
def get_restaurant_types():
    try:
        # Query MongoDB to get distinct restaurant types from the 'Categoría Cocina' field
        restaurant_types = mongo.db.restaurants.distinct("Categoría Cocina")
        
        return jsonify({"types": restaurant_types}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def calculate_histogram(data: list, intervals=None):
    data = [x for x in data if x is not None]
    n = len(data)
    if isinstance(data[0], str):
        hist = Counter(data)
        for k in hist.keys():
            hist[k] = float(hist[k]/n)
    elif isinstance(data[0], float):
        if intervals is None:
            raise ValueError('If the data are numbers you must provide the intervals')
        hist = histogram(data, bins=intervals)
        hist_vals = [float(x/n) for x in hist[0]]
        hist = (hist_vals, hist[1].tolist())
    else:
        raise ValueError('Data must be a list of strings or floats')
    return hist
@app.route('/api/neighbours_competitors', methods=['GET'])
def neighbours_competitors():
    try:
        # Retrieve latitude and longitude from request arguments
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        print("fhwiehfuiwhfiwhfiewuh",lat, lon)
        # Validate latitude and longitude
        if not lat or not lon:
            return jsonify({"error": "Missing latitude or longitude"}), 400

        lat = float(lat)
        lon = float(lon)

        # Define the aggregation pipeline with explicit index key
        query_pipeline = [
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": [lon, lat]},
                    "distanceField": "distancia",  # Field where distance will be stored
                    "maxDistance": 500,  # Maximum distance in meters
                    "spherical": True,  # Spherical calculation
                    "key": "Geometry.coordinates"  # Specify which index to use
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "Categoría Cocina": 1,
                    "Nota": 1,
                    "Categoría Precio": 1,
                    "Accesibilidad": 1
                }
            },
            {
                "$group": {
                    "_id": None,
                    "categoría_cocina": {"$push": "$Categoría Cocina"},
                    "notas": {"$push": "$Nota"},
                    "categoría_precio": {"$push": "$Categoría Precio"},
                    "accesibilidad": {"$push": "$Accesibilidad"}
                }
            }
        ]

        # Run the aggregation query
        result = list(mongo.db.restaurants.aggregate(query_pipeline))
        print("**************",result)

        # Handle empty result
        if not result:
            return jsonify({"error": "No nearby competitors found"}), 404

        restaurant_data = result[0]
        number_of_restaurants = len(restaurant_data.get("notas", []))
        category_histogram = calculate_histogram(restaurant_data.get("categoría_cocina", []))
        price_histogram = calculate_histogram(restaurant_data.get("categoría_precio", []))
        mark_histogram = calculate_histogram(restaurant_data.get("notas", []), intervals=[x * 0.5 for x in range(11)])
        accessibility_histogram = calculate_histogram(restaurant_data.get("accesibilidad", []), intervals=[x for x in range(11)])

        return jsonify({
            "Categoria Cocina": category_histogram,
            "Numero de restaurantes": number_of_restaurants,
            "Precio": price_histogram,
            "Nota": mark_histogram,
            "Accesibilidad": accessibility_histogram
        })

    except ValueError:
        return jsonify({"error": "Invalid latitude or longitude"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)