import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000', });

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

// ================================================================= PLAID INTEGRATION
// ----------------------------------------------------------------- Create Link Token for Plaid Link
export const createLinkToken = (userId) => API.post('/plaid/create_link_token', { user_id: userId });

// ----------------------------------------------------------------- Exchange Public Token for Access Token
export const exchangePublicToken = (publicToken) => API.post('/plaid/exchange_public_token', { public_token: publicToken });

// ----------------------------------------------------------------- Fetch Transactions from Plaid
export const fetchPlaidTransactions = (accessToken) => API.post(`/plaid/fetch_transactions/${accessToken}`);

// ----------------------------------------------------------------- Get Account Information from Plaid
export const getPlaidAccounts = (accessToken) => API.get(`/plaid/accounts/${accessToken}`);