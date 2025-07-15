// Imports.
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import MeterGauge from './MeterGauge';
import ProgressPanel from './ProgressPanel';
import { 
    getPersonalizedPositiveInsights, 
    getPersonalizedGrowthAreas, 
    getPersonalizedActionSteps 
} from './PersonalizedInsight';

// ------------------------------------------------------------------------------------------------ Keyframes.
const fadeInUp = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

// ------------------------------------------------------------------------------------------------ Results Card Component.
const ResultsCard = ({ 
    score, 
    lastCalculated, 
    onRecalculate, 
    scoreBreakdown, 
    userStats = {}, 
    nextUpdate, 
    countdown, 
    growthData,
    myCentiScoreHistory,
    myCentiScoreGrowth,
    myCentiScoreTrend
}) => {
    const [infoVisible, setInfoVisible] = useState(false); // State 4 Info Panel Visibility.
    const [progressVisible, setProgressVisible] = useState(false); // State 4 Progress Panel Visibility.
    const [scoreHistory, setScoreHistory] = useState(null); // State 4 Score History Data.

    // Function 4 Toggling Info Panel Visibility.
    const toggleInfoPanel = () => setInfoVisible(v => !v);

    // Function 4 Toggling Progress Panel Visibility.
    const toggleProgressPanel = () => setProgressVisible(v => !v);

    // Get personalized insights using the new utility
    const positiveInsight = getPersonalizedPositiveInsights(scoreBreakdown, userStats);
    const growthArea = getPersonalizedGrowthAreas(scoreBreakdown, userStats);
    const actionStep = getPersonalizedActionSteps(scoreBreakdown, userStats);

    // Set score history data from props
    useEffect(() => {
        if (myCentiScoreHistory && myCentiScoreGrowth && myCentiScoreTrend) {
            console.log("Setting score history from props:", {
                history: myCentiScoreHistory,
                growth: myCentiScoreGrowth,
                trend: myCentiScoreTrend
            });

            setScoreHistory({
                history: myCentiScoreHistory,
                growth: myCentiScoreGrowth,
                trend: myCentiScoreTrend
            });
        }
    }, [myCentiScoreHistory, myCentiScoreGrowth, myCentiScoreTrend]);

    return (
        <ResultsCardContainer>
            {/* Info Panel */}
            <ScoreHeader>
                <InfoPanel $visible={infoVisible}>
                    <InfoPanelContent>
                        <InfoPanelHeader>
                            <InfoPanelTitle>What is the Centi. Score?</InfoPanelTitle>
                            <CloseButton onClick={toggleInfoPanel}>×</CloseButton>
                        </InfoPanelHeader>
                        
                        <InfoPanelText>
                            The Centi. Score gives you a simplified look at your financial strength across net worth, assets, liabilities, and cash flow. It's not a credit score—just a friendly benchmark to help you improve.
                        </InfoPanelText>
                    </InfoPanelContent>
                </InfoPanel>
                <QuestionIcon 
                    onClick={toggleInfoPanel} 
                    title="The Centi. Score gives you a simplified look at your financial strength across net worth, assets, liabilities, and cash flow. It's not a credit score—just a friendly benchmark to help you improve."
                >?</QuestionIcon>
            </ScoreHeader>
            
            <ResultsGrid>
                <LeftColumn>
                    <ScoreTitleContainer>
                        <ScoreTitle>Your Centi. Score</ScoreTitle>
                        <ScoreSubtitle>A friendly benchmark for your financial health</ScoreSubtitle>
                    </ScoreTitleContainer>
                    <MeterGauge 
                        score={score}
                        lastCalculated={lastCalculated}
                        countdown={countdown}
                        growthData={growthData}
                    />
                
                </LeftColumn>
                
                <RightColumn>      
                    <MessageContainer>
                        <PositiveHeader>
                            You're doing great at these <span className="emoji">👏</span>
                        </PositiveHeader>
                        <MessageText>{positiveInsight.message}</MessageText>
                    </MessageContainer>

                    <MessageContainer>
                        <NegativeHeader>
                            Where there's room to grow <span className="emoji">🌱</span>
                        </NegativeHeader>
                        <MessageText>{growthArea.message}</MessageText>
                    </MessageContainer>

                    <MessageContainer>
                        <HowToImproveHeader>
                            Tips to level up <span className="emoji">📈</span>
                        </HowToImproveHeader>
                        <MessageText>{actionStep.message}</MessageText>
                    </MessageContainer>
                    
                    
                </RightColumn>
            </ResultsGrid>
            {/* Progress Section */}
            <ProgressSection>
                <ProgressPrompt>
                    Want to see how your Centi Score has changed?
                </ProgressPrompt>
                <ProgressButton 
                    onClick={toggleProgressPanel}
                    $isExpanded={progressVisible}
                    role="button"
                    aria-expanded={progressVisible}
                >
                    <ButtonText>
                        {progressVisible ? 'Hide Progress' : 'Show me my progress! 🚀'}
                    </ButtonText>
                </ProgressButton>
            </ProgressSection>
            {/* Progress Panel */}
            <ProgressPanel isVisible={progressVisible} onToggle={toggleProgressPanel} scoreHistory={scoreHistory} />
        </ResultsCardContainer>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Results Card Container.
const ResultsCardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    padding: 2rem 2rem 0rem 2rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);

    transition: all 0.3s ease;

    border-radius: 16px;
    text-align: center;
    
    @media (max-width: 768px) {
        gap: 1.5rem;
        padding: 1.5rem;
    }
    
    
    @keyframes shimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
`;
// -------------------------------------------------------- Score Header. (Title & Question Icon)
const ScoreHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;
// -------------------------------------------------------- Score Title Container. (Title & Subtitle)
const ScoreTitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`; 
// -------------------------------------------------------- Score Title. (Your Centi. Score)
const ScoreTitle = styled.h2`
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;
// -------------------------------------------------------- Score Subtitle. (A friendly benchmark for your financial health)
const ScoreSubtitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0;
`;
// -------------------------------------------------------- Question Icon. (Expand Tooltip)
const QuestionIcon = styled.div`
    display: flex;
    position: absolute;
    top: 2rem;
    right: 1.6rem;
    border-radius: 50%;
    border: 2px solid transparent;
    justify-content: center;
    align-items: center;
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 1;
    
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    color: white;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1) rotate(9deg);
        color: rgba(255, 255, 255, 0.85);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
`;
// -------------------------------------------------------- Results Grid. (Left & Right Columns)
const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    align-items: center;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`;
const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;
const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    height: 100%;
    padding: 4rem 1.5rem 0 1.5rem;

    animation: ${fadeInUp} 0.8s ease-out 0.8s both;
`;
// -------------------------------------------------------- Message Container.
const MessageContainer = styled.div`
    width: 100%;
    text-align: left;
    line-height: 1.4;
    padding: 0;
    position: relative;
`;
const MessageHeader = styled.div`
    font-size: 1.6rem;
    text-align: left;
    margin: 0 0 1rem 0;
    font-weight: 700;
    position: relative;
    padding-left: 1rem;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 60%;
        border-radius: 2px;
    }

    .emoji {
        background: none !important;
        -webkit-background-clip: unset !important;
        -webkit-text-fill-color: initial !important;
        color: initial !important;
        filter: none !important;
    }
`;
const MessageText = styled.div`
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    font-size: 1.2rem;
    text-align: left;
    font-weight: 500;
    line-height: 1.6;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.2);
        
        &::before {
            left: 100%;
        }
    }
`;
// -------------------------------------------------------- Positive Header.
const PositiveHeader = styled(MessageHeader)`
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    &::before {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    }
`;
// -------------------------------------------------------- Negative Header.
const NegativeHeader = styled(MessageHeader)`
    background: linear-gradient(135deg, rgb(220, 53, 69), rgb(255, 193, 7));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    &::before {
        background: linear-gradient(135deg, rgb(220, 53, 69), rgb(255, 193, 7));
    }
`;
// -------------------------------------------------------- How To Improve Header.
const HowToImproveHeader = styled(MessageHeader)`
    background: linear-gradient(135deg, rgb(13, 110, 253), rgb(120, 88, 209));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    &::before {
        background: linear-gradient(135deg, rgb(13, 110, 253), rgb(120, 88, 209));
    }
`;
// -------------------------------------------------------- Slide-in Info Panel.
const InfoPanel = styled.div`
    position: absolute;
    display: flex;
    align-self: flex-end;
    top: 0;
    right: 0;
    width: 50%;
    z-index: 1000;
    background: rgba(255,255,255,0.97);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    padding: 1.5rem 1.5rem;
    transform: translateY(${props => props.$visible ? '0%' : '-120%'});
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: ${props => props.$visible ? 'auto' : 'none'};
    transition: transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
`;
// -------------------------------------------------------- Info Panel Content.
const InfoPanelContent = styled.div`
    text-align: left;
    position: relative;
`;
// -------------------------------------------------------- Info Panel Header. (Title & Close Button)
const InfoPanelHeader = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`
// -------------------------------------------------------- Info Panel Title.
const InfoPanelTitle = styled.h3`
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;
// -------------------------------------------------------- Info Panel Text.
const InfoPanelText = styled.div`
    padding-top: 0.75rem;
    margin-right: 3rem;
    font-size: 1.15rem;
    text-align: justify;
    color: var(--text-secondary);
    line-height: 1.6;
`;
// -------------------------------------------------------- Close Button.
const CloseButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    width: 2.2rem;
    height: 2.2rem;
    color: white;
    border: none;
    outline: none;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease-in-out;

    &:hover, &:focus {
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        transform: scale(1.1) rotate(9deg);
    }
`;

// -------------------------------------------------------- Progress Section.
const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;

    .svg {
        font-size: 1.25rem;
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        font-weight: 500;
        text-align: center;
        margin-bottom: 0.5rem;
    }
`;

// -------------------------------------------------------- Progress Prompt.
const ProgressPrompt = styled.div`
    font-size: 1.25rem;
    color: var(--text-primary);
    font-weight: 500;
    text-align: center;
    margin-bottom: 0.5rem;
`;

// -------------------------------------------------------- Progress Button.
const ProgressButton = styled.button`
    font: inherit;
    display: flex;
    align-items: center;    
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
    width: 100%;
    align-self: center;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
    
    @keyframes shimmer {
        0% { background-position: 0% 0; }
        100% { background-position: 100% 0; }
    }

    ${props => props.$isExpanded && `
        background: linear-gradient(135deg, #6366f1, #059669);
        box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    `}
`;

// -------------------------------------------------------- Button Text.
const ButtonText = styled.span`
    font-size: 1rem;
    font-weight: 600;
`;

// Export Component.
export default ResultsCard;
