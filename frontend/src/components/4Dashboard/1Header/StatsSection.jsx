// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// -------------------------------------------------------- StatsSection Component.
const StatsSection = ({ myStats }) => {
    // Account States.
    const [stats, setStats] = useState({});         // State 4 Stats Data.

    // Loading State.
    const [loading, setLoading] = useState(true);           // State 4 Loading State.

    // Explanation State.
    const [explanationVisible, setExplanationVisible] = useState({});   // State 4 Explanation Visibility.

    // User State.
    const [userName, setUserName] = useState('Guest');   // State 4 User Name.

    // -------------------------------------------------------- Get User Name From Local Storage.
    const getUserName = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.first_name) {
                    return user.first_name;
                }
            }
        } catch (error) {
            console.error('Error getting user name from localStorage:', error);
        }
        return 'Guest';
    };

    // -------------------------------------------------------- Handle Stats Import.
    const importStats = async () => {
        try {
            setLoading(true);
            if (!myStats) {
                console.warn('StatsSection: No data prop received');
                setStats({});
            } else if (Object.keys(myStats).length === 0) {
                console.warn('StatsSection: Empty data object received');
                setStats({});
            } else {
                setStats(myStats);
            }
        } catch (err) {
            console.error("ERROR IMPORTING STATS:", err);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------- Use Effect To Import Stats & Accounts.
    useEffect(() => {
        importStats();
        // Set user name from localStorage
        setUserName(getUserName());
    }, [myStats]);

    // -------------------------------------------------------- Calculate Monthly Spending. (Later Implementation...)
    const getMonthlySpending = () => {
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

    // -------------------------------------------------------- Calculate Growth Percentage.
    const getGrowthData = (statId) => {
        // Get Growth Data.
        if (!stats?.totals?.growth) return { percentage: 0, amount: 0, hasHistoricalData: false };
        
        // Set Growth Data.
        const growthData = stats.totals.growth;
        const snapshots = stats.snapshots;
        const hasHistoricalData = snapshots?.has_historical_data || false;
        
        // Get Current Values.
        const currentValues = {
            netWorth: stats?.totals?.net_worth || 0,
            totalAssets: stats?.totals?.total_assets || 0,
            totalLiabilities: stats?.totals?.total_liabilities || 0,
            monthlyCashFlow: stats?.cash_flow?.this_month || 0
        };
        
        // Get Previous Values from snapshots if available
        const previousValues = {
            netWorth: snapshots?.previous_month?.net_worth || 0,
            totalAssets: snapshots?.previous_month?.total_assets || 0,
            totalLiabilities: snapshots?.previous_month?.total_liabilities || 0,
            monthlyCashFlow: snapshots?.previous_month?.monthly_cash_flow || 0
        };
        
        // Calculate Dollar Amount Change based on actual previous values
        const getAmountChange = (currentValue, previousValue) => {
            return currentValue - previousValue;
        };
        
        // Return Growth Data Based On Stat ID.
        switch (statId) {
            case 'netWorth':
                return {
                    percentage: growthData.net_worth || 0,
                    amount: getAmountChange(currentValues.netWorth, previousValues.netWorth),
                    hasHistoricalData,
                    previousValue: previousValues.netWorth
                };
            case 'totalAssets':
                return {
                    percentage: growthData.total_assets || 0,
                    amount: getAmountChange(currentValues.totalAssets, previousValues.totalAssets),
                    hasHistoricalData,
                    previousValue: previousValues.totalAssets
                };
            case 'totalLiabilities':
                return {
                    percentage: growthData.total_liabilities || 0,
                    amount: getAmountChange(currentValues.totalLiabilities, previousValues.totalLiabilities),
                    hasHistoricalData,
                    previousValue: previousValues.totalLiabilities
                };
            case 'monthlyCashFlow':
                return {
                    percentage: growthData.monthly_cash_flow || 0,
                    amount: getAmountChange(currentValues.monthlyCashFlow, previousValues.monthlyCashFlow),
                    hasHistoricalData,
                    previousValue: previousValues.monthlyCashFlow
                };
            default:
                return { percentage: 0, amount: 0, hasHistoricalData: false };
        }
    };

    // -------------------------------------------------------- Return Stats Section UI.
    return (
        <StatsWrapper>      
            {/* Interactive Welcome Header. */}
            <WelcomeHeader>
                <WelcomeContent>
                    <WelcomeGreeting>
                        <GreetingText>Hey,</GreetingText>
                        <UserName>{userName}</UserName>
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
                            <GrowthIndicatorWrapper $isPositive={getGrowthData('netWorth').hasHistoricalData ? getGrowthData('netWorth').percentage > 0 : null}>
                                <GrowthIcon $isPositive={getGrowthData('netWorth').hasHistoricalData ? getGrowthData('netWorth').percentage > 0 : null}>
                                    {getGrowthData('netWorth').hasHistoricalData ? (
                                        getGrowthData('netWorth').percentage > 0 ? (
                                            <TrendingUp size={16} color="currentColor" />
                                        ) : (
                                            <TrendingDown size={16} color="currentColor" />
                                        )
                                    ) : (
                                        <Minus size={16} color="currentColor" />
                                    )}
                                </GrowthIcon>
                                <GrowthText>
                                    {getGrowthData('netWorth').hasHistoricalData ? (
                                        <>
                                            {getGrowthData('netWorth').amount > 0 ? '+' : ''}{formatCurrency(Math.abs(getGrowthData('netWorth').amount))} ({getGrowthData('netWorth').percentage > 0 ? '+' : ''}{getGrowthData('netWorth').percentage.toFixed(1)}%)
                                        </>
                                    ) : (
                                        '0.0% (First Month)'
                                    )}
                                </GrowthText>
                            </GrowthIndicatorWrapper>
                        </StatContent>
                        <StatExplanation className={explanationVisible['netWorth'] ? 'visible' : ''}>
                            Your net worth is everything you own — like cash, accounts, and investments — minus what you owe. It's a quick way to see your overall financial picture.
                            {getGrowthData('netWorth').hasHistoricalData && (
                                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                                    Last month: {formatCurrency(getGrowthData('netWorth').previousValue)}
                                </div>
                            )}
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
                            <GrowthIndicatorWrapper $isPositive={getGrowthData('totalAssets').hasHistoricalData ? getGrowthData('totalAssets').percentage > 0 : null}>
                                <GrowthIcon $isPositive={getGrowthData('totalAssets').hasHistoricalData ? getGrowthData('totalAssets').percentage > 0 : null}>
                                    {getGrowthData('totalAssets').hasHistoricalData ? (
                                        getGrowthData('totalAssets').percentage > 0 ? (
                                            <TrendingUp size={16} color="currentColor" />
                                        ) : (
                                            <TrendingDown size={16} color="currentColor" />
                                        )
                                    ) : (
                                        <Minus size={16} color="currentColor" />
                                    )}
                                </GrowthIcon>
                                <GrowthText>
                                    {getGrowthData('totalAssets').hasHistoricalData ? (
                                        <>
                                            {getGrowthData('totalAssets').amount > 0 ? '+' : ''}{formatCurrency(Math.abs(getGrowthData('totalAssets').amount))} ({getGrowthData('totalAssets').percentage > 0 ? '+' : ''}{getGrowthData('totalAssets').percentage.toFixed(1)}%)
                                        </>
                                    ) : (
                                        '0.0% (First Month)'
                                    )}
                                </GrowthText>
                            </GrowthIndicatorWrapper>
                        </StatContent>
                        <StatExplanation className={explanationVisible['totalAssets'] ? 'visible' : ''}>
                        Your total assets are everything you own that adds value — like your bank accounts, investments, and anything else that boosts your financial worth.
                        {getGrowthData('totalAssets').hasHistoricalData && (
                            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                                Last month: {formatCurrency(getGrowthData('totalAssets').previousValue)}
                            </div>
                        )}
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
                            <GrowthIndicatorWrapper $isPositive={getGrowthData('totalLiabilities').hasHistoricalData ? getGrowthData('totalLiabilities').percentage < 0 : null}>
                                <GrowthIcon $isPositive={getGrowthData('totalLiabilities').hasHistoricalData ? getGrowthData('totalLiabilities').percentage < 0 : null}>
                                    {getGrowthData('totalLiabilities').hasHistoricalData ? (
                                        getGrowthData('totalLiabilities').percentage < 0 ? (
                                            <TrendingUp size={16} color="currentColor" />
                                        ) : (
                                            <TrendingDown size={16} color="currentColor" />
                                        )
                                    ) : (
                                        <Minus size={16} color="currentColor" />
                                    )}
                                </GrowthIcon>
                                <GrowthText>
                                    {getGrowthData('totalLiabilities').hasHistoricalData ? (
                                        <>
                                            {getGrowthData('totalLiabilities').amount > 0 ? '+' : ''}{formatCurrency(Math.abs(getGrowthData('totalLiabilities').amount))} ({getGrowthData('totalLiabilities').percentage > 0 ? '+' : ''}{getGrowthData('totalLiabilities').percentage.toFixed(1)}%)
                                        </>
                                    ) : (
                                        '0.0% (First Month)'
                                    )}
                                </GrowthText>
                            </GrowthIndicatorWrapper>
                        </StatContent>
                        <StatExplanation className={explanationVisible['totalLiabilities'] ? 'visible' : ''}>
                            Your total liabilities are what you owe — like credit cards, loans, or any other money you still need to pay back.
                            {getGrowthData('totalLiabilities').hasHistoricalData && (
                                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                                    Last month: {formatCurrency(getGrowthData('totalLiabilities').previousValue)}
                                </div>
                            )}
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
                            <GrowthIndicatorWrapper $isPositive={getGrowthData('monthlyCashFlow').hasHistoricalData ? getGrowthData('monthlyCashFlow').percentage > 0 : null}>
                                <GrowthIcon $isPositive={getGrowthData('monthlyCashFlow').hasHistoricalData ? getGrowthData('monthlyCashFlow').percentage > 0 : null}>
                                    {getGrowthData('monthlyCashFlow').hasHistoricalData ? (
                                        getGrowthData('monthlyCashFlow').percentage > 0 ? (
                                            <TrendingUp size={16} color="currentColor" />
                                        ) : (
                                            <TrendingDown size={16} color="currentColor" />
                                        )
                                    ) : (
                                        <Minus size={16} color="currentColor" />
                                    )}
                                </GrowthIcon>
                                <GrowthText>
                                    {getGrowthData('monthlyCashFlow').hasHistoricalData ? (
                                        <>
                                            {getGrowthData('monthlyCashFlow').amount > 0 ? '+' : ''}{formatCurrency(Math.abs(getGrowthData('monthlyCashFlow').amount))} ({getGrowthData('monthlyCashFlow').percentage > 0 ? '+' : ''}{getGrowthData('monthlyCashFlow').percentage.toFixed(1)}%)
                                        </>
                                    ) : (
                                        '0.0% (First Month)'
                                    )}
                                </GrowthText>
                            </GrowthIndicatorWrapper>
                        </StatContent>
                        <StatExplanation className={explanationVisible['monthlyCashFlow'] ? 'visible' : ''}>
                        Monthly cash flow shows how much money you have left after covering your expenses. If it's positive, you're spending less than you make this month.
                        {getGrowthData('monthlyCashFlow').hasHistoricalData && (
                            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                                Last month: {formatCurrency(getGrowthData('monthlyCashFlow').previousValue)}
                            </div>
                        )}
                        </StatExplanation>
                    </StatCard>
                </StatsGrid>
            </BasicStats>
        </StatsWrapper>
    );
}

// -------------------------------------------------------- Wrapper For Stats Section.
const StatsWrapper = styled.div`
    width: 90%;
    margin-top: 2rem;
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
    font-size: 3rem;
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
// -------------------------------------------------------- Intro Statement (Welcome to Centi. 🎉).
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
// -------------------------------------------------------- Stat Label. (Title Of Card)
const StatLabel = styled.div`
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
    margin-bottom: 0.5rem;
`

// -------------------------------------------------------- Stat Question Icon. (Clickable Question Icon)
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
// -------------------------------------------------------- Stat Content. (Value & Growth Indicator)
const StatContent = styled.div`
    width: 100%;
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateY(0);
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    
    &.hidden {
        opacity: 0;
        transform: translateY(-70%);
    }
`
// -------------------------------------------------------- Stat Explanation. (Explanation Of Card After Clicking Question Icon)
const StatExplanation = styled.div`
    width: 100%;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(10%);
    position: absolute;
    top: 50%;
    left: 0;
    padding: 2rem;
    text-align: justify;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.4;
    z-index: 1;
    
    &.visible {
        opacity: 1;
        transform: translateY(-50%);
    }
`

// -------------------------------------------------------- Stat Value. (Value Of Card)
const StatValue = styled.div`
    font-size: clamp(1.5rem, 4vw, 2.9rem);
    font-weight: 700;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 4px solid rgba(100, 100, 100, 0.3);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`
// -------------------------------------------------------- Waving Hand Emoji. (👋)
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

// -------------------------------------------------------- Growth Indicator Component.
const GrowthIndicatorWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    align-self: center;
    gap: 0.25rem;
    background: ${props => {
        if (props.$isPositive === null) return 'rgba(100, 100, 100, 0.1)';
        return props.$isPositive 
            ? 'rgba(40, 167, 69, 0.1)' 
            : 'rgba(220, 53, 69, 0.1)';
    }};
    color: ${props => {
        if (props.$isPositive === null) return 'rgb(100, 100, 100)';
        return props.$isPositive 
            ? 'rgb(40, 167, 69)' 
            : 'rgb(220, 53, 69)';
    }};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.5rem;
    border: 1px solid ${props => {
        if (props.$isPositive === null) return 'rgba(100, 100, 100, 0.2)';
        return props.$isPositive 
            ? 'rgba(40, 167, 69, 0.2)' 
            : 'rgba(220, 53, 69, 0.2)';
    }};
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px ${props => {
            if (props.$isPositive === null) return 'rgba(100, 100, 100, 0.2)';
            return props.$isPositive 
                ? 'rgba(40, 167, 69, 0.2)' 
                : 'rgba(220, 53, 69, 0.2)';
        }};
    }
`;

// -------------------------------------------------------- Growth Icon. (Up/Down Arrow)
const GrowthIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => {
        if (props.$isPositive === null) return 'rgba(100, 100, 100, 0.15)';
        return props.$isPositive 
            ? 'rgba(40, 167, 69, 0.15)' 
            : 'rgba(220, 53, 69, 0.15)';
    }};
    color: ${props => {
        if (props.$isPositive === null) return 'rgb(100, 100, 100)';
        return props.$isPositive 
            ? 'rgb(40, 167, 69)' 
            : 'rgb(220, 53, 69)';
    }};
    transition: all 0.2s ease;
    
    svg {
        transition: transform 0.2s ease;
    }
    
    ${GrowthIndicatorWrapper}:hover & {
        background: ${props => {
            if (props.$isPositive === null) return 'rgba(100, 100, 100, 0.25)';
            return props.$isPositive 
                ? 'rgba(40, 167, 69, 0.25)' 
                : 'rgba(220, 53, 69, 0.25)';
        }};
        
        svg {
            transform: scale(1.1);
        }
    }
`;

// -------------------------------------------------------- Growth Text. (Growth Percentage)
const GrowthText = styled.span`
    font-weight: 600;
    letter-spacing: 0.5px;
`;

export default StatsSection;