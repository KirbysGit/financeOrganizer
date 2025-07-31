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
      
      // Check For Existing Data And Determine Navigation.
        const hasExistingData = await checkForExistingData();
        
        if (hasExistingData) {
        // User Has Connected Data, Go To Dashboard.
        setCurrentPage('dashboard');
      } else if (hasEverHadData) {
        // User Has Account But No Connected Data, Go To Finance Connect.
        setCurrentPage('finance-connect');
        } else {
          // User Is Authenticated But No Data, Go To Welcome.
          setCurrentPage('welcome');
        }
      } else {
        // No User Found, Go To Welcome.
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
      // Check localStorage for existing data indicators
      const hasTransactions = localStorage.getItem('hasTransactions') === 'true';
      const hasFiles = localStorage.getItem('hasFiles') === 'true';
      const hasAccounts = localStorage.getItem('hasAccounts') === 'true';
      const hasConnectedData = localStorage.getItem('hasConnectedData') === 'true';
      const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true';
      
      // If user has ever had data (hasEverHadData is true), they should go to dashboard
      // This handles the case where localStorage was cleared but user has existing data
      if (hasConnectedData || hasTransactions || hasFiles || hasAccounts) {
        localStorage.setItem('hasConnectedData', 'true');
        setHasConnectedData(true);
        return true;
      }
      
      // Also check if user has a plaid access token (indicates they've connected a bank)
      const hasPlaidToken = localStorage.getItem('plaid_access_token');
      if (hasPlaidToken) {
        localStorage.setItem('hasConnectedData', 'true');
        setHasConnectedData(true);
        return true;
      }
      
      // If user has ever had data but no current data flags, they should still go to dashboard
      // This handles the case where localStorage was partially cleared
      if (hasEverHadData) {
        localStorage.setItem('hasConnectedData', 'true');
        setHasConnectedData(true);
        return true;
      }
      
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
    localStorage.setItem('hasEverHadData', 'true');
    setHasEverHadData(true);
    
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
    localStorage.setItem('hasEverHadData', 'true');
    setHasEverHadData(true);
    
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

  // Sets 'hasEverHadData' To True And Sets Current Page To 'dashboard'.
  const handleGetStarted = () => {
    console.log('App: Get started clicked, navigating to dashboard...');
    localStorage.setItem('hasEverHadData', 'true');
    setHasEverHadData(true);
    setCurrentPage('dashboard');
  };

  // Handle Finance Connection Completion.
  const handleFinanceConnectComplete = () => {
    console.log('App: Finance connection completed, navigating to dashboard...');
    localStorage.setItem('hasConnectedData', 'true');
    localStorage.setItem('hasTransactions', 'true'); // Assume transactions will be loaded
    localStorage.setItem('hasFiles', 'true'); // Assume files will be uploaded
    localStorage.setItem('hasAccounts', 'true'); // Assume accounts will be connected
    setHasConnectedData(true);
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
