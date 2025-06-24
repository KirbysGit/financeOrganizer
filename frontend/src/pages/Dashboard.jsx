// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb } from '@fortawesome/free-solid-svg-icons';

// Components.
import FileList from '../components/FileList';
import AccountList  from '../components/Accounts/AccountList';
import StatsSection from '../components/StatsSection';
import SpendingGrid from '../components/RecentData/SpendingGrid';
import WelcomeScreen from '../components/LandingPage/WelcomeScreen';
import TransactionTable from '../components/TransactionTable';
import StrengthIndicator from '../components/CentiScore/StrengthIndicator';

// API.
import { uploadCSV } from '../services/api';
import { getStats } from '../services/api';         
import { getAccounts } from '../services/api';
import { emptyDatabase } from '../services/api';
import { deleteFile, renameFile, getFiles } from '../services/api';
import { fetchTransactions, deleteTransaction } from '../services/api';

// Dashboard Component.
const Dashboard = () => {

    const [loading, setLoading] = useState(true);               // State 4 Loading State.
    const [stats, setStats] = useState({});                     // State 4 Stats Data.
    const [files, setFiles] = useState([]);                     // State 4 Storing All Files.
    const [accounts, setAccounts] = useState([]);               // State 4 Storing All Accounts.
    const [transactions, setTransactions] = useState([]);       // State 4 Storing All Transactions.

    // State 4 If User Has Ever Had Data. (e.g. Welcome Screen Or Dashboard).
    const [hasEverHadData, setHasEverHadData] = useState(localStorage.getItem('hasEverHadData') === 'true'); 

    // Track Loading To Prevent Duplicate Calls.
    const hasLoadedRef = useRef(false);
    const isLoadingRef = useRef(false);

    // -------------------------------------------------------- On Site Mount, Load All Data.
    useEffect(() => {
        if (hasEverHadData && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadAllData();
        }
    }, [hasEverHadData]);

    // -------------------------------------------------------- Load All Data.
    const loadAllData = async () => {
        // Guard Against Double Loading.
        if (isLoadingRef.current) {
            console.log('Already loading data, skipping duplicate request');
            return;
        }
        // Set Loading To True.
        isLoadingRef.current = true;
        setLoading(true);

        // Try To Load All Data.
        try {
            await Promise.all([
                loadTransactions(),
                loadFiles(),
                loadStats(),
                loadAccounts()
            ]);
        } catch (err) {
            // Display Error To Console.
            console.error('Failed to load data:', err);
        } finally {
            // Set Loading To False.
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

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
                setHasEverHadData(true);
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
                setHasEverHadData(true);
            }
        } catch (err) {                                 // If Error.
            console.error('Fetched Failed: ', err);         // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Load Accounts To Site.
    const loadAccounts = async () => {
        try {
            const res = await getAccounts();
            setAccounts(res.data);
        } catch (err) {
            console.error('Accounts Fetch Failed:', err);
        }
    }

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
            await loadAllData();                            // Load All Data.
        } catch (err) {                                 // If Error.
            console.error('Load Failed:', err);             // Display Error To Console.
        }
    };
    
    // -------------------------------------------------------- Clears Entire Database.
    const clearDB = async () => {
        try {                                           // Try.
            await emptyDatabase();                          // API Request For Clearing Database.
            localStorage.setItem('hasEverHadData', 'false');
            setHasEverHadData(false);
            hasLoadedRef.current = false; // Reset the ref so data can be loaded again if needed
            // Don't reload data here - let the component handle it
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

    // -------------------------------------------------------- Uploads CSV To Site.
    const handleUploadCSV = async(formData) => {
        try {
            await uploadCSV(formData);
        } catch (err) {
            console.error("Upload Failed:", err);
        }
    }

    // UI Component.
    return (
        <ExpenseContainer>
            { !hasEverHadData && (
                <WelcomeScreen onSuccess={refreshSite} />
            )}
            { hasEverHadData && !loading && (
                <>
                    {/* Development Bomb Button - Remove in production */}
                    <DevBombButton 
                        onClick={clearDB} 
                        aria-label="Clear All Data (Development)"
                        title="Clear All Files & Corresponding Transactions (Development Only)"
                    >
                        <FontAwesomeIcon icon={faBomb} />
                    </DevBombButton>
                    
                    <StatsSection 
                        myStats={stats}
                    />
                    <SpendingGrid 
                        id="recent-section"
                        myTransactions={transactions}
                    />
                    <StrengthIndicator 
                        myStats={stats} 
                    />
                    <AccountList 
                        id="accounts-section"
                        myStats={stats}
                        myAccounts={accounts}
                        onUpload={handleUploadCSV}
                    />
                    {/*<FileList 
                        files={files} 
                        onDelete={handleDeleteFile} 
                        onRename={handleRename}
                    />*/}
                    <TransactionTable 
                        id="transactions-section"
                        transactions={transactions} 
                        onDelete={handleDeleteTransaction}
                    />
                </>
            )}
            { hasEverHadData && loading && (
                <div>Loading...</div>
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
    position: relative;
`

// -------------------------------------------------------- Development Bomb Button.
const DevBombButton = styled.button`
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    background: linear-gradient(135deg, #ff283a, #ff1a1a);
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 40, 58, 0.4);
    z-index: 1000;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(255, 40, 58, 0.6);
        background: linear-gradient(135deg, #ff1a1a, #cc0000);
    }

    &:active {
        transform: scale(0.95);
    }

    &::before {
        content: 'DEV';
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff6b35;
        color: white;
        font-size: 0.6rem;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
        border: 2px solid white;
    }
`;

export default Dashboard;