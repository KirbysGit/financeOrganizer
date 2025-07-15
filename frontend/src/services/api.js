// Imports.
import axios from 'axios';

// Create API Instance.
const API = axios.create({ 
  baseURL: 'http://localhost:8000',
  withCredentials: true  // Important: This allows cookies to be sent with requests
});

// -------------------------------------------------------- Response Interceptor To Handle Auth Errors.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh the token
      try {
        await API.post('/auth/refresh');
        // Retry the original request
        return API.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/';
      }
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

// ================================================================= CENTI SCORE OPERATIONS
// ----------------------------------------------------------------- Get Current Centi Score
export const getCurrentCentiScore = () => API.get('/centi-score/current');

// ----------------------------------------------------------------- Get Centi Score Status
export const getCentiScoreStatus = () => API.get('/centi-score/status');

// ----------------------------------------------------------------- Get Centi Score History
export const getCentiScoreHistory = (limit = 12) => API.get(`/centi-score/history?limit=${limit}`);

// ----------------------------------------------------------------- Get Centi Score Growth Analysis
export const getCentiScoreGrowth = () => API.get('/centi-score/growth');

// ----------------------------------------------------------------- Get Centi Score Summary
export const getCentiScoreSummary = () => API.get('/centi-score/summary');

// ----------------------------------------------------------------- Calculate Weekly Centi Score
export const calculateWeeklyScore = () => API.post('/centi-score/calculate');

// ----------------------------------------------------------------- Get Centi Score Trend
export const getCentiScoreTrend = () => API.get('/centi-score/trend');

// ================================================================= DATABASE OPERATIONS
// ----------------------------------------------------------------- Empties Entire Database.
export const emptyDatabase = () => API.delete('/clear');

// ================================================================= USER AUTHENTICATION
// ----------------------------------------------------------------- Register New User
export const registerUser = (userData) => API.post('/auth/register', userData);

// ----------------------------------------------------------------- Login User
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// ----------------------------------------------------------------- Google Auth Code Authentication
export const googleAuthCode = (authData) => API.post('/auth/google-code', authData);

// ----------------------------------------------------------------- Get Current User
export const getCurrentUser = () => API.get('/auth/me');

// ----------------------------------------------------------------- Logout User
export const logoutUser = () => API.post('/auth/logout');

// ----------------------------------------------------------------- Refresh Token
export const refreshToken = () => API.post('/auth/refresh');

// ================================================================= PLAID INTEGRATION
// ----------------------------------------------------------------- Create Link Token for Plaid Link
export const createLinkToken = (userId) => API.post('/plaid/create_link_token', { user_id: userId });

// ----------------------------------------------------------------- Exchange Public Token for Access Token
export const exchangePublicToken = (publicToken) => API.post('/plaid/exchange_public_token', { public_token: publicToken });

// ----------------------------------------------------------------- Fetch Transactions from Plaid
export const fetchPlaidTransactions = (accessToken) => API.post(`/plaid/fetch_transactions/${accessToken}`);

// ----------------------------------------------------------------- Get Account Information from Plaid
export const getPlaidAccounts = (accessToken) => API.get(`/plaid/accounts/${accessToken}`);