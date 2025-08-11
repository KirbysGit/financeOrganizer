// AccountCard.jsx

// This is a sub-component of our Accounts component, this just modularizes the account cards into its own file
// because we have specific functions for the account cards that we want to reuse throughout the project, and 
// furthermore, in the future handling the various types of accounts I know will be a pain, so I'm just starting
// out with a modularized file for the account cards.

// Imports.
import React from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';
import { 
  Building2, CreditCard, PiggyBank, TrendingUp,
  Wallet, Shield, Zap, Target
} from 'lucide-react';

// ------------------------------------------------------------------------------------------------ Helper Functions.

// -------------------------------------------------------- Formats USD Currecy.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// -------------------------------------------------------- Gets Account Type Icon.
const getAccountTypeIcon = (type) => {
    const icons = {
    depository: <Building2 size={24} />,
    credit: <CreditCard size={24} />,
    loan: <PiggyBank size={24} />,
    investment: <TrendingUp size={24} />
    };
  return icons[type] || <Wallet size={24} />;
};

// -------------------------------------------------------- Gets Account Type Label.
const getAccountTypeLabel = (type) => {
    const labels = {
        depository: 'Bank Account',
        credit: 'Credit Card',
        loan: 'Loan',
        investment: 'Investment',
        cash: 'Cash'
    };
    return labels[type] || 'Account';
};

// -------------------------------------------------------- Gets Account Subtype Label.
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
        'cash management': 'Cash Management',
        cash: 'Cash Balance'
    };
    return labels[subtype] || subtype;
};

// -------------------------------------------------------- Formats Account Mask.
const formatAccountMask = (mask) => {
    if (!mask) return null;
    return `****${mask}`;
};

// -------------------------------------------------------- Gets Account Status.
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

// -------------------------------------------------------- Formats Last Updated Time.
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
            $type={account.type}
            $expanded={isExpanded}
        >
            {/* Collapsed State - Summary View. */}
            <CardSummary onClick={() => onToggle(account.id)}>
                {/* Left Side - Account Info. */}
                <AccountInfoSection>
                    <AccountIcon $type={account.type}>{getAccountTypeIcon(account.type)}</AccountIcon>
                    <AccountDetails>
                        <AccountName>{account.name}</AccountName>
                        <AccountType>{getAccountTypeLabel(account.type)} • {getAccountSubtypeLabel(account.subtype)}</AccountType>
                        {account.mask && account.type !== 'cash' && <AccountMask>{formatAccountMask(account.mask)}</AccountMask>}
                    </AccountDetails>
                </AccountInfoSection>
                
                {/* Right Side - Balance & Status. */}
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
                
                {/* Expand Toggle. */}
                <ExpandToggle $expanded={isExpanded}>
                    <ChevronIcon $expanded={isExpanded}>
                        <FaChevronDown />   
                    </ChevronIcon>
                </ExpandToggle>
            </CardSummary>
            
            {/* Expanded State - Detailed View. */}
            {isExpanded && (
                <CardExpanded onClick={(e) => e.stopPropagation()}>
                    {/* Left Column - Balance Details & Account Info. */}
                    <LeftColumn>
                        {/* Balance Details Section. */}
                        <BalanceDetailsSection>
                            <MetadataTitle>Balance Details</MetadataTitle>
                            <TitleDivider />
                            <BalanceDetailsGrid>
                                <BalanceDetailItem>
                                    <MetadataLabel>Current Balance</MetadataLabel>
                                    <BalanceDetailValue $positive={true}>
                                        {formatCurrency(account.current_balance)}
                                    </BalanceDetailValue>
                                </BalanceDetailItem>
                                <BalanceDetailItem>
                                    <MetadataLabel>Available Balance</MetadataLabel>
                                    <BalanceDetailValue $positive={account.available_balance !== null}>
                                        {account.available_balance !== null 
                                            ? formatCurrency(account.available_balance)
                                            : 'N/A'
                                        }
                                    </BalanceDetailValue>
                                </BalanceDetailItem>
                                {account.limit && (
                                    <BalanceDetailItem>
                                        <MetadataLabel>Credit Limit</MetadataLabel>
                                        <BalanceDetailValue $positive={true}>
                                            {formatCurrency(account.limit)}
                                        </BalanceDetailValue>
                                    </BalanceDetailItem>
                                )}
                            </BalanceDetailsGrid>
                        </BalanceDetailsSection>
                        
                        {/* Account Information Section. */}
                        <MetadataSection>
                            <MetadataTitle>Account Information</MetadataTitle>
                            <TitleDivider />
                            <MetadataGrid>
                                {account.official_name && account.official_name !== account.name && (
                                    <MetadataItem>
                                        <MetadataLabel>Official Name</MetadataLabel>
                                        <MetadataValue>{account.official_name}</MetadataValue>
                                    </MetadataItem>
                                )}
                                <MetadataItem>
                                    <MetadataLabel>Account ID</MetadataLabel>
                                    <MetadataValue>
                                        {account.account_id || (account.type === 'cash' ? 'N/A (Cash Account)' : 'N/A')}
                                    </MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Type</MetadataLabel>
                                    <MetadataValue>{getAccountTypeLabel(account.type)}</MetadataValue>
                                </MetadataItem>
                                <MetadataItem>
                                    <MetadataLabel>Subtype</MetadataLabel>
                                    <MetadataValue>{getAccountSubtypeLabel(account.subtype)}</MetadataValue>
                                </MetadataItem>
                                {account.mask && account.type !== 'cash' && (
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
                    </LeftColumn>
                    
                    {/* Right Column - Chart & Financial Impact. */}
                    <RightColumn>
                        {/* Chart Placeholder. */}
                        <ChartSection>
                            <EmptyChartContainer>
                                <YAxisTitle>Value ($)</YAxisTitle>
                                <XAxisTitle>Month / Time</XAxisTitle>
                                <EmptyChartGrid>
                                    {/* Y-axis labels. */}
                                    <YAxisLabels>
                                        <YAxisLabel>100</YAxisLabel>
                                        <YAxisLabel>80</YAxisLabel>
                                        <YAxisLabel>60</YAxisLabel>
                                        <YAxisLabel>40</YAxisLabel>
                                        <YAxisLabel>20</YAxisLabel>
                                        <YAxisLabel>0</YAxisLabel>
                                    </YAxisLabels>
                                    
                                    {/* Chart area with grid. */}
                                    <ChartArea>
                                        <GridLines>
                                            <GridLine />
                                            <GridLine />
                                            <GridLine />
                                            <GridLine />
                                            <GridLine />
                                        </GridLines>
                                        
                                        {/* Empty tooltip in center. */}
                                        <EmptyTooltip>
                                            <TooltipIcon>📊</TooltipIcon>
                                            <TooltipText>No growth data available from this account</TooltipText>
                                        </EmptyTooltip>
                                    </ChartArea>
                                    
                                    {/* X-axis labels. */}
                                    <XAxisLabels>
                                        <XAxisLabel>Jan</XAxisLabel>
                                        <XAxisLabel>Feb</XAxisLabel>
                                        <XAxisLabel>Mar</XAxisLabel>
                                        <XAxisLabel>Apr</XAxisLabel>
                                        <XAxisLabel>May</XAxisLabel>
                                    </XAxisLabels>
                                </EmptyChartGrid>
                            </EmptyChartContainer>
                        </ChartSection>
                        
                        {/* Enhanced Data Section. */}
                        {(account.balance_change_30d !== null || account.growth_percentage_30d !== null || 
                          account.net_worth_contribution !== null || account.percentage_of_total_assets !== null) && (
                            <EnhancedDataSection>
                                <MetadataTitle>Financial Impact & Growth</MetadataTitle>
                                <TitleDivider />
                                {/* Growth Data */}
                                {(account.balance_change_30d !== null || account.growth_percentage_30d !== null) && (
                                    <GrowthDataGrid>
                                        <GrowthDataItem>
                                            <GrowthDataLabel>30-Day Change</GrowthDataLabel>
                                            <RightSide>
                                                <GrowthDataValue $positive={account.balance_change_30d > 0}>
                                                    {account.balance_change_30d !== null 
                                                        ? formatCurrency(account.balance_change_30d)
                                                        : 'N/A'
                                                    }
                                                </GrowthDataValue>
                                                {account.growth_percentage_30d !== null && (
                                                    <GrowthPercentage $positive={account.growth_percentage_30d > 0}>
                                                        {account.growth_percentage_30d > 0 ? '+' : ''}{account.growth_percentage_30d.toFixed(1)}%
                                                    </GrowthPercentage>
                                                )}
                                            </RightSide>
                                        </GrowthDataItem>
                                        
                                        <GrowthDataItem>
                                            <GrowthDataLabel>90-Day Change</GrowthDataLabel>
                                            <RightSide>
                                                <GrowthDataValue $positive={account.balance_change_90d > 0}>
                                                    {account.balance_change_90d !== null 
                                                        ? formatCurrency(account.balance_change_90d)
                                                        : 'N/A'
                                                    }
                                                </GrowthDataValue>
                                                {account.growth_percentage_90d !== null && (
                                                    <GrowthPercentage $positive={account.growth_percentage_90d > 0}>
                                                        {account.growth_percentage_90d > 0 ? '+' : ''}{account.growth_percentage_90d.toFixed(1)}%
                                                    </GrowthPercentage>
                                                )}
                                            </RightSide>
                                        </GrowthDataItem>
                                    </GrowthDataGrid>
                                )}
                                
                                {/* Financial Impact. */}
                                <FinancialImpactGrid>
                                    <FinancialImpactItem>
                                        <FinancialImpactLabel>Net Worth Impact</FinancialImpactLabel>
                                        <FinancialImpactValue $positive={account.net_worth_contribution > 0}>
                                            {formatCurrency(account.net_worth_contribution)}
                                        </FinancialImpactValue>
                                    </FinancialImpactItem>
                                    
                                    {account.percentage_of_total_assets !== null && (
                                        <FinancialImpactItem>
                                            <FinancialImpactLabel>% of Total Assets</FinancialImpactLabel>
                                            <FinancialImpactValue $positive={true}>
                                                {account.percentage_of_total_assets.toFixed(1)}%
                                            </FinancialImpactValue>
                                        </FinancialImpactItem>
                                    )}
                                    
                                    {account.percentage_of_total_liabilities !== null && (
                                        <FinancialImpactItem>
                                            <FinancialImpactLabel>% of Total Liabilities</FinancialImpactLabel>
                                            <FinancialImpactValue $positive={false}>
                                                {account.percentage_of_total_liabilities.toFixed(1)}%
                                            </FinancialImpactValue>
                                        </FinancialImpactItem>
                                    )}
                                </FinancialImpactGrid>
                                
                                {/* Health Indicators. */}
                                {(account.utilization_rate !== null || account.days_since_last_transaction !== null) && (
                                    <HealthIndicatorsGrid>
                                        {account.utilization_rate !== null && (
                                            <HealthIndicatorItem>
                                                <HealthIndicatorLabel>Credit Utilization</HealthIndicatorLabel>
                                                <HealthIndicatorValue $warning={account.utilization_rate > 30}>
                                                    {account.utilization_rate.toFixed(1)}%
                                                </HealthIndicatorValue>
                                            </HealthIndicatorItem>
                                        )}
                                        
                                        {account.days_since_last_transaction !== null && (
                                            <HealthIndicatorItem>
                                                <HealthIndicatorLabel>Days Since Last Transaction</HealthIndicatorLabel>
                                                <HealthIndicatorValue $warning={account.days_since_last_transaction > 30}>
                                                    {account.days_since_last_transaction} days
                                                </HealthIndicatorValue>
                                            </HealthIndicatorItem>
                                        )}
                                    </HealthIndicatorsGrid>
                                )}
                            </EnhancedDataSection>
                        )}
                    </RightColumn>
                </CardExpanded>
            )}
        </Card>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Account Card.

const AccountIcon = styled.div`
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    flex-shrink: 0;
    transition: all 0.3s ease;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--button-primary), var(--amount-positive));
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }
    
    &:hover::after {
        opacity: 0.3;
    }
`;

const BalanceAmount = styled.div`
    font-size: clamp(1.8rem, 4vw, 2.2rem);
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    position: relative;
    cursor: pointer;
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 3px solid transparent;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    cursor: pointer;
    overflow: hidden;
    width: 100%;
    
    ${props => !props.$expanded && `
    &:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
            
            ${AccountIcon} {
              transform: scale(1.3) rotate(5deg);
    }
        }
    `}
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
    position: relative;
    overflow: hidden;
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
    border-top: 2px solid rgba(100, 100, 100, 0.2);
    display: flex;
    gap: 2rem;
    align-items: stretch;
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
        flex-direction: column;
        gap: 1.5rem;
    }
`;

// -------------------------------------------------------- Left Column.
const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 2;
    min-height: 100%;
`;

// -------------------------------------------------------- Right Column.
const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 3;
    min-height: 100%;
`;

// -------------------------------------------------------- Chart Section.
const ChartSection = styled.div`
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    flex: 1;
    display: flex;
    flex-direction: column;
`;

// -------------------------------------------------------- Chart Placeholder.
const EmptyChartContainer = styled.div`
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
`;

const YAxisTitle = styled.div`
    position: absolute;
    top: 50%;
    left: -10px;
    transform: translateY(-50%) rotate(-90deg);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    z-index: 5;
`;

const XAxisTitle = styled.div`
    position: absolute;
    bottom: 7.5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    z-index: 5;
`;

const EmptyChartGrid = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
`;

const YAxisLabels = styled.div`
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 0.5rem;
    align-items: flex-end;
`;

const YAxisLabel = styled.span`
    font-size: 0.7rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const ChartArea = styled.div`
    grid-row: 1 / 2;
    grid-column: 2 / 3;
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
`;

const GridLines = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const GridLine = styled.div`
    height: 1px;
    background: rgba(100, 100, 100, 0.1);
    width: 100%;
`;

const EmptyTooltip = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 10;
    border: 1px solid rgba(100, 100, 100, 0.1);
`;

const TooltipIcon = styled.div`
    font-size: 2rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    opacity: 0.7;
`;

const TooltipText = styled.p`
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.3;
    max-width: 150px;
    font-weight: 500;
`;

const XAxisLabels = styled.div`
    grid-row: 2 / 3;
    grid-column: 2 / 3;
    display: flex;
    justify-content: space-between;
    padding-top: 0.5rem;
`;

const XAxisLabel = styled.span`
    font-size: 0.7rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

// -------------------------------------------------------- Metadata Column.

const MetadataSection = styled.div`
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const MetadataTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    width: max-content;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    padding-bottom: 0.75rem;
`;

const TitleDivider = styled.div`
    width: 100%;
    height: 2px;
    border-radius: 50%;
    background: rgba(100, 100, 100, 0.2);
    margin: 0 0 0.5rem 0;
`;

const MetadataGrid = styled.div`
    display: grid;
    gap: 0.75rem;
    flex: 1;
`;

const MetadataItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.1rem 1rem;
    border-radius: 10px;
    transition: all 0.2s ease;
`;

const MetadataLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
`;

const MetadataValue = styled.span`
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
    background: rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    text-align: left;
    border: 1px solid rgba(0, 0, 0, 0.1);
    word-break: break-word;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
`;

// -------------------------------------------------------- Balance Details Section.
const BalanceDetailsSection = styled(MetadataSection)`
    flex: 1;
`;

const BalanceDetailsGrid = styled.div`
    display: grid;
    gap: 1.25rem;
    flex: 1;
`;

const BalanceDetailItem = styled(MetadataItem)`
`;

const BalanceDetailValue = styled(MetadataValue)`
    color: ${props => props.$positive ? 'var(--amount-positive)' : 'var(--text-secondary)'};
    font-weight: 700;
    font-size: 1.4rem;
`;



// -------------------------------------------------------- Enhanced Data Section.
const EnhancedDataSection = styled(MetadataSection)`
    position: relative;
    flex: 1;
`;

const GrowthDataGrid = styled.div`
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    flex: 1;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -0.75rem;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(100, 100, 100, 0.2), transparent);
    }
`;

const GrowthDataItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.4);
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, var(--button-primary), var(--amount-positive));
        border-radius: 12px 0 0 12px;
    }
`;

const RightSide = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
`;

const GrowthDataLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const GrowthDataValue = styled.span`
    color: ${props => props.$positive ? 'var(--amount-positive)' : 'var(--amount-negative)'};
    font-weight: 700;
    font-size: 1.1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const GrowthPercentage = styled.span`
    background: ${props => props.$positive ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
    color: ${props => props.$positive ? 'rgb(40, 167, 69)' : 'rgb(220, 53, 69)'};
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid ${props => props.$positive ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FinancialImpactGrid = styled.div`
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    flex: 1;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -0.75rem;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(100, 100, 100, 0.2), transparent);
    }
`;

const FinancialImpactItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.4);
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, var(--button-primary), var(--amount-positive));
        border-radius: 12px 0 0 12px;
    }
`;

const FinancialImpactLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
`;

const FinancialImpactValue = styled.span`
    color: ${props => props.$positive ? 'var(--amount-positive)' : 'var(--amount-negative)'};
    font-weight: 700;
    font-size: 1.1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const HealthIndicatorsGrid = styled.div`
    display: grid;
    gap: 1rem;
    position: relative;
    flex: 1;
`;

const HealthIndicatorItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.4);
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: ${props => props.$warning ? 'linear-gradient(180deg, #ffc107, #dc3545)' : 'linear-gradient(180deg, var(--button-primary), var(--amount-positive))'};
        border-radius: 12px 0 0 12px;
    }
`;

const HealthIndicatorLabel = styled.span`
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const HealthIndicatorValue = styled.span`
    color: ${props => props.$warning ? 'var(--amount-negative)' : 'var(--amount-positive)'};
    font-weight: 700;
    font-size: 1.1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

// -------------------------------------------------------- Export The AccountCard Component.
export default AccountCard;
