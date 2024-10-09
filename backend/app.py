from collections import defaultdict
from difflib import SequenceMatcher
import re
from typing import Counter
from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Para habilitar CORS
from bson import ObjectId  # Para convertir ObjectId en str
import logging
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
                    "$maxDistance": 200  # distance in meters
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
        'Precio': 1,
        'itemdetail': 1,
        'itemdetail2': 1,
        'itemdetail3': 1,
        'Barrio': 1,
        'Geometry.coordinates': 1
    })

    locals_list = []

    for local in empty_locals:
        direccion = local.get("Dirección completa")
        coordenadas = local.get("Geometry", {}).get("coordinates", [])
        titulo = local.get("Título")
        precio = local.get("Precio")
        itemdetail = local.get("itemdetail")
        itemdetail2 = local.get("itemdetail2")
        itemdetail3 = local.get("itemdetail3")
        barrio = local.get("Barrio")

        # Verificar si la dirección es válida
        if not direccion or direccion.strip() == "":
            continue

        # Verificar si las coordenadas son válidas
        if not coordenadas or len(coordenadas) != 2 or not all(is_valid_value(coord) for coord in coordenadas):
            continue

        # Verificar que el título y otros detalles no sean nulos o vacíos
        if not titulo or not itemdetail:
            continue

        # Preprocesar el precio para convertirlo a un número
        precio_num = preprocess_price(precio)
        if precio_num is None:  # Filtrar locales con precios no válidos
            continue

        # Verificar si el barrio es un valor válido
        if not is_valid_value(barrio):
            continue

        # Si pasa las verificaciones, añadir el local a la lista
        locals_list.append({
            "Título": titulo,
            "Dirección completa": direccion,
            "Precio": precio_num,  # Usar el precio ya convertido
            "Itemdetail": itemdetail,
            "Itemdetail2": itemdetail2,
            "Itemdetail3": itemdetail3,
            "Barrio": barrio,
            "Coordinates": coordenadas
        })

    # Logging para depuración
    logging.info(f"Total de locales válidos: {len(locals_list)}")

    return jsonify(locals_list)

def preprocess_price(price_string):
    """Preprocesar el precio para convertirlo a un número"""
    if not price_string:
        return None
    try:
        # Remover caracteres que no son parte del número
        clean_string = price_string.replace('€', '').replace('/mes', '').replace('.', '').replace(',', '.').strip()
        return float(clean_string)
    except ValueError:
        return None




# Ruta: Obtener datos de transporte
@app.route('/transport', methods=['GET'])
def get_transport():
    transport_data = list(transport_collection.find({}, {'_id': 0}))  # Excluir _id de la respuesta
    return jsonify(transport_data)

@app.route('/api/demographics', methods=['GET'])  # TODO: mirar si se tiene que quitar esta linea repetida
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

@app.route('/api/neighbours_competitors')
def neighbours_competitors(local):
    coordinates = local.get("Coordinates")  # TODO: Ver que pinta tiene el objeto que se obtiene con el requests
    query_pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": coordinates},
                "distanceField": "distancia",  # Campo donde se almacenará la distancia
                "maxDistance": 500,  # Distancia máxima en metros
                "spherical": True,  # Cálculo esférico de la distancia
                "query": {},  # Si quisieras añadir más filtros
            }
        },
        {
            "$project": {
                "_id": 0,
                "Categoría Cocina": 1,
                "Nota": 1,
                "Categoría Precio": 1,
                "Nombre": 1,
                "Accesibilidad": 1
                }
        }
    ]
    results = list(mongo.db.aggregate(query_pipeline))



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
    
if __name__ == '__main__':
    app.run(debug=True)