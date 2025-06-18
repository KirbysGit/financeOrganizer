// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useEffect, useState } from 'react';

// Local Imports.
import { getStats, getAccounts } from '../services/api';

// -------------------------------------------------------- StatsSection Component.
const StatsSection = () => {
    // Account States.
    const [accounts, setAccounts] = useState([]);   // State 4 Account Data.

    // Stats States.
    const [stats, setStats] = useState({});         // State 4 Stats Data.

    // Loading State.
    const [loading, setLoading] = useState(true);   // State 4 Loading State.

    // Explanation State.
    const [explanationVisible, setExplanationVisible] = useState({});

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
    const fetchAccounts = async () => {
        const res = await getAccounts();
        setAccounts(res.data);
    }

    // -------------------------------------------------------- Use Effect To Import Stats & Accounts.
    useEffect(() => {
        importStats();
        fetchAccounts();
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

    // -------------------------------------------------------- Toggle Explanation.
    const toggleExplanation = (statId) => {
        console.log(statId);
        setExplanationVisible(prev => ({
            ...prev,
            [statId]: !prev[statId]
        }));
    };

    // -------------------------------------------------------- Return Stats Section.
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
                        <StatQuestionIcon 
                                onClick={() => toggleExplanation('netWorth')}
                        >?</StatQuestionIcon>
                        <StatCardHeader className={explanationVisible['netWorth'] ? 'hidden' : ''}>
                            <StatLabel>Net Worth</StatLabel>
                        </StatCardHeader>
                        <StatContent className={explanationVisible['netWorth'] ? 'hidden' : ''}>
                            <StatValue>
                                {stats?.totals?.net_worth 
                                    ? formatCurrency(stats.totals.net_worth)
                                    : formatCurrency(0)}
                            </StatValue>
                        </StatContent>
                        <StatExplanation className={explanationVisible['netWorth'] ? 'visible' : ''}>
                            Your net worth is everything you own — like cash, accounts, and investments — minus what you owe. It's a quick way to see your overall financial picture.
                        </StatExplanation>
                    </StatCard>

                    <StatCard>
                        <StatQuestionIcon 
                                onClick={() => toggleExplanation('totalAssets')}
                        >?</StatQuestionIcon>
                        <StatCardHeader className={explanationVisible['totalAssets'] ? 'hidden' : ''}>
                            <StatLabel>Total Assets</StatLabel>
                        </StatCardHeader>
                        <StatContent className={explanationVisible['totalAssets'] ? 'hidden' : ''}>
                            <StatValue style={{ color: 'rgb(40, 167, 69)' }}>
                                {stats?.totals?.total_assets 
                                    ? formatCurrency(stats.totals.total_assets)
                                    : formatCurrency(0)}
                            </StatValue>
                        </StatContent>
                        <StatExplanation className={explanationVisible['totalAssets'] ? 'visible' : ''}>
                        Your total assets are everything you own that adds value — like your bank accounts, investments, and anything else that boosts your financial worth.
                        </StatExplanation>
                    </StatCard>

                    <StatCard>
                        <StatQuestionIcon 
                                onClick={() => toggleExplanation('totalLiabilities')}
                        >?</StatQuestionIcon>
                        <StatCardHeader className={explanationVisible['totalLiabilities'] ? 'hidden' : ''}>
                            <StatLabel>Total Liabilities</StatLabel>
                        </StatCardHeader>
                        <StatContent className={explanationVisible['totalLiabilities'] ? 'hidden' : ''}>
                            <StatValue style={{ color: 'rgb(220, 53, 69)' }}>
                                {stats?.totals?.total_liabilities 
                                    ? formatCurrency(stats.totals.total_liabilities)
                                    : formatCurrency(0)}
                            </StatValue>
                        </StatContent>
                        <StatExplanation className={explanationVisible['totalLiabilities'] ? 'visible' : ''}>
                            Your total liabilities are what you owe — like credit cards, loans, or any other money you still need to pay back.
                        </StatExplanation>
                    </StatCard>

                    <StatCard>
                        <StatQuestionIcon 
                                onClick={() => toggleExplanation('monthlyCashFlow')}
                        >?</StatQuestionIcon>
                        <StatCardHeader className={explanationVisible['monthlyCashFlow'] ? 'hidden' : ''}>
                            <StatLabel>Monthly Cash Flow</StatLabel>
                        </StatCardHeader>
                        <StatContent className={explanationVisible['monthlyCashFlow'] ? 'hidden' : ''}>
                            <StatValue style={{ 
                                color: stats?.cash_flow?.this_month > 0 
                                    ? 'rgb(40, 167, 69)' 
                                    : 'rgb(220, 53, 69)'
                            }}>
                                {stats?.cash_flow?.this_month 
                                    ? formatCurrency(stats.cash_flow.this_month)
                                    : formatCurrency(0)}
                            </StatValue>
                        </StatContent>
                        <StatExplanation className={explanationVisible['monthlyCashFlow'] ? 'visible' : ''}>
                        Monthly cash flow shows how much money you have left after covering your expenses. If it’s positive, you're spending less than you make this month.
                        </StatExplanation>
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
    position: relative;
    min-height: 200px;

    
    &:hover {
        transform: translateY(-5px);
        border-color: var(--button-primary);
        box-shadow: 0 8px 12px rgba(65, 173, 255, 0.1);
    }
`

// -------------------------------------------------------- Stat Card Header.
const StatCardHeader = styled.div`
    width: 100%;
    padding: 0.5rem 0rem;
    transition: all 0.3s ease;
    transform: translateY(0);
    opacity: 1;
    
    &.hidden {
        transform: translateY(-20px);
        opacity: 0;
    }
`
const StatLabel = styled.div`
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
    margin-bottom: 0.5rem;
`

const StatQuestionIcon = styled.div`
    display: flex;
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    border-radius: 50%;
    border: 2px solid transparent;
    justify-content: center;
    align-items: center;
    width: 26px;
    height: 26px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 9;
    
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    color: white;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1) rotate(9deg);
        color: rgba(255, 255, 255, 0.85);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
`

const StatContent = styled.div`
    width: 100%;
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateY(0);
    display: flex;
    justify-content: center;
    text-align: center;
    
    &.hidden {
        opacity: 0;
        transform: translateY(-70%);
    }
`

const StatExplanation = styled.div`
    width: 100%;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(30%);
    position: absolute;
    top: 50%;
    left: 0;
    padding: 2rem;
    text-align: justify;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.4;
    
    &.visible {
        opacity: 1;
        transform: translateY(-50%);
    }
`

const StatValue = styled.div`
    font-size: clamp(1.5rem, 4vw, 2.9rem);
    font-weight: 700;
    padding-bottom: 0.75rem;
    border-bottom: 4px solid rgba(100, 100, 100, 0.3);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
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