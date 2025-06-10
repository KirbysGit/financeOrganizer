// Imports.
import { styled } from 'styled-components';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createLinkToken, exchangePublicToken, fetchPlaidTransactions } from '../services/api';

const PlaidLink = ({ onSuccess, onError }) => {
    
    const [error, setError] = useState('');                 // State 4 Storing Error Message.
    const [loading, setLoading] = useState(false);          // State 4 Storing If Modal Is Loading.
    const [linkToken, setLinkToken] = useState(null);       // State 4 Storing Link Token.

    // -------------------------------------------------------- Set Link Upon Component Mount.
    useEffect(() => {
        initializePlaidLink();
    }, []);

    // -------------------------------------------------------- Initialize The Link For Plaid API.
    const initializePlaidLink = async () => {
        try {
            // Create UserID, Set Up Response For Plaid Link Token.
            setLoading(true);                         
            const userId = `user_${Date.now()}`;
            const response = await createLinkToken(userId);
            setLinkToken(response.data.link_token);
        } catch (error) {
            // Create Error Msg Upon Failure.
            console.error('Error creating link token:', error);
            setError('Failed to initialize bank connection. Please try again.');
        } finally {
            // Set Loading To False.
            setLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Successful Plaid Connection.
    const handlePlaidSuccess = async (publicToken, metadata) => {
        try {
            // Set Loading State True.
            setLoading(true);
            
            // Exchange Public Token For Access Token.
            const tokenResponse = await exchangePublicToken(publicToken);
            const accessToken = tokenResponse.data.access_token;
            
            // Fetch Transactions W/ Access Token.
            const transactionsResponse = await fetchPlaidTransactions(accessToken);
            
            // Store Access Token For Future Use.
            localStorage.setItem('plaid_access_token', accessToken);
            
            // If Success, Save Data, And Refresh.
            if (onSuccess) {
                onSuccess({
                    accessToken,
                    institution: metadata.institution,
                    accounts: metadata.accounts,
                    transactionCount: transactionsResponse.data.new_transactions
                });
            }
            
        } catch (error) {
            // If Error, Display, And Handle Exit.
            console.error('Error handling Plaid success:', error);
            if (onError) {
                onError('Failed to connect bank account. Please try again.');
            }
        } finally {
            // Set Loading To False.
            setLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Plaid Exit.
    const handlePlaidExit = (error, metadata) => {
        if (error) {
            // Display Error & Exit Properly.
            console.error('Plaid Link exit with error:', error);
            if (onError) {
                onError('Bank connection was cancelled or failed.');
            }
        }
    };

    // -------------------------------------------------------- Open Plaid Link.
    const openPlaidLink = () => {
        // If No Link Token, Error & Exit.
        if (!linkToken) {
            setError('Link token not ready. Please wait.');
            return;
        }

        // Create Plaid Link Handler W/ Token For Link Set Up.
        const handler = window.Plaid.create({
            token: linkToken,
            onSuccess: handlePlaidSuccess,
            onExit: handlePlaidExit,
            onEvent: (eventName, metadata) => {
                console.log('Plaid event:', eventName, metadata);
            }
        });

        handler.open();
    };

    // -------------------------------------------------------- Load Plaid Script If Not Loaded.
    useEffect(() => {
        if (!window.Plaid) {
            const script = document.createElement('script');
            script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <PlaidContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <PlaidButton 
                onClick={openPlaidLink} 
                disabled={loading || !linkToken}
            >
                {loading ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faBank} />
                        <span>Connect Bank Account</span>
                    </>
                )}
            </PlaidButton>
            
            <PlaidDescription>
                Securely connect your bank account to automatically import transactions
            </PlaidDescription>
        </PlaidContainer>
    );
};

// -------------------------------------------------------- Entire Plaid Container.
const PlaidContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

// -------------------------------------------------------- Connect Bank Account Button.
const PlaidButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, #00d4aa 0%, #00b89c 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
    min-width: 200px;
    justify-content: center;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 212, 170, 0.4);
        background: linear-gradient(135deg, #00b89c 0%, #00a085 100%);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        box-shadow: none;
    }

    svg {
        font-size: 1.1rem;
    }
`;

// -------------------------------------------------------- Description For Plaid Modal.
const PlaidDescription = styled.p`
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    margin: 0;
    max-width: 300px;
    line-height: 1.4;
`;

// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
    max-width: 300px;
`;

export default PlaidLink; 