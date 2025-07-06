import React, { useState, useEffect } from 'react';

import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import WelcomeScreen from './components/LandingPage/WelcomeScreen';
import AccountSetUpScreen from './components/LandingPage/AccountSetUpScreen';
import FinanceConnect from './components/Connect/FinanceConnect';
import styled from 'styled-components';

function App() {
  // State 2 Track Current Page.
  const [currentPage, setCurrentPage] = useState('welcome'); // (E.g. 'welcome', 'account-setup', 'finance-connect', 'dashboard')
  
  // State 2 Track If User Has Ever Had Data.
  const [hasEverHadData, setHasEverHadData] = useState(localStorage.getItem('hasEverHadData') === 'true');
  
  // State to track if user has connected financial data
  const [hasConnectedData, setHasConnectedData] = useState(localStorage.getItem('hasConnectedData') === 'true');
  
  // Check If User Is Already Authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 
  const [modalType, setModalType] = useState('signup');

  // Check Authentication Status On App Load.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      // Determine where to send authenticated user
      if (hasConnectedData) {
        // User has connected data, go to dashboard
        setCurrentPage('dashboard');
      } else if (hasEverHadData) {
        // User has account but no connected data, go to finance connect
        setCurrentPage('finance-connect');
      }
      // If neither, stay on welcome or account-setup
    }
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

  // Sets Current Page To 'account-setup'.
  const handleShowAccountSetUp = (modalType) => {
    setCurrentPage('account-setup');
    setModalType(modalType);
  };

  // Sets Current Page To 'welcome' or 'account-setup' based on authentication.
  const handleBackToWelcome = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // User is authenticated, go back to account setup
      setCurrentPage('account-setup');
    } else {
      // User is not authenticated, go back to welcome
      setCurrentPage('welcome');
    }
  };

  // Sets 'hasEverHadData' To True And Sets Current Page To 'finance-connect'.
  const handleSignUpSuccess = () => {
    console.log('App: Sign up successful, navigating to finance connect...');
    localStorage.setItem('hasEverHadData', 'true');
    setHasEverHadData(true);
    setCurrentPage('finance-connect');
  };

  // Sets 'hasEverHadData' To True And Sets Current Page To 'finance-connect'.
  const handleLoginSuccess = () => {
    console.log('App: Login successful, navigating to finance connect...');
    localStorage.setItem('hasEverHadData', 'true');
    setHasEverHadData(true);
    setCurrentPage('finance-connect');
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
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasConnectedData');
    setIsAuthenticated(false);
    setHasConnectedData(false);
    setCurrentPage('welcome');
  };

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
        <>
          <NavBar onLogout={handleLogout} />
          <Dashboard hasEverHadData={hasEverHadData} setHasEverHadData={setHasEverHadData} />
        </>
      )}
    </RootWrapper>
  );
}

const RootWrapper = styled.div`
  padding: 0;
  margin: 0;
`

export default App;
