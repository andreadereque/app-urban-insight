from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter
from pyproj import Proj, Transformer, transform
import unidecode


transformer = Transformer.from_crs("EPSG:32631", "EPSG:4326", always_xy=True)
def normalize_name(name):
    return unidecode.unidecode(name.lower()).strip()

def convert_utm_to_wgs84(coordinates):
    try:
        # Verificar si las coordenadas son de tipo polígono o multipolígono
        if isinstance(coordinates[0], list) and isinstance(coordinates[0][0], list):
            # Multipolígono
            logging.info("Converting multipolygon")
            return [
                [
                    [
                        transformer.transform(easting, northing)
                        for easting, northing in ring
                        if isinstance(easting, (int, float)) and isinstance(northing, (int, float))  # Verificar el formato
                    ]
                    for ring in polygon
                ]
                for polygon in coordinates
            ]
        elif isinstance(coordinates[0], list) and len(coordinates[0]) == 2:
            # Polígono simple
            logging.info(f"Converting polygon with coordinates: {coordinates}")
            return [
                transformer.transform(easting, northing)
                for easting, northing in coordinates
                if isinstance(easting, (int, float)) and isinstance(northing, (int, float))  # Verificar el formato
            ]
        else:
            # Si el formato no es válido, registrar el problema
            logging.error(f"Invalid coordinate format detected: {coordinates}")
            return []  # Devolver una lista vacía en caso de formato inválido
    except Exception as e:
        logging.error(f"Error converting coordinates: {str(e)}")
        return []  

class DemographicService:
    def __init__(self, mongo):
        self.demographics_collection = mongo.db['demographic_info']

    def get_demographics(self, filters):
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
            try:
                query['Renta'] = {'$gte': int(income)}
            except ValueError:
                return jsonify({"error": "Ingreso inválido"}), 400
        if household_size != 'all':
            query['Distribución habitación por casas'] = household_size
        demographics = list(self.demographics_collection.find(query, {'_id': 0}))
        return jsonify(demographics)
    
    
        
    def get_neigborhoods(self):
        try:
            barrios = self.demographics_collection.find({}, {"_id": 0, "Nombre": 1, "Geometry": 1})
            return list(barrios)
        except Exception as e:
            logging.error(f"Error fetching neighborhoods: {str(e)}")
            raise e
        

    
        
    def get_neighborhoods_idealista(self):
        try:
            barrios = self.demographics_collection.find({}, {"_id": 0, "Nombre": 1, "Geometry": 1})
            neighborhoods = list(barrios)

            # Convertir las coordenadas de UTM a WGS84 antes de devolver los resultados
            for barrio in neighborhoods:
                logging.info(f"Processing neighborhood: {barrio['Nombre']}")
                logging.info(f"Coordinates before conversion: {barrio['Geometry']['coordinates']}")
                
                # Intentar la conversión
                converted_coords = convert_utm_to_wgs84(barrio['Geometry']['coordinates'])
                
                if not converted_coords:
                    logging.error(f"Failed to convert coordinates for neighborhood: {barrio['Nombre']}")
                    continue  # Saltar este barrio si la conversión falla
                
                barrio['Geometry']['coordinates'] = converted_coords
                logging.info(f"Coordinates after conversion: {barrio['Geometry']['coordinates']}")
            
            # Verificar que los datos son serializables a JSON antes de devolver
            if isinstance(neighborhoods, list):
                return jsonify(neighborhoods)  # Asegurar que se está devolviendo un tipo serializable
            else:
                logging.error("Neighborhoods data is not serializable")
                return jsonify({'error': 'Data not serializable'}), 500

        except Exception as e:
            logging.error(f"Error fetching neighborhoods: {str(e)}")
            return jsonify({'error': str(e)}), 500
        
    def get_neighborhood_by_name(self, barrio):
        try:
            # Normalize the neighborhood name
            normalized_barrio = normalize_name(barrio)
            
            # Query to match the normalized neighborhood name
            neighborhood = self.demographics_collection.find_one(
                {
                    "$expr": {
                        "$eq": [
                            { "$trim": { "input": { "$toLower": "$Nombre" }}},  # Trim and lowercase the field in MongoDB
                            normalized_barrio  # Compare to normalized neighborhood name
                        ]
                    }
                },
                {"_id": 0}  # Exclude _id from the results
            )
            
            # If neighborhood is found, convert the coordinates and return the data
            if neighborhood:
                neighborhood['Geometry']['coordinates'] = convert_utm_to_wgs84(neighborhood['Geometry']['coordinates'])
                return neighborhood
            else:
                return None
        
        except Exception as e:
            logging.error(f"Error fetching neighborhood: {str(e)}")
            raise e
        
    def get_neighborhoods_by_renta_service(self, renta):
        barrios_similares = self.demographics_collection.find({
            "$expr": {
                "$and": [
                    {"$gte": [{"$toDouble": {"$replaceAll": {"input": "$Renta", "find": ",", "replacement": "."}}}, renta * 0.95]},
                    {"$lte": [{"$toDouble": {"$replaceAll": {"input": "$Renta", "find": ",", "replacement": "."}}}, renta * 1.05]}
                ]
            }
        }, {"Nombre": 1, "Renta": 1})

        # Convert the cursor into a list and convert ObjectId to string
        barrios_similares_list = []
        for barrio in barrios_similares:
            barrio["_id"] = str(barrio["_id"])  # Convert ObjectId to string
            barrios_similares_list.append(barrio)

        return barrios_similares_list

