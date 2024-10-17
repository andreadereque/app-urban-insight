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

@app.route('/api/neighborhoods', methods=['GET'])
def get_neighborhoods():
    try:
        return demographics_service.get_neigborhoods()
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
    
@app.route('/api/restaurant_counts', methods=['GET'])
def get_restaurant_counts():
    try:
        # Obtener los barrios con geometría desde el servicio de demografía
        neighborhoods = demographics_service.get_neigborhoods()
        
        # Calcular el conteo de restaurantes por barrio usando el servicio de restaurantes
        restaurant_count_by_neighborhood = restaurant_service.get_restaurant_count_by_neighborhood(neighborhoods)
        
        return jsonify(restaurant_count_by_neighborhood), 200

    except Exception as e:
        logging.error(f"Error calculating restaurant counts: {str(e)}")
        return jsonify({'error': str(e)}), 500

    

@app.route('/api/empty_locals_count_by_neighborhood', methods=['GET'])
def get_empty_locals_count_by_neighborhood():
    try:
        local_counts = empty_local_service.get_empty_locals_count_by_neighborhood()
        return jsonify(local_counts), 200
    except Exception as e:
        logging.error(f"Error counting empty locals by neighborhood: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/empty_locals_average_price', methods=['GET'])
def get_empty_locals_average_price():
    try:
        neighborhood = request.args.get('neighborhood')
        if not neighborhood:
            return jsonify({"error": "Missing neighborhood parameter"}), 400
        
        average_price = empty_local_service.get_average_price_by_neighborhood(neighborhood)
        return jsonify({"neighborhood": neighborhood, "average_price": average_price}), 200
    except Exception as e:
        logging.error(f"Error calculating average price for neighborhood {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/empty_locals_average_price_by_neighborhood', methods=['GET'])
def get_empty_locals_average_price_by_neighborhood():
    try:
        average_prices = empty_local_service.get_average_price_by_neighborhoods()
        return jsonify(average_prices), 200
    except Exception as e:
        logging.error(f"Error calculating average price by neighborhood: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/neighborhoods_idealista', methods=['GET'])
def get_neighborhoods_idealista():
    try:
        return jsonify(demographics_service.get_neighborhoods_idealista())
    except Exception as e:
        logging.error(f"Error fetching neighborhoods: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/restaurant_price_categories', methods=['GET'])
def get_price_categories():
    try:
        # Obtener todas las categorías de precios sin duplicados
        price_categories = restaurant_service.get_price_categories()
        return jsonify(price_categories), 200
    except Exception as e:
        logging.error(f"Error fetching price categories: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/restaurant_cuisine_categories', methods=['GET'])
def get_cuisine_categories():
    try:
        # Obtener todas las categorías de cocina sin duplicados
        cuisine_categories = restaurant_service.get_cuisine_categories()
        return jsonify(cuisine_categories), 200
    except Exception as e:
        logging.error(f"Error fetching cuisine categories: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/demographics_by_name', methods=['GET'])
def get_demographics_by_name():
    try:
        barrio = request.args.get('barrio')
        if barrio:
            neighborhood_data = demographics_service.get_neighborhood_by_name(barrio)
            if neighborhood_data:
                return jsonify(neighborhood_data), 200
            else:
                return jsonify({"error": f"No data found for neighborhood: {barrio}"}), 404
        else:
            filters = request.args
            return demographics_service.get_demographics(filters)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/similar_neighborhoods_by_renta/<string:renta>', methods=['GET'])
def get_similar_neighborhoods_by_renta(renta):
    renta = renta.replace(",", ".")  # Replace comma with period
    renta = float(renta)  # Convert to float
    print("************", renta)
    
    barrios_similares = demographics_service.get_neighborhoods_by_renta_service(renta)
    
    if barrios_similares:
        return jsonify(barrios_similares)
    else:
        return jsonify({"error": "No se encontraron barrios con una renta similar"}), 404
    
@app.route('/api/top_5_cuisine_types_by_neighborhood/<string:neighborhood_name>', methods=['GET'])
def get_top_5_cuisine_types_by_neighborhood(neighborhood_name):
    try:
        top_cuisine_types = restaurant_service.get_top_5_cuisine_types_by_neighborhood(neighborhood_name)
        return jsonify(top_cuisine_types), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
@app.route('/api/restaurant_price_categories_by_neighborhood/<string:neighborhood_name>', methods=['GET'])
def get_restaurant_price_categories_by_neighborhood(neighborhood_name):
    try:
        price_categories = restaurant_service.get_price_categories_by_neighborhood(neighborhood_name)
        return jsonify(price_categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/restaurant_count_by_neighborhood/<string:neighborhood_name>', methods=['GET'])
def get_restaurant_count_by_neighborhood(neighborhood_name):
    try:
        count = restaurant_service.get_restaurant_count_by_neighborhood(neighborhood_name)
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)