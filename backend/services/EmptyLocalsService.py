from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter

class EmptyLocalsService:
    def __init__(self, mongo):
        self.empty_locals_collection = mongo.db['empty_locals']
        self.demographics_collection = mongo.db['demographic_info']

    def get_empty_locals(self):
        empty_locals = self.empty_locals_collection.find({}, {
            '_id': 0,
            'Título': 1,
            'Dirección completa': 1,
            'Precio total (€)': 1,
            'Superficie (m2)': 1,
            'Precio (€/m2)': 1,
            'Barrio': 1,
            'Geometry.coordinates': 1,
            'Accesibilidad':1,
        })
        locals_list = []
        for local in empty_locals:
            direccion = local.get("Dirección completa")
            coordenadas = local.get("Geometry", {}).get("coordinates", [])
            titulo = local.get("Título")
            precio_total = local.get("Precio total (€)")
            superficie = local.get("Superficie (m2)")
            precio_por_m2 = local.get("Precio (€/m2)")
            barrio = local.get("Barrio")
            accesibilidad = local.get("Accesibilidad")
            if not direccion or direccion.strip() == "" or not coordenadas or len(coordenadas) != 2 or not titulo:
                continue
            precio_num = self.preprocess_price(precio_total)
            if precio_num is None or not barrio:
                continue
            locals_list.append({
                "Título": titulo,
                "Dirección completa": direccion,
                "Precio total (€)": precio_num,
                "Superficie (m2)": superficie,
                "Precio (€/m2)": precio_por_m2,
                "Barrio": barrio,
                "Coordinates": coordenadas,
                "Accesibilidad":accesibilidad
            })
        logging.info(f"Total de locales válidos: {len(locals_list)}")
        return jsonify(locals_list)

    def preprocess_price(self, precio):
        if isinstance(precio, str):
            precio_clean = re.sub(r'[^\d.,]', '', precio)
            try:
                return float(precio_clean.replace(',', '.'))
            except ValueError:
                logging.warning(f"Precio no válido: {precio}")
                return None
        elif isinstance(precio, (int, float)):
            return precio
        return None
    
    def get_empty_locals_count_by_neighborhood(self):
        pipeline = [
            {
                "$group": {
                    "_id": "$Barrio",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        results = self.empty_locals_collection.aggregate(pipeline)
        return [{"Barrio": r["_id"], "count": r["count"]} for r in results]
    
    def get_average_price_by_neighborhood(self, neighborhood):
        pipeline = [
            {"$match": {"Barrio": neighborhood}},
            {
                "$group": {
                    "_id": None,
                    "average_price": {"$avg": "$Precio total (€)"}
                }
            }
        ]
        result = list(self.empty_locals_collection.aggregate(pipeline))
        if result:
            return result[0]["average_price"]
        return 0
    
    def get_average_price_by_neighborhoods(self):
        pipeline = [
            {
                "$group": {
                    "_id": "$Barrio",
                    "average_price": {"$avg": "$Precio total (€)"}
                }
            },
            {
                "$sort": {"average_price": -1}
            }
        ]
        results = self.empty_locals_collection.aggregate(pipeline)
        return [{"Barrio": r["_id"], "average_price": r["average_price"]} for r in results]
    
    