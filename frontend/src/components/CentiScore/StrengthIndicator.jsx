// Imports.
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MeterGauge from './MeterGauge';
import ResultsCard from './ResultsCard';

// ------------------------------------------------------------------------------------------------ Strength Indicator Component.
const StrengthIndicator = ({ myStats }) => {
    // State Management.
    const [score, setScore] = useState(null);                       // State 4 Storing Score.
    const [isLoading, setIsLoading] = useState(false);              // State 4 If Loading.
    const [loadingStep, setLoadingStep] = useState(0);              // State 4 Loading Step.
    const [showPrompt, setShowPrompt] = useState(true);             // State 4 If Prompt Is Showing (e.g. Not Showing After Score Is Calculated).
    const [showResults, setShowResults] = useState(false);          // State 4 If Results Are Showing.
    const [loadingProgress, setLoadingProgress] = useState(0);      // State 4 Loading Progress.
    const [lastCalculated, setLastCalculated] = useState(null);     // State 4 When Score Was Last Calculated.
    const [scoreBreakdown, setScoreBreakdown] = useState(null);     // State 4 Score Breakdown.

    // -------------------------------------------------------- Function 4 Calculating Score.
    const handleCalculateClick = async () => {
        // Start "Loading" Process.
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingStep(0);
        const startTime = Date.now();
        
        try {
            // Step 1: Analyzing Financial Data.
            setLoadingStep(1);
            setLoadingProgress(25);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 2: Calculating Net Worth Impact.
            setLoadingStep(2);
            setLoadingProgress(50);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 3: Evaluating Assets & Liabilities.
            setLoadingStep(3);
            setLoadingProgress(75);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 4: Finalizing Score Calculation.
            setLoadingStep(4);
            setLoadingProgress(90);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Get Stats.
            const netWorth = myStats?.totals?.net_worth || 0;
            const assets = myStats?.totals?.total_assets || 0;
            const liabilities = myStats?.totals?.total_liabilities || 0;
            const cashFlow = myStats?.cash_flow?.last_30_days || 0;

            // Calculate Individual Scores.
            let netWorthScore = 0;
            let assetsScore = 0;
            let liabilitiesScore = 0;
            let cashFlowScore = 0;
            
            // Net Worth Contribution (Up To 40 Points).
            if (netWorth > 0) netWorthScore = Math.min(40, (netWorth / 100000) * 40);
            
            // Assets Contribution (Up To 30 Points).
            if (assets > 0) assetsScore = Math.min(30, (assets / 100000) * 30);
            
            // Liabilities Contribution (Up To 20 Points).
            if (liabilities === 0) liabilitiesScore = 20;
            else liabilitiesScore = Math.max(0, 20 - (liabilities / 10000) * 20);
            
            // Cash Flow Contribution (Up To 10 Points).
            if (cashFlow > 0) cashFlowScore = Math.min(10, (cashFlow / 5000) * 10);

            // Calculate Final Score.
            const calculatedScore = Math.round(netWorthScore + assetsScore + liabilitiesScore + cashFlowScore);
            
            // Store Breakdown For Display.
            const scoreBreakdown = {
                netWorth: { score: Math.round(netWorthScore), max: 40, value: netWorth },
                assets: { score: Math.round(assetsScore), max: 30, value: assets },
                liabilities: { score: Math.round(liabilitiesScore), max: 20, value: liabilities },
                cashFlow: { score: Math.round(cashFlowScore), max: 10, value: cashFlow }
            };

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

            // Set Score, Score Breakdown, Show Results, And Last Calculated Date.
            setScore(calculatedScore);
            setScoreBreakdown(scoreBreakdown);
            setShowResults(true);
            setLastCalculated(new Date());
        } catch (error) {
            console.error('Error calculating financial strength:', error);
        } finally {
            setIsLoading(false);
            setLoadingProgress(0);
            setLoadingStep(0);
        }
    };

    // -------------------------------------------------------- Return.
    return (
        <StrengthIndicatorContainer>
            {showPrompt && !showResults && (
                <PromptCard>
                    <LeftSide>
                        <PromptTitle>Curious how your finances are doing?</PromptTitle>
                        <PromptDescription>
                            Get a quick snapshot of your financial strength and see where you stand compared to others.
                        </PromptDescription>
                    </LeftSide>
                    <RightSide>
                        <PromptButton onClick={() => {
                            setShowPrompt(false);
                            handleCalculateClick();
                        }}>
                            Show Me My Score 🔍
                        </PromptButton>
                    </RightSide>
                </PromptCard>
            )}

            {isLoading && (
                <LoadingCard>
                    <LoadingSpinner />
                    <LoadingText>Calculating your Centi. Score...</LoadingText>
                    <LoadingProgress>
                        <ProgressBar>
                            <ProgressFill $progress={loadingProgress} />
                        </ProgressBar>
                        <ProgressText>{loadingProgress}%</ProgressText>
                    </LoadingProgress>
                    <LoadingSteps>
                        <LoadingStep $active={loadingStep >= 1} $completed={loadingStep > 1}>
                            <StepIcon $completed={loadingStep > 1} $active={loadingStep >= 1}>{loadingStep > 1 ? '✓' : '1'}</StepIcon>
                            <StepText>Analyzing financial data</StepText>
                        </LoadingStep>
                        <LoadingStep $active={loadingStep >= 2} $completed={loadingStep > 2}>
                            <StepIcon $completed={loadingStep > 2} $active={loadingStep >= 2}>{loadingStep > 2 ? '✓' : '2'}</StepIcon>
                            <StepText>Calculating net worth impact</StepText>
                        </LoadingStep>
                        <LoadingStep $active={loadingStep >= 3} $completed={loadingStep > 3}>
                            <StepIcon $completed={loadingStep > 3} $active={loadingStep >= 3}>{loadingStep > 3 ? '✓' : '3'}</StepIcon>
                            <StepText>Evaluating assets & liabilities</StepText>
                        </LoadingStep>
                        <LoadingStep $active={loadingStep >= 4} $completed={loadingStep > 4}>
                            <StepIcon $completed={loadingStep > 4} $active={loadingStep >= 4}>{loadingStep > 4 ? '✓' : '4'}</StepIcon>
                            <StepText>Finalizing score calculation</StepText>
                        </LoadingStep>
                    </LoadingSteps>
                </LoadingCard>
            )}

            {showResults && score !== null && (
                <ResultsCard
                    score={score}
                    lastCalculated={lastCalculated}
                    onRecalculate={handleCalculateClick}
                    scoreBreakdown={scoreBreakdown}
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
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
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
    text-align: center;
    justify-content: center;
    align-items: center;
    width: 100%;
    z-index: 1;
    position: relative;
`;
// -------------------------------------------------------- Prompt Title. ("Your Centi. Score")
const PromptTitle = styled.h2`
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    line-height: 1.2;
    
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
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    padding: 1.25rem 2rem;
    height: 100%;
    border-radius: 16px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    min-height: 60px;
    
    @media (max-width: 768px) {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        min-height: 50px;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    &:active {
        transform: translateY(0);
        transition: all 0.1s ease;
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;
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
`;
// -------------------------------------------------------- Loading Progress.
const LoadingProgress = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
`;
const ProgressBar = styled.div`
    width: 100%;
    height: 20px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const ProgressFill = styled.div`
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 10px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
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
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;
const ProgressText = styled.div`
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
`;
// -------------------------------------------------------- Loading Steps.
const LoadingSteps = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 1rem;
`;
const LoadingStep = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    opacity: ${props => props.$active ? 1 : 0.3};
    transform: ${props => props.$active ? 'scale(1)' : 'scale(0.9)'};
    transition: all 0.3s ease;
`;
const StepIcon = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => props.$completed ? 'var(--amount-positive)' : props.$active ? 'var(--button-primary)' : 'var(--text-secondary)'};
    transition: all 0.3s ease;
`;
const StepText = styled.div`
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.2;
`;

// Export Component.
export default StrengthIndicator;