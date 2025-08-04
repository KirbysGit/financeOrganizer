import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import Dashboard from './components/4Dashboard/Dashboard';
import WelcomeScreen from './components/1WelcomePage/WelcomeScreen';
import AccountSetUpScreen from './components/2AccountSetUp/AccountSetUpScreen';
import FinanceConnect from './components/3FinanceConnect/FinanceConnect';
import styled from 'styled-components';
import { logoutUser } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState(null); // State 2 Track Current Page.
  const [hasEverHadData, setHasEverHadData] = useState(localStorage.getItem('hasEverHadData') === 'true');   // State 2 Track If User Has Ever Had Data.
  const [hasConnectedData, setHasConnectedData] = useState(localStorage.getItem('hasConnectedData') === 'true');   // State 2 Track If User Has Connected Financial Data.
  const [isAuthenticated, setIsAuthenticated] = useState(false);   // State 2 Track If User Is Already Authenticated.
  const [isInitializing, setIsInitializing] = useState(true);   // State 2 Track If App Is Initializing.
  const [modalType, setModalType] = useState('signup');   // State 2 Track Modal Type.

  // Check Authentication Status On App Load.
  useEffect(() => {
    const initializeApp = async () => {
    const user = localStorage.getItem('user');
    
      if (user) {
      setIsAuthenticated(true);
      console.log('App: User is authenticated, checking for existing data...');
      
      // Clear any problematic localStorage items for new users
      const clearProblematicStorage = () => {
        // If this is a new user (just signed up), clear any old data flags
        const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true';
        const hasConnectedData = localStorage.getItem('hasConnectedData') === 'true';
        const hasPlaidToken = localStorage.getItem('plaid_access_token');
        
        console.log('App: Checking localStorage for authenticated user:', { hasEverHadData, hasConnectedData, hasPlaidToken });
        
        // For new users, we should clear any old data flags that might be leftover
        // This ensures they go through the proper flow
        if (hasEverHadData || hasConnectedData || hasPlaidToken) {
          console.log('App: User has data flags, will verify with API calls...');
        }
      };
      
      clearProblematicStorage();
      
      // Check For Existing Data And Determine Navigation.
        const hasExistingData = await checkForExistingData();
        
        // Check if this is a page refresh (user wants to go back to FinanceConnect)
        const isPageRefresh = !sessionStorage.getItem('hasNavigatedFromFinanceConnect');
        
        console.log('App: Navigation decision:', { hasExistingData, isPageRefresh });
        
        if (hasExistingData && !isPageRefresh) {
        // User Has Connected Data, Go To Dashboard.
        console.log('App: User has existing data, navigating to dashboard...');
        setCurrentPage('dashboard');
      } else {
        // User Is Authenticated But No Data OR User Refreshed Page, Go To Finance Connect.
        console.log('App: User has no existing data or refreshed page, navigating to finance connect...');
        setCurrentPage('finance-connect');
        }
      } else {
        // No User Found, Go To Welcome.
        console.log('App: No user found, navigating to welcome...');
        setCurrentPage('welcome');
      }
      
      // Mark Initialization As Complete.
      setIsInitializing(false);
    };
    
    initializeApp();
  }, [hasEverHadData, hasConnectedData]);

  // Update 'hasEverHadData' And 'hasConnectedData' When They Change.
  useEffect(() => {
    const handleStorageChange = () => {
      setHasEverHadData(localStorage.getItem('hasEverHadData') === 'true');
      setHasConnectedData(localStorage.getItem('hasConnectedData') === 'true');
    };

    // Listen For Changes To LocalStorage.
    window.addEventListener('storage', handleStorageChange);
    
    // Also Check On Mount.
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // -------------------------------------------------------- Navigation Handlers.

  // Check If User Already Has Connected Data.
  const checkForExistingData = async () => {
    try {
      console.log('App: Checking for existing data...');
      // First check localStorage for quick indicators
      const hasTransactions = localStorage.getItem('hasTransactions') === 'true';
      const hasFiles = localStorage.getItem('hasFiles') === 'true';
      const hasAccounts = localStorage.getItem('hasAccounts') === 'true';
      const hasConnectedData = localStorage.getItem('hasConnectedData') === 'true';
      const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true';
      
      console.log('App: localStorage indicators:', { hasTransactions, hasFiles, hasAccounts, hasConnectedData, hasEverHadData });
      
      // If localStorage indicates we have data, verify with API calls
      if (hasConnectedData || hasTransactions || hasFiles || hasAccounts) {
        console.log('App: localStorage indicates data exists, verifying with API calls...');
        // Make API calls to verify data actually exists
        try {
          // Import API module more reliably
          const apiModule = await import('./services/api');
          
          // Check for transactions
          const transactionsResponse = await apiModule.fetchTransactions();
          const hasActualTransactions = transactionsResponse.data && transactionsResponse.data.length > 0;
          
          // Check for accounts
          const accountsResponse = await apiModule.getAccounts();
          const hasActualAccounts = accountsResponse.data && accountsResponse.data.length > 0;
          
          // Check for files
          const filesResponse = await apiModule.getFiles();
          const hasActualFiles = filesResponse.data && filesResponse.data.length > 0;
          
          console.log('App: API verification results:', { hasActualTransactions, hasActualAccounts, hasActualFiles });
          
          // If any of these have data, user has connected data
          if (hasActualTransactions || hasActualAccounts || hasActualFiles) {
            console.log('App: API confirms user has data, setting flags...');
            localStorage.setItem('hasConnectedData', 'true');
            localStorage.setItem('hasEverHadData', 'true');
            setHasConnectedData(true);
            setHasEverHadData(true);
            return true;
          } else {
            console.log('App: API shows no data, clearing localStorage flags...');
            // localStorage was wrong, clear it
            localStorage.removeItem('hasConnectedData');
            localStorage.removeItem('hasTransactions');
            localStorage.removeItem('hasFiles');
            localStorage.removeItem('hasAccounts');
            localStorage.removeItem('hasEverHadData');
            setHasConnectedData(false);
            setHasEverHadData(false);
            return false;
          }
        } catch (apiError) {
          console.error('Error checking data via API:', apiError);
          // If API calls fail, fall back to localStorage but be conservative
          return hasConnectedData || hasTransactions || hasFiles || hasAccounts;
        }
      }
      
      // Also check if user has a plaid access token (indicates they've connected a bank)
      const hasPlaidToken = localStorage.getItem('plaid_access_token');
      console.log('App: Checking for Plaid token:', hasPlaidToken);
      if (hasPlaidToken) {
        console.log('App: User has Plaid token, double-checking with API calls...');
        try {
          // Import API module more reliably
          const apiModule = await import('./services/api');
          
          // Double-check with API calls
          const transactionsResponse = await apiModule.fetchTransactions();
          const accountsResponse = await apiModule.getAccounts();
          const filesResponse = await apiModule.getFiles();
          
          const hasActualData = (transactionsResponse.data && transactionsResponse.data.length > 0) ||
                               (accountsResponse.data && accountsResponse.data.length > 0) ||
                               (filesResponse.data && filesResponse.data.length > 0);
          
          console.log('App: Plaid verification results:', { hasActualData });
          
          if (hasActualData) {
            localStorage.setItem('hasConnectedData', 'true');
            setHasConnectedData(true);
            return true;
          } else {
            // Clear the incorrect hasEverHadData flag
            console.log('App: Clearing incorrect hasEverHadData flag...');
            localStorage.removeItem('hasEverHadData');
            setHasEverHadData(false);
            return false;
          }
        } catch (apiError) {
          console.error('Error verifying Plaid data via API:', apiError);
          // If API fails, be conservative and assume they have data
          return true;
        }
      }
      
      // If user has ever had data but no current data flags, they should still go to dashboard
      // This handles the case where localStorage was partially cleared
      if (hasEverHadData) {
        console.log('App: hasEverHadData is true, double-checking with API calls...');
        // Double-check with API calls
        try {
          const apiModule = await import('./services/api');
          
          const transactionsResponse = await apiModule.fetchTransactions();
          const accountsResponse = await apiModule.getAccounts();
          const filesResponse = await apiModule.getFiles();
          
          const hasActualData = (transactionsResponse.data && transactionsResponse.data.length > 0) ||
                               (accountsResponse.data && accountsResponse.data.length > 0) ||
                               (filesResponse.data && filesResponse.data.length > 0);
          
          console.log('App: Double-check results:', { hasActualData });
          
          if (hasActualData) {
            localStorage.setItem('hasConnectedData', 'true');
            setHasConnectedData(true);
            return true;
          } else {
            // Clear the incorrect hasEverHadData flag
            console.log('App: Clearing incorrect hasEverHadData flag...');
            localStorage.removeItem('hasEverHadData');
            setHasEverHadData(false);
            return false;
          }
        } catch (apiError) {
          console.error('Error verifying hasEverHadData via API:', apiError);
          // If API fails, be conservative and assume they have data
          return true;
        }
      }
      
      console.log('App: No existing data found');
      return false;
    } catch (error) {
      console.error('Error checking for existing data:', error);
      return false;
    }
  };

  // Sets Current Page To 'account-setup'.
  const handleShowAccountSetUp = (modalType) => {
    setCurrentPage('account-setup');
    setModalType(modalType);
  };

  // Sets Current Page To 'welcome' Or 'account-setup' Based On Authentication.
  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  // Sets 'hasEverHadData' To True And Sets Current Page To 'finance-connect'.
  const handleSignUpSuccess = async () => {
    console.log('App: Sign up successful, checking for existing data...');
    
    // For new signups, clear any old localStorage data to ensure proper flow
    console.log('App: Clearing localStorage for new signup...');
    localStorage.removeItem('hasEverHadData');
    localStorage.removeItem('hasConnectedData');
    localStorage.removeItem('hasTransactions');
    localStorage.removeItem('hasFiles');
    localStorage.removeItem('hasAccounts');
    localStorage.removeItem('plaid_access_token');
    setHasEverHadData(false);
    setHasConnectedData(false);
    
    // Check if user already has connected data
    const hasExistingData = await checkForExistingData();
    
    if (hasExistingData) {
      console.log('App: User has existing data, navigating to dashboard...');
      setCurrentPage('dashboard');
    } else {
      console.log('App: No existing data, navigating to finance connect...');
      setCurrentPage('finance-connect');
    }
  };

  // Sets 'hasEverHadData' To True And Sets Current Page To 'finance-connect'.
  const handleLoginSuccess = async () => {
    console.log('App: Login successful, checking for existing data...');
    
    // For logins, clear any old localStorage data to ensure proper flow
    console.log('App: Clearing localStorage for login...');
    localStorage.removeItem('hasEverHadData');
    localStorage.removeItem('hasConnectedData');
    localStorage.removeItem('hasTransactions');
    localStorage.removeItem('hasFiles');
    localStorage.removeItem('hasAccounts');
    localStorage.removeItem('plaid_access_token');
    setHasEverHadData(false);
    setHasConnectedData(false);
    
    // Check if user already has connected data
    const hasExistingData = await checkForExistingData();
    
    if (hasExistingData) {
      console.log('App: User has existing data, navigating to dashboard...');
      setCurrentPage('dashboard');
    } else {
      console.log('App: No existing data, navigating to finance connect...');
      setCurrentPage('finance-connect');
    }
  };

  // Sets Current Page To 'finance-connect' to add data first.
  const handleGetStarted = () => {
    console.log('App: Get started clicked, navigating to finance connect...');
    setCurrentPage('finance-connect');
  };

  // Handle Finance Connection Completion.
  const handleFinanceConnectComplete = (hasActualData = false) => {
    console.log('App: Finance connection completed, navigating to dashboard...');
    
    if (hasActualData) {
      // User actually connected data
      localStorage.setItem('hasConnectedData', 'true');
      localStorage.setItem('hasEverHadData', 'true'); // User now has data
      localStorage.setItem('hasTransactions', 'true'); // Assume transactions will be loaded
      localStorage.setItem('hasFiles', 'true'); // Assume files will be uploaded
      localStorage.setItem('hasAccounts', 'true'); // Assume accounts will be connected
      setHasConnectedData(true);
      setHasEverHadData(true); // User now has data
    } else {
      // User skipped - don't set any data flags
      console.log('App: User skipped setup, not setting data flags');
    }
    
    sessionStorage.setItem('hasNavigatedFromFinanceConnect', 'true'); // Mark that user has navigated from FinanceConnect
    setCurrentPage('dashboard');
  };

  // -------------------------------------------------------- Handle Logout.
  const handleLogout = async () => {
    try {
      // Call Backend Logout Endpoint To Clear Cookies.
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear Local Storage.
    localStorage.removeItem('user');
    localStorage.removeItem('hasConnectedData');
    localStorage.removeItem('hasEverHadData');
    localStorage.removeItem('hasTransactions');
    localStorage.removeItem('hasFiles');
    localStorage.removeItem('hasAccounts');
    sessionStorage.removeItem('hasNavigatedFromFinanceConnect'); // Clear session flag
    setIsAuthenticated(false);
    setHasConnectedData(false);
    setHasEverHadData(false);
    setCurrentPage('welcome');
  };

  // -------------------------------------------------------- Return Loading Screen While Initializing.
  // Show Loading Screen While Initializing.
  if (isInitializing || currentPage === null) {
    return (
      <RootWrapper>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, rgb(231, 240, 250) 0%, #e9ecef 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Loading...
            </div>
          </div>
        </div>
      </RootWrapper>
    );
  }

  // -------------------------------------------------------- Return App.
  return (
    <RootWrapper>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(255, 255, 255)',
            color: 'var(--text-primary)',
            border: '2px solid rgba(100, 100, 100, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            fontSize: '0.9rem',
            fontWeight: '500',
            padding: '1rem 1.5rem',
          },
          success: {
            iconTheme: {
              primary: 'var(--amount-positive)',
              secondary: 'white',
            },
            style: {
              border: '2px solid var(--amount-positive)',
              background: 'rgb(255, 255, 255)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--amount-negative)',
              secondary: 'white',
            },
            style: {
              border: '2px solid var(--amount-negative)',
              background: 'rgb(255, 255, 255)',
            },
          },
        }}
      />
      
      {/* Welcome Screen */}
      {currentPage === 'welcome' && (
        <WelcomeScreen onShowAccountSetUp={handleShowAccountSetUp} />
      )}
      
      {/* Account Setup Screen */}
      {currentPage === 'account-setup' && (
        <AccountSetUpScreen 
          onBack={handleBackToWelcome}
          onSignUpSuccess={handleSignUpSuccess}
          onLoginSuccess={handleLoginSuccess}
          modalType={modalType}
        />
      )}
      
      {/* Finance Connect Screen */}
      {currentPage === 'finance-connect' && (
        <FinanceConnect 
          onBack={handleBackToWelcome}
          onComplete={handleFinanceConnectComplete}
          user={JSON.parse(localStorage.getItem('user') || '{}')}
        />
      )}
      
      {/* Dashboard */}
      {currentPage === 'dashboard' && (
        <Dashboard 
          hasEverHadData={hasEverHadData} 
          setHasEverHadData={setHasEverHadData}
          hasConnectedData={hasConnectedData}
          setHasConnectedData={setHasConnectedData}
          onLogout={handleLogout}
        />
      )}
    </RootWrapper>
  );
}

// -------------------------------------------------------- Root Wrapper.
const RootWrapper = styled.div`
  padding: 0;
  margin: 0;
`

// Return App.
export default App;
