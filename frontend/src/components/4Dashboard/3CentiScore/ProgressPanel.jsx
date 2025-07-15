// Imports.
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

// Local Imports.
import CentiChart from './CentiChart';

// ------------------------------------------------------------------------------------------------ Functions.
// -------------------------------------------------------- Function 4 Formatting Date.
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
};

// ------------------------------------------------------------------------------------------------ Progress Panel Component.
const ProgressPanel = ({ isVisible, onToggle, scoreHistory }) => {
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);


    return (
        <ProgressPanelContainer $visible={isVisible}>
            {isLoadingHistory ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText aria-live="polite">Loading your progress...</LoadingText>
                </LoadingContainer>
            ) : scoreHistory ? (
                <ProgressContent>
                    <ProgressHeader>
                        <ProgressTitle>Your Centi Score Journey</ProgressTitle>
                    </ProgressHeader>
                    
                    <ProgressGrid>
                        <ChartSection>
                            <SectionTitle>Score Progress</SectionTitle>
                            <ChartContainer>
                                <CentiChart scoreHistory={scoreHistory} />
                            </ChartContainer>
                        </ChartSection>
                        
                        <ProgressInsightsSection>
                            <SectionTitle>Progress Insights</SectionTitle>
                            <InsightsGrid>
                                {scoreHistory.growth?.has_growth_data && (
                                    <>
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>🔥</InsightIcon>
                                                <InsightLabel>Current Streak</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>
                                                {scoreHistory.growth.streaks?.current_growth_streak > 0 
                                                    ? `${scoreHistory.growth.streaks.current_growth_streak} weeks improving`
                                                    : scoreHistory.growth.streaks?.current_decline_streak > 0
                                                    ? `${scoreHistory.growth.streaks.current_decline_streak} weeks declining`
                                                    : 'Stable'
                                                }
                                            </InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.growth.streaks?.current_growth_streak > 0 
                                                    ? "Keep up the momentum!"
                                                    : scoreHistory.growth.streaks?.current_decline_streak > 0
                                                    ? "Time to turn things around"
                                                    : 'Consistency is key'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                        
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>🏆</InsightIcon>
                                                <InsightLabel>Best Score</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>{scoreHistory.growth.stats?.best_score || 'N/A'}</InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.growth.stats?.best_score_date 
                                                    ? `Achieved on ${formatDate(scoreHistory.growth.stats.best_score_date)}`
                                                    : 'Your highest achievement'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                        
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>📊</InsightIcon>
                                                <InsightLabel>Average Score</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>{scoreHistory.growth.stats?.average_score || 'N/A'}</InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.growth.stats?.average_score 
                                                    ? `Your consistent performance level`
                                                    : 'Your typical performance'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                        
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>📅</InsightIcon>
                                                <InsightLabel>Weeks Tracked</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>{scoreHistory.growth.stats?.total_scores || 'N/A'}</InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.growth.stats?.total_scores 
                                                    ? `${scoreHistory.growth.stats.total_scores} week${scoreHistory.growth.stats.total_scores > 1 ? 's' : ''} of data`
                                                    : 'Building your history'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                        
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>📈</InsightIcon>
                                                <InsightLabel>Score Range</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>
                                                {scoreHistory.growth.stats?.best_score && scoreHistory.growth.stats?.worst_score
                                                    ? `${scoreHistory.growth.stats.best_score - scoreHistory.growth.stats.worst_score} pts`
                                                    : 'N/A'
                                                }
                                            </InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.growth.stats?.best_score && scoreHistory.growth.stats?.worst_score
                                                    ? `From ${scoreHistory.growth.stats.worst_score} to ${scoreHistory.growth.stats.best_score}`
                                                    : 'Your score variation'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                        
                                        <InsightCard>
                                            <InsightHeader>
                                                <InsightIcon>🎯</InsightIcon>
                                                <InsightLabel>Current Trend</InsightLabel>
                                            </InsightHeader>
                                            <InsightValue>
                                                {scoreHistory.trend?.trend === 'improving' ? '↗ Improving' :
                                                 scoreHistory.trend?.trend === 'declining' ? '↘ Declining' :
                                                 scoreHistory.trend?.trend === 'stable' ? 'Stable' : 'N/A'}
                                            </InsightValue>
                                            <InsightSubtext>
                                                {scoreHistory.trend?.change !== undefined 
                                                    ? `${Math.abs(scoreHistory.trend.change)} point${Math.abs(scoreHistory.trend.change) !== 1 ? 's' : ''} ${scoreHistory.trend.change > 0 ? 'gain' : 'loss'}`
                                                    : 'Your recent direction'
                                                }
                                            </InsightSubtext>
                                        </InsightCard>
                                    </>
                                )}
                                {!scoreHistory.growth?.has_growth_data && (
                                    <InsightCard>
                                        <InsightLabel>Status</InsightLabel>
                                        <InsightValue>No growth data available</InsightValue>
                                    </InsightCard>
                                )}
                            </InsightsGrid>
                        </ProgressInsightsSection>
                    </ProgressGrid>
                </ProgressContent>
            ) : (
                <LoadingContainer>
                    <LoadingText>No score history data available</LoadingText>
                </LoadingContainer>
            )}
        </ProgressPanelContainer>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Progress Panel Container.
const ProgressPanelContainer = styled.div`
    width: 100%;
    max-height: ${props => props.$visible ? '1000px' : '0'};
    opacity: ${props => props.$visible ? 1 : 0};
    transform: translateY(${props => props.$visible ? '0%' : '-10%'});
    transition: max-height 0.4s ease-in-out, opacity 0.3s, transform 0.4s ease-in-out;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 0 0 16px 16px;
    margin-top: 1rem;
    padding: 1.5rem 1.5rem 1.5rem 1.5rem;

    ${props => !props.$visible && `
        max-height: 0;
        opacity: 0;
        transform: translateY(-10%);
    `}
`;

// -------------------------------------------------------- Progress Content.
const ProgressContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
`;

// -------------------------------------------------------- Progress Header.
const ProgressHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
`;

// -------------------------------------------------------- Progress Title.
const ProgressTitle = styled.h3`
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

// -------------------------------------------------------- Progress Grid.
const ProgressGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    width: 100%;
    align-items: start;
    
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`;

// -------------------------------------------------------- Chart Section.
const ChartSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Section Title.
const SectionTitle = styled.h4`
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.75rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    border-bottom: 3px solid rgba(0, 0, 0, 0.1);
    width: 80%;
    align-self: center;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

// -------------------------------------------------------- Chart Container.
const ChartContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

// -------------------------------------------------------- Empty Chart Message.
const EmptyChartMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    font-size: 1rem;
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.2);
`;

// -------------------------------------------------------- Line Chart Container.
const LineChartContainer = styled.div`
    width: 100%;
    height: 200px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    position: relative;

    .chart-dot {
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .chart-dot:hover {
        r: 6;
        stroke-width: 3;
    }

    .chart-dot:hover + .tooltip {
        opacity: 1;
    }
`;

// -------------------------------------------------------- Progress Insights Section.
const ProgressInsightsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Insights Grid.
const InsightsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
    align-items: start;
    
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }
    
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
`;

// -------------------------------------------------------- Insight Card.
const InsightCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(5px);
    border-color: transparent;
    background: linear-gradient(white, white) padding-box, 
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    min-height: 120px;
    justify-content: space-between;

    transition: all 0.3s ease-in-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s ease-in-out;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        
        &::before {
            left: 100%;
        }
    }

    &:active {
        transform: translateY(0);
    }
`;

// -------------------------------------------------------- Insight Header.
const InsightHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
`;

// -------------------------------------------------------- Insight Icon.
const InsightIcon = styled.span`
    font-size: 1.25rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

// -------------------------------------------------------- Insight Label.
const InsightLabel = styled.span`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// -------------------------------------------------------- Insight Value.
const InsightValue = styled.span`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.125rem;
`;

// -------------------------------------------------------- Insight Subtext.
const InsightSubtext = styled.span`
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 400;
    line-height: 1.3;
    opacity: 0.8;
`;

// -------------------------------------------------------- Loading Container.
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: var(--text-secondary);
`;

// -------------------------------------------------------- Loading Spinner.
const LoadingSpinner = styled.div`
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid var(--button-primary);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// -------------------------------------------------------- Loading Text.
const LoadingText = styled.span`
    margin-top: 1rem;
    font-size: 1.1rem;
`;

// Export Component.
export default ProgressPanel;
