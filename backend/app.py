from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Para habilitar CORS
from bson import ObjectId  # Para convertir ObjectId en str

app = Flask(__name__)

# Habilitar CORS para permitir solicitudes desde el frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuración de MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/urban_insight_data"
mongo = PyMongo(app)

# Colecciones
transport_collection = mongo.db['transport']
demographics_collection = mongo.db['demographic_info']
restaurants_collection = mongo.db['restaurants']

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

if __name__ == '__main__':
    app.run(debug=True)
