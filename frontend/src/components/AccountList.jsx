import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAccounts, getStats } from '../services/api';

// -------------------------------------------------------- Helper Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const getAccountTypeColor = (type) => {
    const colors = {
        depository: '#4CAF50',
        credit: '#F44336',
        loan: '#FF9800',
        investment: '#2196F3'
    };
    return colors[type] || '#9E9E9E';
};

const getAccountTypeIcon = (type) => {
    const icons = {
        depository: '🏦',
        credit: '💳',
        loan: '💰',
        investment: '📈'
    };
    return icons[type] || '📊';
};

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(null);
    const [expandedAccount, setExpandedAccount] = useState(null);
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------------------------------------------- Handle Data Import
    const importData = async () => {
        try {
            setLoading(true);
            const [accountsRes, statsRes] = await Promise.all([
                getAccounts(),
                getStats()
            ]);
            setAccounts(accountsRes.data);
            setStats(statsRes.data);
            setError(null);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Failed to load account data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        importData();
    }, []);

    const uniqueTypes = [...new Set(accounts.map(acc => acc.type))];

    if (loading) {
        return <LoadingMessage>Loading your financial data...</LoadingMessage>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <AccountListWrapper>  
            <SummarySection>                
                <TypeFilters>
                    <TypeFilter 
                        $active={selectedType === 'all'} 
                        onClick={() => setSelectedType('all')}
                    >
                        All Accounts
                    </TypeFilter>
                    {uniqueTypes.map(type => (
                        <TypeFilter 
                            key={type}
                            $active={selectedType === type}
                            onClick={() => setSelectedType(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </TypeFilter>
                    ))}
                </TypeFilters>
            </SummarySection>

            <AccountGrid>
                {accounts
                    .filter(acc => selectedType === 'all' || acc.type === selectedType)
                    .map((acc) => (
                        <AccountObject 
                            key={acc.id}
                            onClick={() => setExpandedAccount(expandedAccount === acc.id ? null : acc.id)}
                            type={acc.type}
                        >
                            <AccountHeader>
                                <AccountIcon>{getAccountTypeIcon(acc.type)}</AccountIcon>
                                <AccountName>{acc.name}</AccountName>
                            </AccountHeader>
                            
                            <AccountBalance>
                                {formatCurrency(acc.current_balance)}
                            </AccountBalance>
                            
                            {expandedAccount === acc.id && (
                                <AccountDetails>
                                    <DetailRow>
                                        <DetailLabel>Official Name:</DetailLabel>
                                        <DetailValue>{acc.official_name || 'N/A'}</DetailValue>
                                    </DetailRow>
                                    <DetailRow>
                                        <DetailLabel>Type:</DetailLabel>
                                        <DetailValue>{acc.type} ({acc.subtype})</DetailValue>
                                    </DetailRow>
                                    <DetailRow>
                                        <DetailLabel>Available Balance:</DetailLabel>
                                        <DetailValue>
                                            {acc.available_balance ? formatCurrency(acc.available_balance) : 'N/A'}
                                        </DetailValue>
                                    </DetailRow>
                                    <DetailRow>
                                        <DetailLabel>Last Updated:</DetailLabel>
                                        <DetailValue>
                                            {new Date(acc.updated_at).toLocaleDateString()}
                                        </DetailValue>
                                    </DetailRow>
                                    <DetailRow>
                                        <DetailLabel>Transactions:</DetailLabel>
                                        <DetailValue>{acc.transaction_count}</DetailValue>
                                    </DetailRow>
                                </AccountDetails>
                            )}
                        </AccountObject>
                    ))}
            </AccountGrid>
        </AccountListWrapper>
    );
};

const AccountListWrapper = styled.div`
    display: flex;
    width: 90%;
    flex-direction: column;
`;

const AccountHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
`;

const SummarySection = styled.div`
    margin-bottom: 2rem;
`;

const TypeFilters = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
`;

const TypeFilter = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 20px;
    font: inherit;
    background: ${props => props.$active ? '#2c3e50' : '#f0f0f0'};
    color: ${props => props.$active ? 'white' : '#333'};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$active ? '#2c3e50' : '#e0e0e0'};
    }
`;

const AccountGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
`;

const AccountObject = styled.div`
    padding: 1.5rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid ${props => getAccountTypeColor(props.type)};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;

const AccountIcon = styled.span`
    font-size: 1.5rem;
    margin-right: 0.5rem;
`;

const AccountName = styled.div`
    font-size: 1.2rem;
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
`;

const AccountBalance = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0;
    color: #2c3e50;
`;

const AccountDetails = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
`;

const DetailLabel = styled.span`
    color: #666;
`;

const DetailValue = styled.span`
    color: #2c3e50;
    font-weight: 500;
`;

const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: #666;
`;

const ErrorMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: #dc3545;
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export default AccountList;