from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter

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