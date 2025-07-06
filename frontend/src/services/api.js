// Imports.
import axios from 'axios';

// Create API Instance.
const API = axios.create({ baseURL: 'http://localhost:8000' });

// -------------------------------------------------------- Request Interceptor To Include Auth Token.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -------------------------------------------------------- Response Interceptor To Handle Auth Errors.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token Expired Or Invalid - Redirect To Login.
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirect To Landing Page.
    }
    return Promise.reject(error);
  }
);

// ================================================================= FILE OPERATIONS
// ----------------------------------------------------------------- Upload CSV File.
export const uploadCSV = (formData) => API.post('/upload', formData, { headers: { 'Content-Type' : 'multipart/form-data'} });

// ----------------------------------------------------------------- Get All Files.
export const getFiles = () => API.get('/files');

// ----------------------------------------------------------------- Get Transactions From Specific File.
export const getFileTransactions = (fileId) => API.get(`/files/${fileId}/transactions`);

// ----------------------------------------------------------------- Delete File By File Id.
export const deleteFile = (fileId) => API.delete(`/files/${fileId}`);

// ----------------------------------------------------------------- Rename File By File Id.
export const renameFile = (fileId, newName) => API.patch(`/files/${fileId}`, { new_name: newName });

// ================================================================= TRANSACTION OPERATIONS
// ----------------------------------------------------------------- Fetches All Transactions In DB.
export const fetchTransactions = () => API.get('/transactions');

// ----------------------------------------------------------------- Fetches Detailed Transactions With Account Info.
export const fetchDetailedTransactions = () => API.get('/transactions/detailed');

// ----------------------------------------------------------------- Manually Create Transaction.
export const createTransaction = (data) => API.post('/transactions/', data);

// ----------------------------------------------------------------- Delete Transaction By ID.
export const deleteTransaction = (transactionId) => API.delete(`/transactions/${transactionId}`);

// ================================================================= ACCOUNT OPERATIONS
// ----------------------------------------------------------------- Get All Connected Accounts.
export const getAccounts = () => API.get('/accounts');

// ================================================================= STATISTICS & ANALYTICS
// ----------------------------------------------------------------- Get Overview Statistics.
export const getStats = () => API.get('/stats');

// ================================================================= DATABASE OPERATIONS
// ----------------------------------------------------------------- Empties Entire Database.
export const emptyDatabase = () => API.delete('/clear');

// ================================================================= USER AUTHENTICATION
// ----------------------------------------------------------------- Register New User
export const registerUser = (userData) => API.post('/auth/register', userData);

// ----------------------------------------------------------------- Login User
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// ----------------------------------------------------------------- Google Authentication
export const googleAuth = (googleData) => API.post('/auth/google', googleData);

// ----------------------------------------------------------------- Google Auth Code Authentication
export const googleAuthCode = (authData) => API.post('/auth/google-code', authData);

// ----------------------------------------------------------------- Get Current User
export const getCurrentUser = () => API.get('/auth/me');

// ================================================================= PLAID INTEGRATION
// ----------------------------------------------------------------- Create Link Token for Plaid Link
export const createLinkToken = (userId) => API.post('/plaid/create_link_token', { user_id: userId });

// ----------------------------------------------------------------- Exchange Public Token for Access Token
export const exchangePublicToken = (publicToken) => API.post('/plaid/exchange_public_token', { public_token: publicToken });

// ----------------------------------------------------------------- Fetch Transactions from Plaid
export const fetchPlaidTransactions = (accessToken) => API.post(`/plaid/fetch_transactions/${accessToken}`);

// ----------------------------------------------------------------- Get Account Information from Plaid
export const getPlaidAccounts = (accessToken) => API.get(`/plaid/accounts/${accessToken}`);