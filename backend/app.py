from collections import defaultdict
from difflib import SequenceMatcher
import re
from typing import Counter
from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Para habilitar CORS
from bson import ObjectId  # Para convertir ObjectId en str
import logging

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

if __name__ == '__main__':
    app.run(debug=True)