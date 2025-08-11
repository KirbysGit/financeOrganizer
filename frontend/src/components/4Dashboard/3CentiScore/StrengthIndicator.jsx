// StrengthIndicator.jsx

// This is the main component of the CentiScore component, it is the component that displays the user's
// Centi Score data in a card format. It also has a prompt card that displays a message to the user
// to calculate their score, and a loading card that displays a loading message to the user. It also
// has a results card that displays the user's Centi Score data in a card format.

// Imports.
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Local Imports.
import ResultsCard from './ResultsCard';
import { calculateWeeklyScore } from '../../../services/api';

// ------------------------------------------------------------------------------------------------ Strength Indicator Component.
const StrengthIndicator = ({ id, myStats, myCentiScore, myCentiScoreHistory, myCentiScoreGrowth, myCentiScoreTrend }) => {
    // State Management.
    const [score, setScore] = useState(null);                       // State 4 Storing Score.
    const [isLoading, setIsLoading] = useState(false);              // State 4 If Loading.
    const [loadingStage, setLoadingStage] = useState(0);            // State 4 Current Loading Stage.
    const [showPrompt, setShowPrompt] = useState(true);             // State 4 If Prompt Is Showing (e.g. Not Showing After Score Is Calculated).
    const [showResults, setShowResults] = useState(false);          // State 4 If Results Are Showing.
    const [loadingProgress, setLoadingProgress] = useState(0);      // State 4 Loading Progress.
    const [lastCalculated, setLastCalculated] = useState(null);     // State 4 When Score Was Last Calculated.
    const [scoreBreakdown, setScoreBreakdown] = useState(null);     // State 4 Score Breakdown.
    const [isWeeklyScore, setIsWeeklyScore] = useState(false);     // State 4 If Score Is From Weekly Tracking.
    const [nextUpdate, setNextUpdate] = useState(null);             // State 4 Next Update Time.
    const [countdown, setCountdown] = useState('');                 // State 4 Countdown Display.
    const [growthData, setGrowthData] = useState(null);             // State 4 Growth Analysis Data.

    // Check If There's Enough Data To Calculate A Score.
    const hasEnoughData = () => {
        // Check If We Have Stats With Meaningful Data.
        if (!myStats) {
            console.log('StrengthIndicator: myStats is null/undefined');
            return false;
        }
        
        // Check For Transactions, Accounts, Or Files.
        // The Backend Returns Totals.Transactions, Totals.Accounts, But We Need To Check If Totals Exists.
        const hasTransactions = myStats.totals?.transactions > 0;
        const hasAccounts = myStats.totals?.accounts > 0;
        const hasFiles = myStats.total_files > 0; // This Might Not Exist In The Backend Response.
        
        console.log('StrengthIndicator: Data checks:', {
            hasTransactions,
            hasAccounts,
            hasFiles,
            total_transactions: myStats.totals?.transactions,
            total_accounts: myStats.totals?.accounts,
            total_files: myStats.total_files
        });
        
        return hasTransactions || hasAccounts || hasFiles;
    };

    // Typewriter Tagline Messages.
    const stageMessages = [
        'Grabbing your data …',
        'Crunching the numbers …',
        'Building insights …',
    ];

    const [tagline, setTagline] = useState(stageMessages[0]);

    // Typewriter Effect For Loading Messages.
    useEffect(() => {
        if (isLoading && loadingStage > 0 && loadingStage <= stageMessages.length) {
            setTagline(stageMessages[loadingStage - 1]);
        }
    }, [loadingStage, isLoading]);

    // -------------------------------------------------------- Function 4 Getting Next Monday 12 AM.
    const getNextMonday12AM = () => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate Days Until Next Monday.
        let daysUntilNextMonday;
        if (currentDay === 1) { // If it's Monday
            daysUntilNextMonday = 7; // Next Monday is 7 days away
        } else {
            daysUntilNextMonday = (8 - currentDay) % 7; // Calculate days until next Monday
        }
        
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilNextMonday);
        nextMonday.setHours(0, 0, 0, 0); // Set To 12:00 AM.
        return nextMonday;
    };

    // -------------------------------------------------------- Function 4 Formatting Countdown.
    const formatCountdown = (targetDate) => {
        const now = new Date();

        const diff = targetDate - now;
        
        if (diff <= 0) return 'Updates soon';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days}d ${hours}h until next update`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m until next update`;
        } else {
            return `${minutes}m until next update`;
        }
    };

    // -------------------------------------------------------- Function 4 Updating Countdown.
    useEffect(() => {
        if (!nextUpdate) return;
        
        const updateCountdown = () => {
            setCountdown(formatCountdown(nextUpdate));
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update Every Minute.
        
        return () => clearInterval(interval);
    }, [nextUpdate]);

    // -------------------------------------------------------- Function 4 Loading Growth Data.
    const loadGrowthData = async () => {
        try {
            setGrowthData(myCentiScoreGrowth);
        } catch (error) {
            console.error('Error loading growth data:', error);
        }
    };

    // -------------------------------------------------------- Function 4 Calculating Score.
    const handleCalculateClick = async () => {
        // Start "Loading" Process.
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingStage(0);
        const startTime = Date.now();
        
        try {
            // Stage 1: Grabbing Your Data.
            setLoadingStage(1);
            setLoadingProgress(20);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Stage 2: Calculating The Score.
            setLoadingStage(2);
            setLoadingProgress(60);
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Stage 3: Generating Insights.
            setLoadingStage(3);
            setLoadingProgress(85);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Call Backend API To Calculate And Store Weekly Score.
            const response = await calculateWeeklyScore();
            const scoreData = response.data;
            
            // Ensure Minimum 3 Second Loading Time.
            const elapsedTime = Date.now() - startTime;
            const minimumLoadingTime = 3000; // 3 Seconds.
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            
            // If Remaining Time Is Greater Than 0, Set Loading Progress To 95% And Wait For Remaining Time.
            if (remainingTime > 0) {
                setLoadingProgress(95);
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // Set Loading Progress To 100% And Wait For 200ms.
            setLoadingProgress(100);
            await new Promise(resolve => setTimeout(resolve, 200));

            // Set Score And Show Results.
            setScore(scoreData.total_score);
            setShowResults(true);
            setLastCalculated(new Date(scoreData.created_at));
            
            // Set Next Update Time.
            setNextUpdate(getNextMonday12AM());
            
            // Load The Updated Score Data For Breakdown And Growth.
            await loadCurrentScore();
            await loadGrowthData();
            
        } catch (error) {
            console.error('Error calculating financial strength:', error);
        } finally {
            setIsLoading(false);
            setLoadingProgress(0);
            setLoadingStage(0);
        }
    };

    // -------------------------------------------------------- Load Current Score.
    const loadCurrentScore = async () => {
        try {
            if (myCentiScore && myCentiScore.score) {
                setScore(myCentiScore.score);
                setScoreBreakdown(myCentiScore.breakdown);
                setLastCalculated(myCentiScore.last_updated ? new Date(myCentiScore.last_updated) : new Date());
                setIsWeeklyScore(myCentiScore.is_weekly_score || false);
                
                // Set Next Update Time If We Have A Last Calculated Date.
                if (myCentiScore.last_updated) {
                    setNextUpdate(getNextMonday12AM());
                }
            }
        } catch (error) {
            console.error('Error loading current score:', error);
        }
    };

    // -------------------------------------------------------- Load Score On Component Mount.
    useEffect(() => {
        loadCurrentScore();
        loadGrowthData();
    }, [myCentiScore, myCentiScoreGrowth]);

    // -------------------------------------------------------- Return.
    return (
        <StrengthIndicatorContainer id={id}>
            {/* Prompt Card. */}
            {showPrompt && !showResults && (
                <PromptCard>
                    <LeftSide>
                        <PromptTitle>
                            Curious how your finances are doing?
                        </PromptTitle>
                        <PromptDescription>
                            Your Centi Score is a friendly benchmark that updates weekly and whenever you add new financial data. It's designed to point you in the right direction for financial growth.
                        </PromptDescription>
                    </LeftSide>
                    <RightSide>
                        <PromptQuestion>
                            Want to see your Centi. score?
                        </PromptQuestion>
                        <PromptButton 
                            onClick={() => {
                                if (hasEnoughData()) {
                            setShowPrompt(false);
                            handleCalculateClick();
                                }
                            }}
                            $hasData={hasEnoughData()}
                        >
                            {hasEnoughData() ? 'Sure, why not? ✨' : <ButtonContainer><LeftEmoji>📝</LeftEmoji> <RightText>Not Enough Data Right Now</RightText></ButtonContainer>}
                        </PromptButton>
                    </RightSide>
                </PromptCard>
            )}

            {/* Loading Card. */}
            {isLoading && (
                <LoadingCard isLoading={isLoading} showResults={showResults}>
                    <LoadingSpinner />
                    <LoadingText>{tagline}</LoadingText>
                    <ProgressBar>
                        <Wave $progress={loadingProgress} />
                    </ProgressBar>
                </LoadingCard>
            )}

            {/* Results Card. */}
            {showResults && score !== null && (
                <ResultsCard
                    score={score}
                    lastCalculated={lastCalculated}
                    onRecalculate={handleCalculateClick}
                    scoreBreakdown={scoreBreakdown}
                    isWeeklyScore={true}
                    nextUpdate={nextUpdate}
                    countdown={countdown}
                    growthData={growthData}
                    userStats={myStats}
                    myCentiScoreHistory={myCentiScoreHistory}
                    myCentiScoreGrowth={myCentiScoreGrowth}
                    myCentiScoreTrend={myCentiScoreTrend}
                />
            )}
        </StrengthIndicatorContainer>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Strength Indicator Container.
const StrengthIndicatorContainer = styled.div`
    width: 90%;
    margin-bottom: 2rem;
    position: relative;
`;

// -------------------------------------------------------- Card That Holds Text & Button.
const PromptCard = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 2rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    position: relative;
    overflow: hidden;
    gap: 2rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        pointer-events: none;
    }
    
    &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmer 3s infinite;
        pointer-events: none;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
`;
// -------------------------------------------------------- Left Side Of Prompt Card. (Text)
const LeftSide = styled.div`
    margin-left: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    z-index: 1;
    position: relative;
    gap: 1rem;
`;
// -------------------------------------------------------- Right Side Of Prompt Card. (Button)
const RightSide = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;
    width: 100%;
    z-index: 1;
    position: relative;
    gap: 1rem;
`;

// -------------------------------------------------------- Prompt Question.
const PromptQuestion = styled.div`
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #4f46e5, #10b981);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;
// -------------------------------------------------------- Prompt Title. ("Your Centi. Score")
const PromptTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    width: max-content;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    
    @media (max-width: 768px) {
        font-size: 1.8rem;
        text-align: center;
    }
`;
// -------------------------------------------------------- Prompt Description. ("Get a quick snapshot of your ...")
const PromptDescription = styled.p`
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 0;
    line-height: 1.6;
    font-weight: 500;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
        text-align: center;
    }
`;
// -------------------------------------------------------- Prompt Button. ("Show Me My Score 🔍")
const PromptButton = styled.button`
    font: inherit;
    background: ${props => props.$hasData 
        ? 'linear-gradient(135deg, #4f46e5, #10b981)' 
        : 'linear-gradient(135deg, #6b7280, #9ca3af)'
    };
    color: white;
    border: none;
    padding: 1.25rem 2rem;
    height: 100%;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: ${props => props.$hasData ? 'pointer' : 'default'};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: ${props => props.$hasData 
        ? '0 6px 20px rgba(79, 70, 229, 0.25)' 
        : '0 4px 12px rgba(107, 114, 128, 0.2)'
    };
    min-height: 60px;
    border: 2px solid transparent;
    opacity: ${props => props.$hasData ? '1' : '0.8'};
    
    @media (max-width: 768px) {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        min-height: 50px;
    }
    
    &:hover {
        transform: ${props => props.$hasData ? 'translateY(-3px) scale(1.02)' : 'linear-gradient(135deg,rgb(103, 103, 105),rgb(145, 145, 145))'};
        box-shadow: ${props => props.$hasData 
            ? '0 12px 30px rgba(79, 70, 229, 0.35)' 
            : '0 4px 12px rgba(107, 114, 128, 0.2)'
        };
        background: ${props => props.$hasData 
            ? 'linear-gradient(135deg, #6366f1, #059669)' 
            : 'linear-gradient(135deg, #6b7280, #9ca3af)'
        };
        border-color: ${props => props.$hasData ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
    }
    
    &:active {
        transform: ${props => props.$hasData ? 'translateY(-1px) scale(1.01)' : 'none'};
        transition: all 0.1s ease;
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s ease-out;
        opacity: ${props => props.$hasData ? '1' : '0'};
    }
    
    &:hover::before {
        left: ${props => props.$hasData ? '100%' : '-100%'};
    }
    
    /* Add a subtle glow effect */
    &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: ${props => props.$hasData 
            ? 'linear-gradient(135deg, #4f46e5, #10b981)' 
            : 'linear-gradient(135deg, #6b7280, #9ca3af)'
        };
        border-radius: 22px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:hover::after {
        opacity: ${props => props.$hasData ? '0.3' : '0'};
    }
`;
// -------------------------------------------------------- Card That Holds Loading Spinner & Text.
const LoadingCard = styled(PromptCard)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 2rem;
    
    ${props => props.isLoading === false && props.showResults && `
        animation: pop 0.4s ease;
        @keyframes pop {
            0%   { transform: scale(.98); }
            50%  { transform: scale(1.02); }
            100% { transform: scale(1);    }
        }
    `}
`;
const LoadingSpinner = styled.div`
    width: 60px;
    height: 60px;
    border: 4px solid rgba(33, 144, 248, 0.1);
    border-left-color: var(--button-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
const LoadingText = styled.p`
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    animation: slideFade 0.6s ease;
    
    @keyframes slideFade {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0);   }
    }
`;

// -------------------------------------------------------- Liquid Progress Bar.
const ProgressBar = styled.div`
    width: 100%;
    height: 16px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Wave = styled.div`
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(135deg, #4f46e5, #10b981);
    position: absolute;
    left: 0;
    top: 0;
    will-change: width;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
    }
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        animation: wave 3s linear infinite;
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    @keyframes wave {
        0% { transform: translateX(-100%) skewX(-15deg); }
        100% { transform: translateX(200%) skewX(-15deg); }
    }
`;

// -------------------------------------------------------- Button Container.

const ButtonContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 4fr;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
`;

const LeftEmoji = styled.div`
    font-size: 2.25rem;
`;

const RightText = styled.div`
    font-size: 1.25rem;
`;
// Export The StrengthIndicator Component.
export default StrengthIndicator;