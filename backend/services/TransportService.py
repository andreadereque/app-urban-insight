from flask import jsonify
import re
import logging
from numpy import histogram
import math
from collections import Counter

class TransportService:
    def __init__(self, mongo):
        self.transport_collection = mongo.db['transport']

    def get_transport_data(self):
        transport_data = list(self.transport_collection.find({}, {'_id': 0}))
        return jsonify(transport_data)