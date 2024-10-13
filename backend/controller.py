from flask import Flask, jsonify, render_template, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Para habilitar CORS
import logging
from services.RestaurantService import RestaurantService
from services.DemographicService import DemographicService
from services.EmptyLocalsService import EmptyLocalsService
from services.TransportService import TransportService

app = Flask(__name__)

# Habilitar CORS para permitir solicitudes desde el frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuración de MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/urban_insight_data"
mongo = PyMongo(app)
logging.basicConfig(level=logging.WARNING)

# Crear índices necesarios
mongo.db.restaurants.create_index([("Geometry.coordinates", "2dsphere")], background=True)

# Servicios
restaurant_service = RestaurantService(mongo)
demographics_service = DemographicService(mongo)
empty_local_service = EmptyLocalsService(mongo)
transport_service = TransportService(mongo)

@app.route('/nearby_restaurants', methods=['GET'])
def get_nearby_restaurants():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        return restaurant_service.get_nearby_restaurants(lat, lon)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/empty_locals', methods=['GET'])
def get_empty_locals():
    return empty_local_service.get_empty_locals()

@app.route('/transport', methods=['GET'])
def get_transport():
    return transport_service.get_transport_data()

@app.route('/api/demographics', methods=['GET'])
def get_demographics():
    try:
        filters = request.args
        return demographics_service.get_demographics(filters)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    return restaurant_service.get_restaurants()



@app.route('/api/neighbours_competitors', methods=['GET'])
def neighbours_competitors():
    try:
        # Retrieve latitude and longitude from request arguments
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        # Validate latitude and longitude
        if not lat or not lon:
            return jsonify({"error": "Missing latitude or longitude"}), 400

        lat = float(lat)
        lon = float(lon)

        return restaurant_service.get_neighbours_competitors(lat, lon)

    except ValueError:
        return jsonify({"error": "Invalid latitude or longitude"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)