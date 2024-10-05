import axios from 'axios';

export const fetchRestaurants = () => {
  return axios.get('http://127.0.0.1:5000/restaurants');
};

export const fetchNeighborhoods = () => {
  return axios.get('http://127.0.0.1:5000/api/demographics');
};