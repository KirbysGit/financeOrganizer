// Imports.
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { styled, keyframes } from 'styled-components';
import { faBomb, faUser, faChartLine, faPalette, faDatabase, faSync, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components.
import NavBar from './0NavBar/NavBar';
import FileList from '../FileList';
import StatsSection from './1Header/StatsSection';
import AccountList  from './4Accounts/AccountList';
import SpendingGrid from './2RecentData/SpendingGrid';
import TransactionTable from './5Transactions/TransactionTable';
import StrengthIndicator from './3CentiScore/StrengthIndicator';
import LoadingScreen from './00LoadingScreen/LoadingScreen';
import Footer from './6Footer/Footer';
import MiniSidebar from './7MiniSidebar/MiniSidebar';

// API.
import { uploadCSV } from '../../services/api';
import { getStats } from '../../services/api';         
import { getAccounts } from '../../services/api';
import { emptyDatabase } from '../../services/api';
import { deleteFile, renameFile, getFiles } from '../../services/api';
import { fetchTransactions, deleteTransaction } from '../../services/api';
import { 
    getCurrentCentiScore, 
    getCentiScoreHistory, 
    getCentiScoreGrowth, 
    getCentiScoreTrend 
} from '../../services/api';

// Loading Steps Configuration.
const LOADING_STEPS = [
    { icon: faUser, message: "Grabbing your data...", duration: 600 },
    { icon: faDatabase, message: "Connecting to accounts...", duration: 600 },
    { icon: faSync, message: "Syncing transactions...", duration: 600 },
    { icon: faChartLine, message: "Calculating insights...", duration: 600 },
    { icon: faPalette, message: "Making it beautiful...", duration: 600 },
];

// Animation keyframes
const slideDown = keyframes`
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

// Dashboard Component.
const Dashboard = ({ hasEverHadData, setHasEverHadData, hasConnectedData, setHasConnectedData, onLogout }) => {

    const [loading, setLoading] = useState(true);               // State 4 Loading State.
    const [stats, setStats] = useState({});                     // State 4 Stats Data.
    const [files, setFiles] = useState([]);                     // State 4 Storing All Files.
    const [accounts, setAccounts] = useState([]);               // State 4 Storing All Accounts.
    const [transactions, setTransactions] = useState([]);       // State 4 Storing All Transactions.
    const [centiScore, setCentiScore] = useState({});          // State 4 Storing Centi Score.
    const [centiScoreHistory, setCentiScoreHistory] = useState([]); // State 4 Storing Centi Score History.
    const [centiScoreGrowth, setCentiScoreGrowth] = useState({}); // State 4 Storing Centi Score Growth.
    const [centiScoreTrend, setCentiScoreTrend] = useState({}); // State 4 Storing Centi Score Trend.
    const [loadingStep, setLoadingStep] = useState(0);         // State 4 Loading Step.
    const [loadingProgress, setLoadingProgress] = useState(0); // State 4 Loading Progress.
    const [isTransitioning, setIsTransitioning] = useState(false); // State 4 Transition Animation.
    const [showDashboard, setShowDashboard] = useState(false); // State 4 Dashboard Animation.

    // Track Loading To Prevent Duplicate Calls.
    const hasLoadedRef = useRef(false);
    const isLoadingRef = useRef(false);

    // -------------------------------------------------------- Loading Animation Effect.
    useEffect(() => {
        if (loading) {
            // Reset Loading State.
            setLoadingStep(0);
            setLoadingProgress(0);
            setIsTransitioning(false);
            setShowDashboard(false);
            
            // Fixed 3-Second Loading Time.
            const loadingTime = 3000;
            let currentTime = 0;
            let currentStep = 0;
            
            const interval = setInterval(() => {
                currentTime += 100;
                const progress = Math.min(currentTime / loadingTime, 1);
                setLoadingProgress(progress);
                
                // Calculate current step based on progress
                const stepDuration = loadingTime / LOADING_STEPS.length;
                const newStep = Math.min(Math.floor(currentTime / stepDuration), LOADING_STEPS.length - 1);
                
                if (newStep !== currentStep) {
                    currentStep = newStep;
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setLoadingStep(newStep);
                        setIsTransitioning(false);
                    }, 250);
                }
                
                if (progress >= 1) {
                    clearInterval(interval);
                }
            }, 100);
            
            return () => clearInterval(interval);
        }
    }, [loading]);

    // -------------------------------------------------------- Show Dashboard Animation After Loading.
    useEffect(() => {
        if (!loading) {
            // Small delay to ensure loading screen is fully hidden
            const timer = setTimeout(() => {
                setShowDashboard(true);
            }, 25);
            
            return () => clearTimeout(timer);
        }
    }, [loading]);

    // -------------------------------------------------------- On Site Mount, Load All Data.
    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadAllData();
        }
    }, []);

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

        // Start the loading process
        const loadingPromise = Promise.all([
            loadTransactions(),
            loadFiles(),
            loadStats(),
            loadAccounts(),
            loadCentiScore(),
            loadCentiScoreHistory(),
            loadCentiScoreGrowth(),
            loadCentiScoreTrend()
        ]);

        // Fixed 3-second loading time
        const loadingTime = 3000;

        try {
            // Wait for both the data loading and fixed time
            await Promise.all([
                loadingPromise,
                new Promise(resolve => setTimeout(resolve, loadingTime))
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
        try {
            const transactionsData = await fetchTransactions();
            setTransactions(transactionsData.data);
            // Set localStorage flag if we have transactions
            if (transactionsData.data.length > 0) {
                localStorage.setItem('hasTransactions', 'true');
            }
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Files To Site.
    const loadFiles = async () => {                 
        try {
            const filesData = await getFiles();
            setFiles(filesData.data);
            // Set localStorage flag if we have files
            if (filesData.data.length > 0) {
                localStorage.setItem('hasFiles', 'true');
            }
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Accounts To Site.
    const loadAccounts = async () => {
        try {
            const accountsData = await getAccounts();
            setAccounts(accountsData.data);
            // Set localStorage flag if we have accounts
            if (accountsData.data.length > 0) {
                localStorage.setItem('hasAccounts', 'true');
            }
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Stats To Site.
    const loadStats = async () => {
        try {                                           // Try.
            const statsData = await getStats();             // API Request For Fetch Stats.
            console.log('Dashboard: Stats API response:', statsData);
            setStats(statsData.data);                      // Set Stats To State.
        } catch (err) {                                 // If Error.
            console.error("Load Failed:", err);             // Display Error To Console.
        }
    };

    // -------------------------------------------------------- Load Centi Score To Site.
    const loadCentiScore = async () => {
        try {
            const centiScoreData = await getCurrentCentiScore();
            setCentiScore(centiScoreData.data);
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Centi Score History To Site.
    const loadCentiScoreHistory = async () => {
        try {
            const historyData = await getCentiScoreHistory();
            setCentiScoreHistory(historyData.data);
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Centi Score Growth To Site.
    const loadCentiScoreGrowth = async () => {
        try {
            const growthData = await getCentiScoreGrowth();
            setCentiScoreGrowth(growthData.data);
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Load Centi Score Trend To Site.
    const loadCentiScoreTrend = async () => {
        try {
            const trendData = await getCentiScoreTrend();
            setCentiScoreTrend(trendData.data);
        } catch (err) {
            console.error("Load Failed:", err);
        }
    };

    // -------------------------------------------------------- Refresh Site Data.
    const refreshSite = async() => {
        try {                                           // Try.
            await loadAllData();                            // Load All Data.
            
            // Only Update 'hasEverHadData' If It's Currently False And We Have Data.
            // This Prevents Overriding The State When A User Has Just Signed Up.
            if (!hasEverHadData && (transactions.length > 0 || files.length > 0)) {
                localStorage.setItem('hasEverHadData', 'true');
                setHasEverHadData(true);
            }
            
            // Update hasConnectedData if we have any data
            if ((transactions.length > 0 || files.length > 0 || accounts.length > 0) && !hasConnectedData) {
                localStorage.setItem('hasConnectedData', 'true');
                setHasConnectedData(true);
            }
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
            localStorage.setItem('hasConnectedData', 'false');
            setHasConnectedData(false);
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
            const result = await uploadCSV(formData);
            return result; // Return the result so AccountList can access it
        } catch (err) {
            console.error("Upload Failed:", err);
            throw err; // Re-throw so AccountList can handle the error
        }
    }

    // -------------------------------------------------------- Handle Logout.
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    // -------------------------------------------------------- Return JSX.
    return (
        <DashboardContainer>
            <ExpenseContainer>
            { !loading && (
                <>
                    {showDashboard && (
                        <AnimatedNavBar>
                            <NavBar onLogout={handleLogout} />
                        </AnimatedNavBar>
                    )}
                    
                    { showDashboard && (
                        <>
                            {/* Development Bomb Button - Remove In Production. */}
                            <DevBombButton 
                                onClick={clearDB} 
                                aria-label="Clear All Data (Development)"
                                title="Clear All Files & Corresponding Transactions (Development Only)"
                            >
                                <FontAwesomeIcon icon={faBomb} />
                            </DevBombButton>
                            
                            <DashboardContent>
                                <StatsSection 
                                    myStats={stats}
                                />
                                <SpendingGrid 
                                    id="recent-section"
                                    myTransactions={transactions}
                                />
                                <StrengthIndicator 
                                    id="centi-score-section"
                                    myStats={stats} 
                                    myCentiScore={centiScore}
                                    myCentiScoreHistory={centiScoreHistory}
                                    myCentiScoreGrowth={centiScoreGrowth}
                                    myCentiScoreTrend={centiScoreTrend}
                                />
                                <AccountList 
                                    id="accounts-section"
                                    myStats={stats}
                                    myAccounts={accounts}
                                    onRefresh={loadAccounts}
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
                                    onRefresh={loadTransactions}
                                    existingAccounts={accounts}
                                    onUpload={handleUploadCSV}
                                />
                            </DashboardContent>
                            
                            {/* Footer */}
                            <Footer />
                            
                            {/* Mini Sidebar */}
                            <MiniSidebar />
                        </>
                    )}
                </>
            )}
            { loading && (
                <LoadingScreen 
                    loading={loading}
                    loadingProgress={loadingProgress}
                    loadingStep={loadingStep}
                    isTransitioning={isTransitioning}
                />
            )}
        </ExpenseContainer>
        </DashboardContainer>
    )
}

// -------------------------------------------------------- Dashboard Container.
const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

// -------------------------------------------------------- Entire Expense Website Container.
const ExpenseContainer = styled.div`
    font-family: 'DM Sans', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg,rgb(231, 240, 250) 0%, #e9ecef 100%);
    min-height: 100vh;
    position: relative;
    flex: 1;
`;

// -------------------------------------------------------- Dashboard Content.
const DashboardContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px;
    animation: ${slideUp} 0.3s ease-out forwards;
`;

// -------------------------------------------------------- Animated NavBar.
const AnimatedNavBar = styled.div`
    width: 100%;
    z-index: 1000;
    animation: ${slideDown} 0.5s ease-out forwards;
`;

// -------------------------------------------------------- Development Bomb Button.
const DevBombButton = styled.button`
    position: fixed;
    bottom: 20px;
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