// Imports.
import React from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

// ------------------------------------------------------------------------------------------------ Helper Functions.

// Formats Currency For Display Taking In 'amount' As A Parameter.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Gets Account Type Color Based On The Type Of Account.
const getAccountTypeColor = (type) => {
    const colors = {
        depository: 'rgb(40, 167, 69)',
        credit: 'rgb(220, 53, 69)',
        loan: 'rgb(255, 193, 7)',
        investment: 'rgb(13, 110, 253)'
    };
    return colors[type] || 'rgb(100, 100, 100)';
};

// Gets Account Type Icon Based On The Type Of Account.
const getAccountTypeIcon = (type) => {
    const icons = {
        depository: '🏦',
        credit: '💳',
        loan: '💰',
        investment: '📈'
    };
    return icons[type] || '📊';
};

// Gets Account Type Label Based On The Type Of Account.
const getAccountTypeLabel = (type) => {
    const labels = {
        depository: 'Bank Account',
        credit: 'Credit Card',
        loan: 'Loan',
        investment: 'Investment'
    };
    return labels[type] || 'Account';
};

// Gets Account Subtype Label Based On The Subtype.
const getAccountSubtypeLabel = (subtype) => {
    const labels = {
        checking: 'Checking',
        savings: 'Savings',
        cd: 'Certificate of Deposit',
        'credit card': 'Credit Card',
        'money market': 'Money Market',
        ira: 'Individual Retirement Account',
        '401k': '401(k) Retirement',
        student: 'Student Loan',
        mortgage: 'Mortgage',
        hsa: 'Health Savings Account',
        'cash management': 'Cash Management'
    };
    return labels[subtype] || subtype;
};

// Formats Account Mask For Display.
const formatAccountMask = (mask) => {
    if (!mask) return null;
    return `****${mask}`;
};

// Gets Account Status Based On Available Balance.
const getAccountStatus = (currentBalance, availableBalance, type) => {
    if (type === 'credit') {
        return {
            status: 'Credit Available',
            color: 'rgb(40, 167, 69)',
            icon: '💳'
        };
    }
    
    if (availableBalance === null) {
        return {
            status: 'Balance Unavailable',
            color: 'rgb(100, 100, 100)',
        };
    }
    
    if (availableBalance < currentBalance) {
        return {
            status: 'Pending Transactions',
            color: 'rgb(255, 193, 7)',
        };
    }
    
    return {
        status: 'Fully Available',
        color: 'rgb(40, 167, 69)',
    };
};

// Formats Last Updated Time.
const formatLastUpdated = (updatedAt) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
};

// ------------------------------------------------------------------------------------------------ AccountCard Component.
const AccountCard = ({ account, isExpanded, onToggle }) => {
    return (
        <Card 
            onClick={() => onToggle(account.id)}
            $type={account.type}
            $expanded={isExpanded}
        >
            {/* Collapsed State - Summary View */}
            <CardSummary>
                {/* Left Side - Account Info */}
                <AccountInfoSection>
                    <AccountIcon $type={account.type}>{getAccountTypeIcon(account.type)}</AccountIcon>
                    <AccountDetails>
                        <AccountName>{account.name}</AccountName>
                        <AccountType>{getAccountTypeLabel(account.type)} • {getAccountSubtypeLabel(account.subtype)}</AccountType>
                        {account.mask && <AccountMask>{formatAccountMask(account.mask)}</AccountMask>}
                    </AccountDetails>
                </AccountInfoSection>
                
                {/* Right Side - Balance & Status */}
                <AccountSummary>
                    <BalanceSection>
                        <BalanceAmount>{formatCurrency(account.current_balance)}</BalanceAmount>
                        <BalanceCurrency>{account.currency}</BalanceCurrency>
                    </BalanceSection>
                    
                    <StatusSection>
                        {(() => {
                            const status = getAccountStatus(account.current_balance, account.available_balance, account.type);
                            return (
                                <StatusBadge $color={status.color}>
                                    {status.status}
                                </StatusBadge>
                            );
                        })()}
                    </StatusSection>
                </AccountSummary>
                
                {/* Expand Toggle */}
                <ExpandToggle $expanded={isExpanded}>
                    <ChevronIcon $expanded={isExpanded}>
                        <FaChevronDown />   
                    </ChevronIcon>
                </ExpandToggle>
            </CardSummary>
            
            {/* Expanded State - Detailed View */}
            {isExpanded && (
                <CardExpanded>
                    {/* Left Column - Account Metadata */}
                    <MetadataColumn>
                        <MetadataSection>
                            <MetadataTitle>Account Information</MetadataTitle>
                            <MetadataGrid>
                                {account.official_name && account.official_name !== account.name && (
                                    <MetadataItem>
                                        <MetadataLabel>Official Name</MetadataLabel>
                                        <MetadataValue>{account.official_name}</MetadataValue>
                                    </MetadataItem>
                                )}
                                <MetadataItem>
                                    <MetadataLabel>Account ID</MetadataLabel>
                                    <MetadataValue>{account.account_id}</MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Type</MetadataLabel>
                                    <MetadataValue>{getAccountTypeLabel(account.type)}</MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Subtype</MetadataLabel>
                                    <MetadataValue>{getAccountSubtypeLabel(account.subtype)}</MetadataValue>
                                </MetadataItem>
                                {account.mask && (
                                    <MetadataItem>
                                        <MetadataLabel>Account Mask</MetadataLabel>
                                        <MetadataValue>{formatAccountMask(account.mask)}</MetadataValue>
                                    </MetadataItem>
                                )}
                                <MetadataItem>
                                    <MetadataLabel>Currency</MetadataLabel>
                                    <MetadataValue>{account.currency}</MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Last Updated</MetadataLabel>
                                    <MetadataValue>{formatLastUpdated(account.updated_at)}</MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Transaction Count</MetadataLabel>
                                    <MetadataValue>{account.transaction_count || 0}</MetadataValue>
                                </MetadataItem>
                            </MetadataGrid>
                        </MetadataSection>
                        
                        <BalanceDetailsSection>
                            <MetadataTitle>Balance Details</MetadataTitle>
                            <BalanceDetailsGrid>
                                <BalanceDetailItem>
                                    <BalanceDetailLabel>Current Balance</BalanceDetailLabel>
                                    <BalanceDetailValue $positive={true}>
                                        {formatCurrency(account.current_balance)}
                                    </BalanceDetailValue>
                                </BalanceDetailItem>
                                <BalanceDetailItem>
                                    <BalanceDetailLabel>Available Balance</BalanceDetailLabel>
                                    <BalanceDetailValue $positive={account.available_balance !== null}>
                                        {account.available_balance !== null 
                                            ? formatCurrency(account.available_balance)
                                            : 'N/A'
                                        }
                                    </BalanceDetailValue>
                                </BalanceDetailItem>
                            </BalanceDetailsGrid>
                        </BalanceDetailsSection>
                    </MetadataColumn>
                    
                    {/* Right Column - Future Visualizations */}
                    <VisualizationColumn>
                        <VisualizationPlaceholder>
                            <PlaceholderIcon>📊</PlaceholderIcon>
                            <PlaceholderTitle>Account Analytics</PlaceholderTitle>
                            <PlaceholderText>
                                Charts and transaction trends will appear here in future updates.
                            </PlaceholderText>
                        </VisualizationPlaceholder>
                    </VisualizationColumn>
                </CardExpanded>
            )}
        </Card>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Account Card.
const Card = styled.div`
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    cursor: pointer;
    overflow: hidden;
    width: 100%;
    
    &:hover {
        transform: translateY(-2px);
        border-color: ${props => getAccountTypeColor(props.$type)};
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
`;

// -------------------------------------------------------- Card Summary (Collapsed State).
const CardSummary = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
    position: relative;
`;

// -------------------------------------------------------- Account Info Section.
const AccountInfoSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 0;
`;

const AccountIcon = styled.span`
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    flex-shrink: 0;
`;

const AccountDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
`;

const AccountName = styled.div`
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const AccountType = styled.div`
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const AccountMask = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 400;
    font-family: 'Courier New', monospace;
    margin-top: 0.25rem;
`;

// -------------------------------------------------------- Account Summary (Right Side).
const AccountSummary = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
    flex-shrink: 0;
`;

const BalanceSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
`;

const BalanceAmount = styled.div`
    font-size: clamp(1.8rem, 4vw, 2.2rem);
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
`;

const BalanceCurrency = styled.span`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const StatusSection = styled.div`
    display: flex;
    align-items: center;
`;

const StatusBadge = styled.span`
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;
`;

// -------------------------------------------------------- Expand Toggle.
const ExpandToggle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    color: white;
    transition: all 0.3s ease;
    flex-shrink: 0;
    
    &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
`;

const ChevronIcon = styled.span`
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: transform 0.3s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

// -------------------------------------------------------- Card Expanded (Expanded State).
const CardExpanded = styled.div`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(100, 100, 100, 0.2);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    animation: slideDown 0.3s ease-out;
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
`;

// -------------------------------------------------------- Metadata Column.
const MetadataColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const MetadataSection = styled.div`
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0rem 1.25rem 1.25rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
`;

const MetadataTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(100, 100, 100, 0.2);
`;

const MetadataGrid = styled.div`
    display: grid;
    gap: 0.75rem;
`;

const MetadataItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
`;

const MetadataLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
`;

const MetadataValue = styled.span`
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.5);
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    text-align: right;
    max-width: 60%;
    word-break: break-word;
`;

// -------------------------------------------------------- Balance Details Section.
const BalanceDetailsSection = styled(MetadataSection)``;

const BalanceDetailsGrid = styled.div`
    display: grid;
    gap: 1rem;
`;

const BalanceDetailItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.4);
`;

const BalanceDetailLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
`;

const BalanceDetailValue = styled.span`
    color: ${props => props.$positive ? 'var(--amount-positive)' : 'var(--text-secondary)'};
    font-weight: 700;
    font-size: 1rem;
`;

// -------------------------------------------------------- Visualization Column.
const VisualizationColumn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const VisualizationPlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 2rem;
    border: 2px dashed rgba(100, 100, 100, 0.3);
    width: 100%;
    height: 200px;
    gap: 1rem;
`;

const PlaceholderIcon = styled.div`
    font-size: 3rem;
    opacity: 0.6;
`;

const PlaceholderTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
`;

const PlaceholderText = styled.p`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
    max-width: 200px;
`;

export default AccountCard;
