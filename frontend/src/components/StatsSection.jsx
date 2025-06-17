// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useEffect, useState } from 'react';

// Local Imports.
import { getStats } from '../services/api';

// -------------------------------------------------------- StatsSection Component.
const StatsSection = () => {
    // Account States.
    const [accounts, setAccounts] = useState([]);   // State 4 Account Data.

    // Stats States.
    const [stats, setStats] = useState({});         // State 4 Stats Data.

    // Loading State.
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------- Handle Stats Import.
    const importStats = async () => {
        try {
            setLoading(true);
            const res = await getStats();
            setStats(res.data);
        } catch (err) {
            console.log("ERROR IMPORTING STATS");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------- Get Accounts.
    const getAccounts = async () => {
        const res = await getAccounts();
        setAccounts(res.data);
    }

    // Use Effect To Import Stats & Accounts.
    useEffect(() => {
        importStats();
        getAccounts();
    }, []);

    // -------------------------------------------------------- Calculate Monthly Spending.
    const getMonthlySpending = () => {
        // This is a placeholder - in the future we could add a monthly stats endpoint
        // For now, we'll use a simple calculation based on top categories
        if (stats.top_categories && stats.top_categories.length > 0) {
            const totalSpending = stats.top_categories.reduce((sum, cat) => {
                return sum + (cat.total_amount < 0 ? Math.abs(cat.total_amount) : 0);
            }, 0);
            return totalSpending;
        }
        return 0;
    };

    // -------------------------------------------------------- Format Currency.
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // -------------------------------------------------------- Get Personalized Message.
    const getNetWorthMessage = (netWorth) => {
        if (netWorth < 0) {
            return "No worries! We can help get you back on track. 💪";
        } else if (netWorth < 10000) {
            return "Great start! Let's build on this foundation 🚀";
        } else if (netWorth < 50000) {
            return "You're doing well! Let's maximize your potential ⭐";
        } else {
            return "Excellent progress! Let's optimize your strategy 🌟";
        }
    };

    // -------------------------------------------------------- Get Assets Message.
    const getAssetsMessage = (assets) => {
        if (assets < 1000) {
            return "Starting your financial journey 🌱";
        } else if (assets < 10000) {
            return "Building your financial foundation 🏗️";
        } else if (assets < 50000) {
            return "Looking great! Let's make it even better! 📈";
        } else {
            return "Impressive! Let's keep this momentum going! 🎯";
        }
    };

    // -------------------------------------------------------- Get Liabilities Message.
    const getLiabilitiesMessage = (liabilities) => {
        if (liabilities === 0) {
            return "Debt-free! You're crushing it! 🎉";
        } else if (liabilities < 5000) {
            return "Minimal debt - you're on the right track! 💫";
        } else if (liabilities < 20000) {
            return "Let's work on reducing this together! 🤝";
        } else {
            return "We've got your back - let's tackle this! 💪";
        }
    };

    // -------------------------------------------------------- Get Cash Flow Message.
    const getCashFlowMessage = (cashFlow) => {
        if (cashFlow > 1000) {
            return "Excellent cash flow! Keep it up! 💫";
        } else if (cashFlow > 0) {
            return "Positive cash flow - you're on track! 📈";
        } else if (cashFlow > -1000) {
            return "Slight negative flow - we can fix this! 💪";
        } else {
            return "Let's work on improving your cash flow! 🎯";
        }
    };

    return (
        <StatsWrapper>      
            {/* Interactive Welcome Header. */}
            <WelcomeHeader>
                <WelcomeContent>
                    <WelcomeGreeting>
                        <GreetingText>Hey,</GreetingText>
                        <UserName>Guest</UserName>
                        <WavingHand>👋</WavingHand>
                    </WelcomeGreeting>
                    <IntroStatement>
                        <WelcomeTitle>Welcome to Centi.</WelcomeTitle>
                        <WelcomeConfetti>🎉</WelcomeConfetti> 
                    </IntroStatement>

                    <WelcomeSubtitle>We've got your finances lined up—let's take a look.</WelcomeSubtitle>
                </WelcomeContent>
            </WelcomeHeader>

            {/* Stats Cards Grid. */}
            <BasicStats>
                <StatsGrid>
                    <StatCard>
                        <StatLabel>Net Worth</StatLabel>
                        <StatValue>
                            {stats?.totals?.net_worth 
                                ? formatCurrency(stats.totals.net_worth)
                                : formatCurrency(0)}
                        </StatValue>
                        <StatMessage>
                            {stats?.totals?.net_worth 
                                ? getNetWorthMessage(stats.totals.net_worth)
                                : "Let's start tracking your financial journey! 🌟"}
                        </StatMessage>
                    </StatCard>

                    <StatCard>
                        <StatLabel>Total Assets</StatLabel>
                        <StatValue style={{ color: 'rgb(40, 167, 69)' }}>
                            {stats?.totals?.total_assets 
                                ? formatCurrency(stats.totals.total_assets)
                                : formatCurrency(0)}
                        </StatValue>
                        <StatMessage>
                            {stats?.totals?.total_assets 
                                ? getAssetsMessage(stats.totals.total_assets)
                                : "Starting fresh! 🌱"}
                        </StatMessage>
                    </StatCard>

                    <StatCard>
                        <StatLabel>Total Liabilities</StatLabel>
                        <StatValue style={{ color: 'rgb(220, 53, 69)' }}>
                            {stats?.totals?.total_liabilities 
                                ? formatCurrency(stats.totals.total_liabilities)
                                : formatCurrency(0)}
                        </StatValue>
                        <StatMessage>
                            {stats?.totals?.total_liabilities 
                                ? getLiabilitiesMessage(stats.totals.total_liabilities)
                                : "No current liabilities! 🎉"}
                        </StatMessage>
                    </StatCard>

                    <StatCard>
                        <StatLabel>Monthly Cash Flow</StatLabel>
                        <StatValue style={{ 
                            color: stats?.cash_flow?.last_30_days > 0 
                                ? 'rgb(40, 167, 69)' 
                                : 'rgb(220, 53, 69)'
                        }}>
                            {stats?.cash_flow?.last_30_days 
                                ? formatCurrency(stats.cash_flow.last_30_days)
                                : formatCurrency(0)}
                        </StatValue>
                        <StatMessage>
                            {stats?.cash_flow?.last_30_days 
                                ? getCashFlowMessage(stats.cash_flow.last_30_days)
                                : "Let's track your cash flow! 📊"}
                        </StatMessage>
                    </StatCard>
                </StatsGrid>
            </BasicStats>
        </StatsWrapper>
    );
}

// -------------------------------------------------------- Wrapper For Stats Section.
const StatsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;
    margin-bottom: 2rem;
`
// -------------------------------------------------------- Welcome Section.
const WelcomeHeader = styled.div`
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    padding: 0.5rem 0rem 0rem 0rem;
    
    &:active {
        transform: translateY(0);
    }
`
const WelcomeContent = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
`
// -------------------------------------------------------- Greeting (Hey, {UserName}).
const WelcomeGreeting = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0rem;
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0;
    color: rgb(100, 100, 100);
`
const GreetingText = styled.span`
    color: var(--text-secondary);
    font-weight: 500;
`
const UserName = styled.span`
    color: var(--text-primary);
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`
// -------------------------------------------------------- Intro Statement (Welcome to Centi.).
const IntroStatement = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    padding: 0.25rem 0rem 0rem 0rem;
    margin-top: -0.5rem;
`
const WelcomeTitle = styled.div`
    padding: 1.5rem 0rem;
    font-size: 4.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`
const WelcomeConfetti = styled.div`
    font-size: 5rem;
`
const WelcomeSubtitle = styled.p`
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-secondary);
    font-weight: 400;
    padding-left: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`
// -------------------------------------------------------- Stats Section.
const BasicStats = styled.div`
    width: 100%;
    padding: 1rem 0rem;
    margin-top: 2rem;
`

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.75rem;
    width: 100%;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`
// -------------------------------------------------------- Stat Card.
const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    display: flex;
    flex-direction: column;
    align-items: center;
    
    &:hover {
        transform: translateY(-5px);
        border-color: var(--button-primary);
        box-shadow: 0 8px 12px rgba(65, 173, 255, 0.1);
    }
`
const StatLabel = styled.div`
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
`
const StatValue = styled.div`
    font-size: clamp(1.5rem, 4vw, 2.3rem);
    font-weight: 700;
    margin: 0.5rem 0;
    padding-bottom: 0.75rem;
    width: 80%;
    text-align: center;
    border-bottom: 4px solid rgba(100, 100, 100, 0.1);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`
// -------------------------------------------------------- Customized Stat Message (e.g. "Let's start tracking your financial journey!").
const StatMessage = styled.div`
    font-size: 1.2rem;
    color: var(--text-primary);
    margin: 0.75rem 0;
    font-weight: 500;
    text-align: center;
    line-height: 1.4;
`
// -------------------------------------------------------- Waving Hand Emoji.
const WavingHand = styled.span`
    display: inline-block;
    animation: wave 2.5s infinite;
    transform-origin: 70% 70%;
    font-size: 2.25rem;
    
    @keyframes wave {
        0% { transform: rotate(0deg); }
        10% { transform: rotate(14deg); }
        20% { transform: rotate(-8deg); }
        30% { transform: rotate(14deg); }
        40% { transform: rotate(-4deg); }
        50% { transform: rotate(10deg); }
        60% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
    }
`

export default StatsSection;