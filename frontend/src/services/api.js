import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000',
});

export const uploadCSV = (formData) =>
    API.post('/upload', formData, {
        headers: { 'Content-Type' : 'multipart/form-data'}
    });

export const fetchTransactions = () => API.get('/transactions');