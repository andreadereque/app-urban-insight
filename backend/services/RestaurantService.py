from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter

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
                "type": restaurant.get("Tipo", "N/A"),
                "rating": restaurant.get("Nota", "N/A"),
                "price": restaurant.get("Precio", "N/A")
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
                    "accesibilidad": {"$push": "$Accesibilidad"}
                }
            }
        ]

        # Run the aggregation query
        result = list(self.restaurants_collection.aggregate(query_pipeline))

        # Handle empty result
        if not result:
            return jsonify({"error": "No nearby competitors found"}), 404

        restaurant_data = result[0]
        number_of_restaurants = len(restaurant_data.get("notas", []))
        category_histogram = self.calculate_histogram(restaurant_data.get("categoría_cocina", []))
        price_histogram = self.calculate_histogram(restaurant_data.get("categoría_precio", []))
        mark_histogram = self.calculate_histogram(restaurant_data.get("notas", []), intervals=[x * 0.5 for x in range(11)])
        accessibility_histogram = self.calculate_histogram(restaurant_data.get("accesibilidad", []), intervals=[x for x in range(11)])

        return jsonify({
            "Categoria Cocina": category_histogram,
            "Numero de restaurantes": number_of_restaurants,
            "Precio": price_histogram,
            "Nota": mark_histogram,
            "Accesibilidad": accessibility_histogram
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