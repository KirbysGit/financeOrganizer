import React, { useState } from 'react';
import styled from 'styled-components';

// -------------------------------------------------------- Strength Indicator Component.
const StrengthIndicator = ({ stats }) => {
    const [showPrompt, setShowPrompt] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(null);

    const calculateScore = () => {
        setIsLoading(true);
        // Simulate loading
        setTimeout(() => {
            const netWorth = stats?.totals?.net_worth || 0;
            const assets = stats?.totals?.total_assets || 0;
            const liabilities = stats?.totals?.total_liabilities || 0;
            const cashFlow = stats?.cash_flow?.last_30_days || 0;

            // Simple scoring algorithm (can be made more sophisticated)
            let score = 0;
            
            // Net worth contribution (up to 40 points)
            if (netWorth > 0) score += Math.min(40, (netWorth / 100000) * 40);
            
            // Assets contribution (up to 30 points)
            if (assets > 0) score += Math.min(30, (assets / 100000) * 30);
            
            // Liabilities contribution (up to 20 points)
            if (liabilities === 0) score += 20;
            else score += Math.max(0, 20 - (liabilities / 10000) * 20);
            
            // Cash flow contribution (up to 10 points)
            if (cashFlow > 0) score += Math.min(10, (cashFlow / 5000) * 10);

            setScore(Math.round(score));
            setIsLoading(false);
            setShowResults(true);
        }, 2000);
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return "Exceptional! Your financial foundation is rock solid! 🌟";
        if (score >= 75) return "Strong! You're making great financial progress! 💪";
        if (score >= 60) return "Good! You're on the right track! 📈";
        if (score >= 45) return "Fair! There's room for improvement! 🎯";
        return "Let's work on strengthening your financial position! 🌱";
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'rgb(40, 167, 69)';
        if (score >= 75) return 'rgb(25, 135, 84)';
        if (score >= 60) return 'rgb(13, 110, 253)';
        if (score >= 45) return 'rgb(255, 193, 7)';
        return 'rgb(220, 53, 69)';
    };

    return (
        <StrengthIndicatorContainer>
            {showPrompt && !showResults && (
                <PromptCard>
                    <PromptTitle>Want to know your Centi. Score?</PromptTitle>
                    <PromptDescription>
                        Get personalized insights about your financial strength and areas for improvement.
                    </PromptDescription>
                    <PromptButton onClick={() => {
                        setShowPrompt(false);
                        calculateScore();
                    }}>
                        Calculate My Score
                    </PromptButton>
                </PromptCard>
            )}

            {isLoading && (
                <LoadingCard>
                    <LoadingSpinner />
                    <LoadingText>Calculating your Centi. Score...</LoadingText>
                </LoadingCard>
            )}

            {showResults && score !== null && (
                <ResultsCard>
                    <ScoreTitle>Your Centi. Score</ScoreTitle>
                    <ScoreValue style={{ color: getScoreColor(score) }}>
                        {score}
                    </ScoreValue>
                    <ScoreMessage>
                        {getScoreMessage(score)}
                    </ScoreMessage>
                    <ResetButton onClick={() => {
                        setShowResults(false);
                        setShowPrompt(true);
                        setScore(null);
                    }}>
                        Calculate Again
                    </ResetButton>
                </ResultsCard>
            )}
        </StrengthIndicatorContainer>
    );
};

// -------------------------------------------------------- Styled Components.
const StrengthIndicatorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%;
    margin-bottom: 2rem;
`;

const PromptCard = styled.div`
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    width: 100%;
    max-width: 600px;
    transition: all 0.3s ease;
    border: 3px solid transparent;

    &:hover {
        transform: translateY(-5px);
        border-color: var(--button-primary);
    }
`;

const PromptTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const PromptDescription = styled.p`
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
`;

const PromptButton = styled.button`
    background: var(--button-primary);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(33, 144, 248, 0.2);
    }
`;

const LoadingCard = styled(PromptCard)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

const LoadingSpinner = styled.div`
    width: 50px;
    height: 50px;
    border: 4px solid rgba(33, 144, 248, 0.1);
    border-left-color: var(--button-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    font-size: 1.1rem;
    color: var(--text-secondary);
`;

const ResultsCard = styled(PromptCard)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

const ScoreTitle = styled.h2`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
`;

const ScoreValue = styled.div`
    font-size: 4rem;
    font-weight: 700;
    margin: 1rem 0;
`;

const ScoreMessage = styled.p`
    font-size: 1.2rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1rem;
`;

const ResetButton = styled(PromptButton)`
    background: transparent;
    border: 2px solid var(--button-primary);
    color: var(--button-primary);

    &:hover {
        background: var(--button-primary);
        color: white;
    }
`;

export default StrengthIndicator;