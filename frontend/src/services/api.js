// api.js

// This is the API file that is used to make the API calls to the backend. It contains the API instance, the base URL,
// and the refresh lock. It also contains the response interceptor to handle auth errors. This is the main frontend
// flow for API calls.

// Imports.
import axios from 'axios';

// Create API Instance.
const baseURL = import.meta.env.VITE_API_URL || 'https://financeorganizer-production.up.railway.app';

// Add A Refresh Lock To Prevent Multiple Simultaneous Refresh Attempts.
let isRefreshing = false;
let failedQueue = [];

// Process The Queue.
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create The API Instance.
const API = axios.create({ 
  baseURL: baseURL,
  withCredentials: true  // Important: This allows cookies to be sent with requests
});

// Response Interceptor To Handle Auth Errors.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only Handle 401 Errors For Protected Routes, Not Auth Endpoints.
    if (error.response?.status === 401 && !error.config._retry && !error.config.url?.includes('/auth/refresh')) {
      error.config._retry = true; // Mark This Request As Retried.
      
      // Don't Redirect For Auth Endpoints (Login/Signup) - Let Them Handle Their Own Errors.
      if (error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // If Already Refreshing, Queue This Request.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return API.request(error.config);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      
      try {
        // Try To Refresh The Token.
        await API.post('/auth/refresh');
        processQueue(null, null);
        // Retry The Original Request.
        return API.request(error.config);
      } catch (refreshError) {
        // Refresh Failed, Clear Any Stored Tokens And Redirect To Login.
        console.log('Session expired, redirecting to login');
        processQueue(refreshError, null);
        // Clear Any Stored Tokens/Cookies If Needed.
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Clear LocalStorage To Ensure Proper Logout.
        localStorage.removeItem('user');
        localStorage.removeItem('hasConnectedData');
        localStorage.removeItem('hasEverHadData');
        localStorage.removeItem('hasTransactions');
        localStorage.removeItem('hasFiles');
        localStorage.removeItem('hasAccounts');
        
        // Redirect To Welcome Screen.
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ================================================================= FILE OPERATIONS.
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

// ----------------------------------------------------------------- Bulk Delete Transactions.
export const bulkDeleteTransactions = (transactionIds) => API.delete('/transactions/bulk', {
    data: { transaction_ids: transactionIds }
});

// ================================================================= TAG OPERATIONS
// ----------------------------------------------------------------- Get All Tags
export const getTags = async () => {
    const response = await API.get('/tags');
    return response.data;
};

// ----------------------------------------------------------------- Create New Tag
export const createTag = async (tagData) => {
    const response = await API.post('/tags', tagData);
    return response.data;
};

// ----------------------------------------------------------------- Update Tag
export const updateTag = async (tagId, tagData) => {
    const response = await API.put(`/tags/${tagId}`, tagData);
    return response.data;
};

// ----------------------------------------------------------------- Delete Tag
export const deleteTag = async (tagId) => {
    const response = await API.delete(`/tags/${tagId}`);
    return response.data;
};

// ----------------------------------------------------------------- Add Tag to Transaction
export const addTagToTransaction = async (transactionId, tagId) => {
    const response = await API.post(`/transactions/${transactionId}/tags/${tagId}`);
    return response.data;
};

// ----------------------------------------------------------------- Remove Tag from Transaction
export const removeTagFromTransaction = async (transactionId, tagId) => {
    const response = await API.delete(`/transactions/${transactionId}/tags/${tagId}`);
    return response.data;
};

// ----------------------------------------------------------------- Get Transaction Tags
export const getTransactionTags = async (transactionId) => {
    const response = await API.get(`/transactions/${transactionId}/tags`);
    return response.data;
};

// ----------------------------------------------------------------- Get Tag Transaction Count
export const getTagTransactionCount = async (tagId) => {
    const response = await API.get(`/tags/${tagId}/transaction-count`);
    return response.data;
};

// ----------------------------------------------------------------- Initialize Default Tags
export const initializeDefaultTags = async () => {
    const response = await API.post('/tags/initialize');
    return response.data;
};

// ================================================================= ACCOUNT OPERATIONS
// ----------------------------------------------------------------- Get All Connected Accounts.
export const getAccounts = () => API.get('/accounts');

// ----------------------------------------------------------------- Get Enhanced Accounts with Growth Data.
export const getEnhancedAccounts = () => API.get('/accounts/enhanced');

// ----------------------------------------------------------------- Get Account Portfolio Analysis.
export const getAccountAnalysis = () => API.get('/accounts/analysis');

// ----------------------------------------------------------------- Create Account Balance Snapshot.
export const createAccountSnapshot = () => API.post('/accounts/snapshot');

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

// ----------------------------------------------------------------- Email Verification
export const verifyEmail = (token) => API.get(`/auth/verify-email?token=${token}`);

// ----------------------------------------------------------------- Resend Verification Email
export const resendVerificationEmail = (email) => API.post('/auth/resend-verification', { email });

// Password Reset Functions
export const sendPasswordResetEmail = (email) => API.post('/auth/forgot-password', { email });

export const verifyPasswordResetToken = (token) => API.get(`/auth/verify-reset-token?token=${token}`);

export const resetPassword = (resetData) => API.post('/auth/reset-password', resetData);

// Contact Form Functions
export const submitContactForm = (contactData) => API.post('/auth/contact', contactData);

// ================================================================= PLAID INTEGRATION
// ----------------------------------------------------------------- Create Link Token for Plaid Link
export const createLinkToken = (userId) => API.post('/plaid/create_link_token', { user_id: userId });

// ----------------------------------------------------------------- Exchange Public Token for Access Token
export const exchangePublicToken = (publicToken) => API.post('/plaid/exchange_public_token', { public_token: publicToken });

// ----------------------------------------------------------------- Fetch Transactions from Plaid
export const fetchPlaidTransactions = (accessToken) => API.post(`/plaid/fetch_transactions/${accessToken}`);

// ----------------------------------------------------------------- Get Account Information from Plaid
export const getPlaidAccounts = (accessToken) => API.get(`/plaid/accounts/${accessToken}`);

// ----------------------------------------------------------------- Check Plaid Status
export const checkPlaidStatus = () => API.get('/plaid/status');