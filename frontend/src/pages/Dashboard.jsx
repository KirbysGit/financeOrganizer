// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useState, useEffect } from 'react';

// Components.
import FileList from '../components/FileList';
import AccountList  from '../components/AccountList';
import StatsSection from '../components/StatsSection';
import SpendingGrid from '../components/SpendingGrid';
import FilesActionsBar from '../components/ActionsBar';
import WelcomeScreen from '../components/WelcomeScreen';
import TransactionTable from '../components/TransactionTable';
import StrengthIndicator from '../components/StrengthIndicator';

// API.
import { emptyDatabase } from '../services/api';
import { getStats } from '../services/api';
import { deleteFile, renameFile, getFiles } from '../services/api';
import { fetchTransactions, deleteTransaction } from '../services/api';

// Dashboard Component.
const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);       // State 4 Storing All Transactions.
    const [files, setFiles] = useState([]);                     // State 4 Storing All Files.
    const [stats, setStats] = useState({});                     // State 4 Stats Data.

    const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true'; // Var 4 Storing If User Ever Loaded Site.

    // -------------------------------------------------------- On Site Mount, Load ALl Data.
    useEffect(() => {
        loadTransactions();
        loadFiles();
        loadStats();
    }, []);

    // -------------------------------------------------------- Load Transactions To Site.
    const loadTransactions = async () => {
        try {                                           // Try.
            const tx = await fetchTransactions();           // API Request For Fetch Transaction.   
            const sorted = tx.data.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            setTransactions(sorted);                       // Set Return Value For Transactions.

            if (sorted.length > 0) {
                localStorage.setItem('hasEverHadData', 'true');
            }
        } catch (err) {                                 // If Error.
            console.error('Fetch Failed:', err);            // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Load All Files To Site.
    const loadFiles = async () => {                 
        try {                                           // Try.
            const res = await getFiles();                   // API Request For Getting Files.
            setFiles(res.data);                             // Set Files From Result.

            if (res.data.length > 0) {
                localStorage.setItem('hasEverHadData', 'true');
            }
        } catch (err) {                                 // If Error.
            console.error('Fetched Failed: ', err);         // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Load Stats.
    const loadStats = async () => {
        try {
            const res = await getStats();
            setStats(res.data);
        } catch (err) {
            console.error('Stats Fetch Failed:', err);
        }
    };

    // -------------------------------------------------------- Refreshes Contents Of Site (Tx's & Files).
    const refreshSite = async() => {
        try {                                           // Try.
            loadTransactions();                             // Load All Transactions.
            loadFiles();                                    // Load All Files.
        } catch (err) {                                 // If Error.
            console.error('Load Failed:', err);             // Display Error To Console.
        }
    };
    
    // -------------------------------------------------------- Clears Entire Database.
    const clearDB = async () => {
        try {                                           // Try.
            await emptyDatabase();                          // API Request For Clearing Database.
            loadTransactions();                             // Reload Transactions.
            loadFiles();                                     // Reload Files.
            localStorage.setItem('hasEverHadData', 'false');
        } catch (err) {                                 // If Error.
            console.error('Delete Failed:', err);           // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Deletes Requested File.
    const handleDeleteFile = async(fileId) => {
        try {                                           // Try.
            await deleteFile(fileId);                       // API Request For Deleting File by 'fileId'.
            refreshSite();                                    // Reload Files.
        } catch (err) {                                 // If Error.
            console.error("Delete Failed:", err);           // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Deletes Requested Transaction.
    const handleDeleteTransaction = async(transactionId) => {
        try {                                           // Try.
            await deleteTransaction(transactionId);        // API Request For Deleting Transaction by 'txId'.
            refreshSite();                                  // Reload Transactions And Files.
        } catch (err) {                                 // If Error.
            console.error("Delete Failed:", err);           // Display Error To Console.
        }
    };
    
    // -------------------------------------------------------- Renames Requested File.
    const handleRename = async(fileId, newName) => {
        try {                                           // Try. 
            await renameFile(fileId, newName);              // API Request For Renaming File by 'fileId' W/ 'newName'.
            loadFiles();                                    // Reload Files.
        } catch (err) {                                 // If Error.
            console.error("Rename Failed:", err);           // Display Error To Console.
        }
    }

    // UI Component.
    return (
        <ExpenseContainer>
            { !hasEverHadData && (
                <WelcomeScreen onSuccess={refreshSite} />
            )}
            { hasEverHadData && (
                <>
                    <StatsSection />
                    <SpendingGrid />
                    <StrengthIndicator stats={stats} />
                    <AccountList />
                    <FilesActionsBar 
                        onClear={clearDB} 
                        onUploadSuccess={refreshSite}
                    />
                    {/*<FileList 
                        files={files} 
                        onDelete={handleDeleteFile} 
                        onRename={handleRename}
                    />*/}
                    <TransactionTable 
                        transactions={transactions} 
                        onDelete={handleDeleteTransaction}
                    />
                </>
            )}
        </ExpenseContainer>
    )
}
// -------------------------------------------------------- Entire Expense Website Container.
const ExpenseContainer = styled.div`
    font-family: 'DM Sans', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(135deg,rgb(231, 240, 250) 0%, #e9ecef 100%);
    min-height: 100vh;
`
// -------------------------------------------------------- Header Container.
const Header = styled.div`
    font-size: 2rem;
    width: 100%;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgb(0, 0, 0, 0.2);
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1.5rem;
    color: #343a40;
`

export default Dashboard;