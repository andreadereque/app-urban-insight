from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter
from shapely.geometry import Point, Polygon
from pyproj import Transformer
transformer = Transformer.from_crs("EPSG:32631", "EPSG:4326", always_xy=True)  # Asegúrate de usar el código UTM correcto





class RestaurantService:
    def __init__(self, mongo):
        self.restaurants_collection = mongo.db['restaurants']

    def get_nearby_restaurants(self, lat, lon):
        query = {
            "Geometry.coordinates": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "$maxDistance": 500
                }
            }
        }
        nearby_restaurants = list(self.restaurants_collection.find(query))
        response = [
            {
                "name": restaurant["Nombre"],
                "lat": restaurant["Geometry"]["coordinates"][1],
                "lon": restaurant["Geometry"]["coordinates"][0],
                "type": restaurant.get("Categoría Cocina", "N/A"),
                "rating": restaurant.get("Nota", "N/A"),
                "price": restaurant.get("Categoría Precio", "N/A")
            }
            for restaurant in nearby_restaurants
        ]
        return jsonify(response)

    def get_restaurants(self):
        restaurants = self.restaurants_collection.find({}, {
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
    



    def get_neighbours_competitors(self, lat, lon):
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
                    "accesibilidad": {"$push": "$Accesibilidad"},
                    "total_restaurants": {"$sum": 1}  # Count the number of restaurants
                }
            }
        ]

        # Run the aggregation query
        result = list(self.restaurants_collection.aggregate(query_pipeline))

        # Handle empty result
        if not result:
            return jsonify({"error": "No nearby competitors found"}), 404

        restaurant_data = result[0]
        number_of_restaurants = restaurant_data.get("total_restaurants", 0)
        category_histogram = self.calculate_histogram(restaurant_data.get("categoría_cocina", []))
        price_histogram = self.calculate_histogram(restaurant_data.get("categoría_precio", []))
        mark_histogram = self.calculate_histogram(restaurant_data.get("notas", []), intervals=[x * 0.5 for x in range(11)])

        # Calculate minimum, average, and maximum for accessibility
        accesibilidad_values = restaurant_data.get("accesibilidad", [])
        accesibilidad_values = [x for x in accesibilidad_values if x is not None]  # Filtrar valores None
        if accesibilidad_values:
            min_accesibilidad = min(accesibilidad_values)
            avg_accesibilidad = sum(accesibilidad_values) / len(accesibilidad_values)
            max_accesibilidad = max(accesibilidad_values)
        else:
            min_accesibilidad = avg_accesibilidad = max_accesibilidad = None


        return jsonify({
            "Categoria Cocina": category_histogram,
            "Numero de restaurantes": number_of_restaurants,
            "Precio": price_histogram,
            "Nota": mark_histogram,
            "Accesibilidad": {
                "min": min_accesibilidad,
                "avg": avg_accesibilidad,
                "max": max_accesibilidad
            }
        })

    def calculate_histogram(self, data: list, intervals=None):
        if not data:
            return []
        n = len(data)
        if isinstance(data[0], str):
            hist = Counter(data)
            for k in hist.keys():
                hist[k] = float(hist[k] / n)
            return dict(hist)
        elif isinstance(data[0], float):
            if intervals is None:
                raise ValueError('If the data are numbers you must provide the intervals')
            hist = histogram(data, bins=intervals)
            hist_vals = [float(x / n) for x in hist[0]]
            return (hist_vals, hist[1].tolist())
        else:
            raise ValueError('Data must be a list of strings or floats')
        
    def convert_utm_to_latlon(self, utm_x, utm_y):
        """ Convierte coordenadas UTM a latitud/longitud (WGS84) utilizando Transformer """
        lon, lat = transformer.transform(utm_x, utm_y)
        return lon, lat

    def get_restaurant_count_by_neighborhood(self, neighborhoods):
        restaurant_count_by_neighborhood = {}

        for neighborhood in neighborhoods:
            # Convertir las coordenadas UTM a lat/lon solo una vez por barrio
            utm_polygon_coords = neighborhood['Geometry']['coordinates'][0]
            latlon_polygon_coords = [self.convert_utm_to_latlon(x, y) for x, y in utm_polygon_coords]

            # Crear el polígono en formato GeoJSON
            polygon_geojson = {
                "type": "Polygon",
                "coordinates": [latlon_polygon_coords]  # GeoJSON espera [ [lat, lon], ... ]
            }

            # Consulta geoespacial en MongoDB usando $geoWithin
            query = {
                "Geometry.coordinates": {
                    "$geoWithin": {
                        "$geometry": polygon_geojson
                    }
                }
            }

            # Contar los restaurantes dentro del barrio
            count = self.restaurants_collection.count_documents(query)
            restaurant_count_by_neighborhood[neighborhood['Nombre']] = count

        return restaurant_count_by_neighborhood
    
    def get_price_categories(self):
        # Usamos aggregate para obtener los valores únicos de la categoría de precio
        pipeline = [
            {"$group": {"_id": "$Categoría Precio"}},  # Agrupamos por categoría de precio
            {"$sort": {"_id": 1}}  # Ordenamos alfabéticamente
        ]
        results = list(self.restaurants_collection.aggregate(pipeline))
        # Extraer solo el valor de "_id", que es la categoría de precio
        price_categories = [result["_id"] for result in results]
        return price_categories
    
    def get_restaurant_count_by_neighborhood(self, neighborhood_name):
        count = self.restaurants_collection.count_documents({"Barrio": neighborhood_name})
        return count



    def get_top_5_cuisine_types_by_neighborhood(self, neighborhood_name):
        pipeline = [
            {"$match": {"Barrio": neighborhood_name}},  # Match restaurants in the specified neighborhood
            {"$group": {"_id": "$Categoría Cocina", "count": {"$sum": 1}}},  # Group by cuisine type and count occurrences
            {"$sort": {"count": -1}},  # Sort by count in descending order (most common first)
            {"$limit": 5}  # Limit to top 5 most common types
        ]
        result = list(self.restaurants_collection.aggregate(pipeline))  # Execute the pipeline
        top_cuisine_types = [{"Tipo": entry["_id"], "count": entry["count"]} for entry in result]  # Format result
        return top_cuisine_types
    
    def get_restaurants_by_neighborhood(self, neighborhood_name):
        try:
            restaurants = self.restaurants_collection.find({"Barrio": neighborhood_name})
            restaurant_list = []
            for restaurant in restaurants:
                # Convert ObjectId to string for JSON serialization
                restaurant['_id'] = str(restaurant['_id'])
                restaurant_list.append(restaurant)
            return restaurant_list
        except Exception as e:
            logging.error(f"Error fetching restaurants: {str(e)}")
            raise




    def get_popular_cuisine_by_neighborhood(self, neighborhood_name):
        pipeline = [
            {"$match": {"Barrio": neighborhood_name}},  # Match neighborhood
            {"$group": {"_id": "$Categoría Cocina", "count": {"$sum": 1}}},  # Group by cuisine category
            {"$sort": {"count": -1}},  # Sort by most popular
            {"$limit": 1}  # Limit to the most popular cuisine
        ]
        result = list(self.restaurants_collection.aggregate(pipeline))
        if result:
            return result[0]["_id"]
        return None


    def get_price_categories_by_neighborhood(self, neighborhood_name):
        pipeline = [
            {"$match": {"Barrio": neighborhood_name}},  # Match restaurants in the neighborhood
            {"$group": {"_id": "$Categoría Precio", "count": {"$sum": 1}}},  # Group by price category
            {"$sort": {"count": -1}}  # Sort by most frequent categories
        ]
        result = list(self.restaurants_collection.aggregate(pipeline))
        price_categories = {entry["_id"]: entry["count"] for entry in result}  # Convert to dictionary
        return price_categories


