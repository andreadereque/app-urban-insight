from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Asegúrate de que CORS está importado
from bson import ObjectId  # Importar ObjectId para convertir el _id

app = Flask(__name__)

# Habilitar CORS para permitir solicitudes desde el frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuración de MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/urban_insight_data"
mongo = PyMongo(app)
transport_collection = mongo.db['transport']  # Nombre de tu colección de transporte

@app.route('/transport', methods=['GET'])
def get_transport():
    # Obtener todos los puntos de transporte desde la colección MongoDB
    transport_data = list(transport_collection.find({}, {'_id': 0}))  # Excluir _id de la respuesta
    return jsonify(transport_data)
@app.route('/api/demographics', methods=['GET'])
@app.route('/api/demographics', methods=['GET'])
def get_demographics():
    try:
        filters = request.args
        age_range = filters.get('age_range', 'all')
        income = filters.get('income', 'all')
        household_size = filters.get('household_size', 'all')

        query = {}

        # Aplicar filtro de rango de edad
        if age_range != 'all':
            try:
                min_age, max_age = map(int, age_range.split('-'))
                query['Distribución edad'] = {'$gte': min_age, '$lte': max_age}
            except ValueError:
                return jsonify({"error": "Rango de edad inválido"}), 400

        # Aplicar filtro de renta
        if income != 'all':
            try:
                query['Renta'] = {'$gte': int(income)}
            except ValueError:
                return jsonify({"error": "Ingreso inválido"}), 400

        # Aplicar filtro de tamaño del hogar
        if household_size != 'all':
            query['Distribución habitación por casas'] = household_size

        # Recuperar los datos desde MongoDB con los filtros aplicados
        demographics = list(mongo.db['demographic_info'].find(query, {'_id': 0}))

        return jsonify(demographics), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    # Recuperar los restaurantes desde MongoDB
    restaurants = mongo.db.restaurants.find()
    response = []
    for restaurant in restaurants:
        response.append({
            '_id': str(restaurant.get('_id')),
            'Nombre': restaurant.get('Nombre'),
            'Tipo': restaurant.get('Tipo'),
            'Nota': restaurant.get('Nota'),
            'Nº Reseñas': restaurant.get('Nº Reseñas'),
            'Accesibilidad': restaurant.get('Accesibilidad'),
            'Barrio': restaurant.get('Barrio'),
            'Dirección': restaurant.get('Dirección'),
            'Coordinates': restaurant.get('Geometry', {}).get('coordinates', [])
        })

    return jsonify(response)
@app.route('/api/map_data', methods=['GET'])
def get_map_data():
    try:
        print(request.args)  # Para ver qué parámetros se están enviando

        filters = request.args
        age_range = filters.get('age_range', None)
        income = filters.get('income', None)
        household_size = filters.get('household_size', None)

        query = {}
        if age_range != 'all':
            try:
                min_age, max_age = map(int, age_range.split('-'))
                query['Distribución edad'] = {'$gte': min_age, '$lte': max_age}
            except ValueError:
                return jsonify({"error": "Rango de edad inválido"}), 400

        if income:
            try:
                query['Renta'] = {'$gte': int(income)}
            except ValueError:
                return jsonify({"error": "Ingreso inválido"}), 400

        if household_size != 'all':
            query['Distribución habitación por casas'] = household_size

        data = list(mongo.db.demographic_info.find(query))

        # Convertir ObjectId a string
        for item in data:
            if '_id' in item:
                item['_id'] = str(item['_id'])

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/interactive-maps')
def interactive_maps():
    return render_template('interactive_map.html')
@app.route('/api/get_data')
def get_data():
    population_data = list(mongo.db.demographic_info.find())
    restaurant_data = list(mongo.db.restaurants.find())
    return jsonify({
        "population": population_data,
        "restaurants": restaurant_data
    })

@app.route('/api/filter')
def filter_data():
    age_range = request.args.get('age_range')
    # Example filter: Adjust this to actual MongoDB queries
    filtered_population = list(mongo.db.demographic_info.find({"age_range": age_range}))
    filtered_restaurants = list(mongo.db.restaurants.find())
    return jsonify({
        "population": filtered_population,
        "restaurants": filtered_restaurants
    })
if __name__ == '__main__':
    app.run(debug=True)
