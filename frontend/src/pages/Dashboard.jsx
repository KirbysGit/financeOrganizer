import React, { useState, useEffect } from 'react';

import FileUpload from '../components/FileUpload';
import TransactionTable from '../components/TransactionTable';
import { fetchTransactions } from '../services/api';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);

    const loadTransactions = async () => {
        try {
            const res = await fetchTransactions();
            setTransactions(res.data);
        } catch (err) {
            console.error('Fetch Failed:', err);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    return (
        <div>
            <h1> Expense Tracker </h1>
            <FileUpload onUploadSuccess={loadTransactions} />
            <TransactionTable transactions={transactions} />
        </div>
    )
}

export default Dashboard;