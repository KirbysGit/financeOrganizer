// App.jsx

// This is the main app component that is used to render the entire application. It contains the main app layout,
// the toast notifications, and the main app content. This is the main file for the entirety of the frontend, its where
// all of the navigation is set up, the Dashboard is the main sub-component, but this has things like the WelcomeScreen,
// the login/signup screens etc.  Theres a lot of console.log in this file because its where I tend to have most of my 
// major errors so I am leaving them here for now.

// Imports.
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';

// Local
import Dashboard from './components/4Dashboard/Dashboard';
import WelcomeScreen from './components/1WelcomePage/WelcomeScreen';
import AccountSetUpScreen from './components/2AccountSetUp/AccountSetUpScreen';
import FinanceConnect from './components/3FinanceConnect/FinanceConnect';
import EmailVerification from './components/2AccountSetUp/Auth/EmailVerification';
import ForgotPasswordPage from './components/2AccountSetUp/Auth/ForgotPasswordPage';

import { logoutUser } from './services/api';

function App() {
  // State Management.
  const [currentPage, setCurrentPage] = useState(null);                         // State 4 Current Page.
  const [isAuthenticated, setIsAuthenticated] = useState(false);                // State 4 Whether User Is Authenticated.
  const [isInitializing, setIsInitializing] = useState(true);                  // State 4 Whether App Is Initializing.
  const [hasConnectedData, setHasConnectedData] = useState(false);              // State 4 Whether User Has Connected Data.
  const [hasEverHadData, setHasEverHadData] = useState(false);                  // State 4 Whether User Has Ever Had Data.
  const [modalType, setModalType] = useState(null);                            // State 4 Current Modal Type.
  const [hasNavigatedFromLogin, setHasNavigatedFromLogin] = useState(false);    // State 4 Whether User Has Navigated From Login.

  // -------------------------------------------------------- Initialize App.
  useEffect(() => {
    const initializeApp = async () => {
      console.log('App: Initializing app...');
      
      // Check If We're On The Verify-Email Page.
      console.log('App: Checking URL pathname:', window.location.pathname);
      if (window.location.pathname === '/verify-email') {
        console.log('App: Detected /verify-email route, setting current page...');
        setCurrentPage('verify-email');
        setIsInitializing(false);
        return;
      }
      
      // Check If We're On The Reset-Password Page.
      if (window.location.pathname === '/reset-password') {
        console.log('App: Detected /reset-password route, setting current page...');
        setCurrentPage('reset-password');
        setIsInitializing(false);
        return;
      }
      
      // Check If User Is Authenticated.
      const user = localStorage.getItem('user');                                // Get User From LocalStorage.
      if (user) {
        console.log('App: User is authenticated, checking verification status...');
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        
        // Check If User Is Verified.
        if (!userData.is_verified) {
          console.log('App: User is not verified, showing email verification...');
          setCurrentPage('account-setup');
          setModalType('email-verification');
          setIsInitializing(false);
          return;
        }
        
        console.log('App: User is verified, checking for existing data...');
        
        // Clear Problematic Storage Items That Might Cause Issues.
        const clearProblematicStorage = () => {
          // Get Current LocalStorage Values.
          const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true';
          const hasConnectedData = localStorage.getItem('hasConnectedData') === 'true';
          const hasPlaidToken = localStorage.getItem('plaid_access_token');
          
          // Clear Any Old Flags That Might Be Incorrect.
          // This Ensures They Go Through The Proper Flow.
          if (hasEverHadData || hasConnectedData || hasPlaidToken) {
            console.log('App: User has data flags, will verify with API calls...');
          }
        };
        
        clearProblematicStorage();
        
        // Only Check For Existing Data If We Haven't Already Navigated From Login.
        if (!hasNavigatedFromLogin) {
          // Check For Existing Data And Determine Navigation.
          const hasExistingData = await checkForExistingData();
          
          console.log('App: Navigation decision:', { hasExistingData });
          
          if (hasExistingData) {
            // User Has Connected Data, Go To Dashboard.
            console.log('App: User has existing data, navigating to dashboard...');
            setCurrentPage('dashboard');
          } else {
            // User Is Authenticated But No Data, Go To Finance Connect.
            console.log('App: User has no existing data, navigating to finance connect...');
            setCurrentPage('finance-connect');
          }
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
  }, []); // Remove Dependencies To Prevent Re-Triggering.

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
      // First Check LocalStorage For Quick Indicators.
      const hasTransactions = localStorage.getItem('hasTransactions') === 'true';
      const hasFiles = localStorage.getItem('hasFiles') === 'true';
      const hasAccounts = localStorage.getItem('hasAccounts') === 'true';
      const hasConnectedData = localStorage.getItem('hasConnectedData') === 'true';
      const hasEverHadData = localStorage.getItem('hasEverHadData') === 'true';
      
      console.log('App: localStorage indicators:', { hasTransactions, hasFiles, hasAccounts, hasConnectedData, hasEverHadData });
      
      // If User Has Ever Completed The FinanceConnect Flow (HasEverHadData), They Should Go To Dashboard.
      if (hasEverHadData) {
        console.log('App: User has completed setup before, going to dashboard...');
        return true;
      }
      
      // If LocalStorage Indicates We Have Data, Verify With API Calls.
      if (hasConnectedData || hasTransactions || hasFiles || hasAccounts) {
        console.log('App: LocalStorage Indicates Data Exists, Verifying With API Calls...');
        // Make API Calls To Verify Data Actually Exists.
        try {
          // Import API Module More Reliably.
          const apiModule = await import('./services/api');
          
          // Check For Transactions.
          const transactionsResponse = await apiModule.fetchTransactions();
          const hasActualTransactions = transactionsResponse.data && transactionsResponse.data.length > 0;
          
          // Check For Accounts.
          const accountsResponse = await apiModule.getAccounts();
          const hasActualAccounts = accountsResponse.data && accountsResponse.data.length > 0;
          
          // Check For Files.
          const filesResponse = await apiModule.getFiles();
          const hasActualFiles = filesResponse.data && filesResponse.data.length > 0;
          
          console.log('App: API verification results:', { hasActualTransactions, hasActualAccounts, hasActualFiles });
          
          // If Any Of These Have Data, User Has Connected Data.
          if (hasActualTransactions || hasActualAccounts || hasActualFiles) {
            console.log('App: API confirms user has data, setting flags...');
            localStorage.setItem('hasConnectedData', 'true');
            localStorage.setItem('hasEverHadData', 'true');
            setHasConnectedData(true);
            setHasEverHadData(true);
            return true;
          } else {
            console.log('App: API shows no data, but user has localStorage flags - trusting localStorage...');
            // Trust LocalStorage Flags If API Calls Fail Or Show No Data.
            // This Prevents Users From Being Stuck In A Loop.
            return true;
          }
        } catch (apiError) {
          console.error('Error checking data via API:', apiError);
          // If API Calls Fail, Trust LocalStorage Flags.
          console.log('App: API calls failed, trusting localStorage flags...');
          return hasConnectedData || hasTransactions || hasFiles || hasAccounts;
        }
      }
      
      // Also Check If User Has A Plaid Access Token (Indicates They've Connected A Bank).
      const hasPlaidToken = localStorage.getItem('plaid_access_token');
      console.log('App: Checking for Plaid token:', hasPlaidToken);
      if (hasPlaidToken) {
        console.log('App: User has Plaid token, assuming they have data...');
        localStorage.setItem('hasConnectedData', 'true');
        setHasConnectedData(true);
        return true;
      }
      
      // If We Get Here, User Has No Data Indicators.
      console.log('App: No data indicators found, user should go to FinanceConnect...');
      return false;
    } catch (error) {
      console.error('Error in checkForExistingData:', error);
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
    console.log('App: Sign up successful, but waiting for email verification...');
    
    // For New Signups, DO NOT Set Any LocalStorage Flags Until Email Is Verified.
    // The User Will Be Stuck On The Email Verification Modal Until They Verify.
    console.log('App: User must verify email before proceeding...');
    
    // Don't Navigate Anywhere - Stay On Account-Setup Page.
    // The EmailVerificationModal Will Handle The Flow After Verification.
  };

  // Handle Email Verification Completion.
  const handleEmailVerificationComplete = async () => {
    console.log('App: Email verification complete, showing login modal...');
    
    // After Email Verification, Show The Login Modal So User Can Sign In.
    setCurrentPage('account-setup');
    setModalType('login');
  };

  // Sets 'hasEverHadData' To True And Sets Current Page To 'finance-connect'.
  const handleLoginSuccess = async () => {
    console.log('App: Login successful, checking for existing data...');
    
    // Set Navigation Flag To Prevent Double-Checking.
    setHasNavigatedFromLogin(true);
    
    // For Logins, Clear Any Old LocalStorage Data To Ensure Proper Flow.
    console.log('App: Clearing localStorage for login...');
    localStorage.removeItem('hasEverHadData');
    localStorage.removeItem('hasConnectedData');
    localStorage.removeItem('hasTransactions');
    localStorage.removeItem('hasFiles');
    localStorage.removeItem('hasAccounts');
    localStorage.removeItem('plaid_access_token');
    setHasEverHadData(false);
    setHasConnectedData(false);
    
    // Check If User Already Has Connected Data By Making API Calls.
    try {
      console.log('App: Making API calls to check for existing data...');
      const apiModule = await import('./services/api');
      
      // Check For Transactions.
      const transactionsResponse = await apiModule.fetchTransactions();
      const hasTransactions = transactionsResponse.data && transactionsResponse.data.length > 0;
      
      // Check For Accounts.
      const accountsResponse = await apiModule.getAccounts();
      const hasAccounts = accountsResponse.data && accountsResponse.data.length > 0;
      
      // Check For Files.
      const filesResponse = await apiModule.getFiles();
      const hasFiles = filesResponse.data && filesResponse.data.length > 0;
      
      console.log('App: API check results:', { hasTransactions, hasAccounts, hasFiles });
      
      // Set LocalStorage Flags Based On What We Found.
      if (hasTransactions) {
        localStorage.setItem('hasTransactions', 'true');
        console.log('App: Set hasTransactions flag');
      }
      
      if (hasAccounts) {
        localStorage.setItem('hasAccounts', 'true');
        console.log('App: Set hasAccounts flag');
      }
      
      if (hasFiles) {
        localStorage.setItem('hasFiles', 'true');
        console.log('App: Set hasFiles flag');
      }
      
      // If User Has Any Data, Set The Main Flags.
      if (hasTransactions || hasAccounts || hasFiles) {
        localStorage.setItem('hasConnectedData', 'true');
        localStorage.setItem('hasEverHadData', 'true');
        setHasConnectedData(true);
        setHasEverHadData(true);
        console.log('App: User has existing data, navigating to dashboard...');
        setCurrentPage('dashboard');
      } else {
        console.log('App: No existing data found, navigating to finance connect...');
        setCurrentPage('finance-connect');
      }
      
    } catch (error) {
      console.error('App: Error checking for existing data:', error);
      // If API Calls Fail, Assume User Has No Data And Go To Finance Connect.
      console.log('App: API calls failed, navigating to finance connect...');
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
    
    // Reset Navigation Flag.
    setHasNavigatedFromLogin(false);
    
    if (hasActualData) {
      // User Actually Connected Data.
      localStorage.setItem('hasConnectedData', 'true');
      localStorage.setItem('hasEverHadData', 'true'); // User Now Has Data.
      localStorage.setItem('hasTransactions', 'true'); // Assume Transactions Will Be Loaded.
      localStorage.setItem('hasFiles', 'true'); // Assume Files Will Be Uploaded.
      localStorage.setItem('hasAccounts', 'true'); // Assume Accounts Will Be Connected.
      setHasConnectedData(true);
      setHasEverHadData(true); // User Now Has Data.
    } else {
      // User Skipped - Still Mark That They've Completed The Setup Flow.
      console.log('App: User skipped setup, but marking as completed...');
      localStorage.setItem('hasEverHadData', 'true'); // User Has Completed Setup Flow.
      setHasEverHadData(true);
    }
    
    sessionStorage.setItem('hasNavigatedFromFinanceConnect', 'true'); // Mark That User Has Navigated From FinanceConnect.
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
    sessionStorage.removeItem('hasNavigatedFromFinanceConnect'); // Clear Session Flag.
    setIsAuthenticated(false);
    setHasConnectedData(false);
    setHasEverHadData(false);
    setHasNavigatedFromLogin(false); // Reset Navigation Flag.
    setCurrentPage('welcome');
  };

  // -------------------------------------------------------- Return Loading Screen While Initializing.
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
      {/* Toast Notifications. */}
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
      
      {/* Welcome Screen. */}
      {currentPage === 'welcome' && (
        <WelcomeScreen onShowAccountSetUp={handleShowAccountSetUp} />
      )}
      
      {/* Account Setup Screen. */}
      {currentPage === 'account-setup' && (
        <AccountSetUpScreen 
          onBack={handleBackToWelcome}
          onSignUpSuccess={handleSignUpSuccess}
          onLoginSuccess={handleLoginSuccess}
          onEmailVerificationComplete={handleEmailVerificationComplete}
          modalType={modalType}
        />
      )}
      
      {/* Finance Connect Screen. */}
      {currentPage === 'finance-connect' && (
        <FinanceConnect 
          onBack={handleBackToWelcome}
          onComplete={handleFinanceConnectComplete}
          user={JSON.parse(localStorage.getItem('user') || '{}')}
        />
      )}
      
      {/* Dashboard. */}
      {currentPage === 'dashboard' && (
        <Dashboard 
          hasEverHadData={hasEverHadData} 
          setHasEverHadData={setHasEverHadData}
          hasConnectedData={hasConnectedData}
          setHasConnectedData={setHasConnectedData}
          onLogout={handleLogout}
        />
      )}
      
      {/* Email Verification. */}
      {currentPage === 'verify-email' && (
        <>
          {console.log('App: Rendering EmailVerification component...')}
          <EmailVerification />
        </>
      )}

      {/* Reset Password. */}
      {currentPage === 'reset-password' && (
        <>
          {console.log('App: Rendering ForgotPasswordPage component...')}
          <ForgotPasswordPage />
        </>
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
