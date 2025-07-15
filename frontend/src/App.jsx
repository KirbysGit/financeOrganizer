import React, { useState, useEffect } from 'react';

import Dashboard from './components/4Dashboard/Dashboard';
import WelcomeScreen from './components/1WelcomePage/WelcomeScreen';
import AccountSetUpScreen from './components/2AccountSetUp/AccountSetUpScreen';
import FinanceConnect from './components/3FinanceConnect/FinanceConnect';
import styled from 'styled-components';
import { logoutUser } from './services/api';

function App() {
  // State 2 Track Current Page.
  const [currentPage, setCurrentPage] = useState(null); // Start with null to prevent flash
  
  // State 2 Track If User Has Ever Had Data.
  const [hasEverHadData, setHasEverHadData] = useState(localStorage.getItem('hasEverHadData') === 'true');
  
  // State to track if user has connected financial data
  const [hasConnectedData, setHasConnectedData] = useState(localStorage.getItem('hasConnectedData') === 'true');
  
  // Check If User Is Already Authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State to track if app is initializing
  const [isInitializing, setIsInitializing] = useState(true);

  // 
  const [modalType, setModalType] = useState('signup');

  // Check Authentication Status On App Load.
  useEffect(() => {
    const initializeApp = async () => {
    const user = localStorage.getItem('user');
    
      if (user) {
      setIsAuthenticated(true);
      
      // Check for existing data and determine navigation
        const hasExistingData = await checkForExistingData();
        
        if (hasExistingData) {
        // User has connected data, go to dashboard
        setCurrentPage('dashboard');
      } else if (hasEverHadData) {
        // User has account but no connected data, go to finance connect
        setCurrentPage('finance-connect');
        } else {
          // User is authenticated but no data, go to welcome
          setCurrentPage('welcome');
        }
      } else {
        // No user found, go to welcome
        setCurrentPage('welcome');
      }
      
      // Mark initialization as complete
      setIsInitializing(false);
    };
    
    initializeApp();
  }, [hasEverHadData, hasConnectedData]);

  // Update 'hasEverHadData' and 'hasConnectedData' When They Change.
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

  // Check if user already has connected data
  const checkForExistingData = async () => {
    try {
      // Import the API functions we need
      const { fetchTransactions, getFiles, getAccounts } = await import('./services/api');
      
      // Check for existing data
      const [transactionsRes, filesRes, accountsRes] = await Promise.allSettled([
        fetchTransactions(),
        getFiles(),
        getAccounts()
      ]);
      
      // If any of these have data, user has connected data
      const hasTransactions = transactionsRes.status === 'fulfilled' && transactionsRes.value.data.length > 0;
      const hasFiles = filesRes.status === 'fulfilled' && filesRes.value.data.length > 0;
      const hasAccounts = accountsRes.status === 'fulfilled' && accountsRes.value.data.length > 0;
      
      if (hasTransactions || hasFiles || hasAccounts) {
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

  // Sets Current Page To 'welcome' or 'account-setup' based on authentication.
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

  // Handle finance connection completion
  const handleFinanceConnectComplete = () => {
    console.log('App: Finance connection completed, navigating to dashboard...');
    localStorage.setItem('hasConnectedData', 'true');
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
    setIsAuthenticated(false);
    setHasConnectedData(false);
    setHasEverHadData(false);
    setCurrentPage('welcome');
  };



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

  return (
    <RootWrapper>
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

const RootWrapper = styled.div`
  padding: 0;
  margin: 0;
`

export default App;
