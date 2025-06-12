import React from 'react';
import { useEffect, useState } from 'react';
import { styled } from 'styled-components';

import { getStats } from '../services/api';

const StatsSection = () => {
    
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------- Handle Stats Import
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

    useEffect(() => {
        importStats();
    }, []);

    // -------------------------------------------------------- Calculate Monthly Spending
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

    // -------------------------------------------------------- Format Currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <StatsWrapper>
            {/* Interactive Welcome Header */}
            <WelcomeHeader>
                <WelcomeContent>
                    <IntroStatement>
                        <WelcomeTitle>Welcome to Centi.</WelcomeTitle>
                        <WelcomeConfetti>🎉</WelcomeConfetti> 
                    </IntroStatement>
                    <WelcomeSubtitle>Your financial overview at a glance...</WelcomeSubtitle>
                </WelcomeContent>
            </WelcomeHeader>

            {/* Stats Cards Grid */}
            <StatsGrid>
                {/* Total Balance Card */}
                <StatCard>
                    <StatLabel>Total Balance</StatLabel>
                    <StatValue $positive={true}>
                        {loading ? 'Loading...' : formatCurrency(stats.totals?.total_balance || 0)}
                    </StatValue>
                    <StatIcon>💰</StatIcon>
                </StatCard>

                {/* Transactions This Month Card */}
                <StatCard>
                    <StatLabel>Total Transactions</StatLabel>
                    <StatValue>
                        {loading ? 'Loading...' : (stats.totals?.transactions || 0)}
                    </StatValue>
                    <StatIcon>📊</StatIcon>
                </StatCard>

                {/* Monthly Spending Card */}
                <StatCard>
                    <StatLabel>Monthly Spending</StatLabel>
                    <StatValue $negative={true}>
                        {loading ? 'Loading...' : formatCurrency(getMonthlySpending())}
                    </StatValue>
                    <StatIcon>💸</StatIcon>
                </StatCard>
            </StatsGrid>
        </StatsWrapper>
    );
}

// -------------------------------------------------------- Styled Components

const StatsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;
    gap: 2rem;
    margin-bottom: 2rem;
`

const WelcomeHeader = styled.div`
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:active {
        transform: translateY(0);
    }
`

const WelcomeContent = styled.div`
    position: relative;
    z-index: 2;
`

const IntroStatement = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    padding: 1rem 0rem;
`

const WelcomeTitle = styled.h1`
    font-size: 4.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
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
    font-size: 6rem;
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

// -------------------------------------------------------- Stats Cards Grid
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`

const StatCard = styled.div`
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 2rem;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px var(--shadow-light);
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px var(--shadow-medium);
        border: 3px solid var(--button-primary);
    }
`

const StatLabel = styled.h3`
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin: 0 0 1rem 0;
    opacity: 0.8;
`

const StatValue = styled.div`
    font-size: 2.25rem;
    font-weight: 700;
    color: ${props => {
        if (props.$positive) return 'var(--amount-positive)';
        if (props.$negative) return 'var(--amount-negative)';
        return 'var(--text-primary)';
    }};
    margin-bottom: 0.5rem;
    line-height: 1.1;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    
    @media (max-width: 768px) {
        font-size: 1.875rem;
    }
`

const StatIcon = styled.div`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1.5rem;
    opacity: 0.6;
    transition: all 0.3s ease;
    
    ${StatCard}:hover & {
        opacity: 0.8;
        transform: scale(1.1);
    }
`

export default StatsSection;