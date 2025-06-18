import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { fetchDetailedTransactions } from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SpendingGrid = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [dateRange, setDateRange] = useState('30D');
    const [showDetails, setShowDetails] = useState(false);
    const [netSummary, setNetSummary] = useState(0);
    const [positiveDays, setPositiveDays] = useState(0);
    const [totalDays, setTotalDays] = useState(0);

    // 
    const [showIncome, setShowIncome] = useState(true);
    const [showSpending, setShowSpending] = useState(true);
    const [showNet, setShowNet] = useState(true);

    const dateRangeOptions = [
        { value: '7D', label: '7 Days' },
        { value: '14D', label: '14 Days' },
        { value: '30D', label: '30 Days' }
    ];

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const res = await fetchDetailedTransactions();
                setTransactions(res.data);
                const processedData = processChartData(res.data);
                setChartData(processedData);
                generateSummary(processedData);
            } catch (err) {
                console.log("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };
        getTransactions();
    }, [dateRange]);

    const generateSummary = (data) => {
        if (!data) return;
        const { daily } = data;
        const net = daily.net;
        const netSum = net.reduce((sum, val) => sum + val, 0);
        setNetSummary(netSum);
        const posDays = net.filter(amount => amount > 0).length;
        setPositiveDays(posDays);
        setTotalDays(net.length);
    };

    const processChartData = (transactions) => {
        const daysToShow = dateRange === '7D' ? 7 : dateRange === '14D' ? 14 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (daysToShow - 1));
        const recentTransactions = transactions.filter(tx => 
            new Date(tx.date) >= startDate
        );
        const dates = Array.from({ length: daysToShow }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (daysToShow - 1 - i));
            return date.toISOString().split('T')[0];
        });
        const incomeData = new Array(daysToShow).fill(0);
        const spendingData = new Array(daysToShow).fill(0);
        recentTransactions.forEach(tx => {
            const dateIndex = dates.indexOf(tx.date.split('T')[0]);
            if (dateIndex !== -1) {
                if (tx.amount > 0) {
                    incomeData[dateIndex] += tx.amount;
                } else {
                    spendingData[dateIndex] += Math.abs(tx.amount);
                }
            }
        });
        const netData = incomeData.map((inc, i) => inc - spendingData[i]);
        return {
            labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            daily: {
                income: incomeData,
                spending: spendingData,
                net: netData
            }
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimePeriodText = () => {
        switch (dateRange) {
            case '7D': return 'last week';
            case '14D': return 'last 2 weeks';
            case '30D': return 'last month';
            default: return 'this period';
        }
    };

    const getCashFlowMessage = () => {
        if (netSummary > 0) {
            return {
                main: `Awesome! You came out ahead by ${formatCurrency(netSummary)} in the ${getTimePeriodText()}.`,
                secondary: null
            };
        } else if (netSummary < 0) {
            return {
                main: `Looks like spending outweighed income by ${formatCurrency(Math.abs(netSummary))} this ${getTimePeriodText()}.`,
                secondary: "No stress — we've all been there."
            };
        } else {
            return {
                main: `Your income and spending evened out over the ${getTimePeriodText()}.`,
                secondary: null
            };
        }
    };

    const getBarChartData = () => {
        const datasets = [];

        if (showIncome) {
            datasets.push({
                label: 'Income',
                data: chartData?.daily?.income || [],
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return 'rgba(40, 167, 69, 0.8)';
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(40, 167, 69, 0.4)');
                    gradient.addColorStop(1, 'rgba(40, 167, 69, 0.9)');
                    return gradient;
                },
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 3,
                stack: 'income',
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8
                },
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(40, 167, 69, 0.9)',
                hoverBorderColor: 'rgba(40, 167, 69, 1)',
                hoverBorderWidth: 3
            })
        }

        if (showSpending) {
            datasets.push({
                label: 'Spending',
                data: chartData?.daily?.spending || [],
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return 'rgba(220, 53, 69, 0.8)';
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(220, 53, 69, 0.4)');
                    gradient.addColorStop(1, 'rgba(220, 53, 69, 0.9)');
                    return gradient;
                },
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 3,
                stack: 'spending',
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8
                },
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(220, 53, 69, 0.9)',
                hoverBorderColor: 'rgba(220, 53, 69, 1)',
                hoverBorderWidth: 3
            })
        }

        if (showNet) {
            datasets.push({
                type: 'line',
                label: 'Net',
                data: chartData?.daily?.net || [],
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                pointBorderColor: 'white',
                pointBorderWidth: 3,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
                pointHoverBorderColor: 'white',
                pointHoverBorderWidth: 4,
                tension: 0.4,
                fill: true,
                stack: 'flow',
                yAxisID: 'y'
            })
        }
        return {
            labels: chartData?.labels || [],
            datasets: datasets
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                display: showDetails,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: '600'
                    },
                    generateLabels: function(chart) {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset, index) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor || dataset.backgroundColor,
                            lineWidth: 2,
                            pointStyle: dataset.type === 'line' ? 'circle' : 'rect',
                            hidden: !chart.isDatasetVisible(index),
                            index: index
                        }));
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1a1a1a',
                bodyColor: '#4a4a4a',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 2,
                padding: 16,
                boxPadding: 8,
                usePointStyle: true,
                cornerRadius: 12,
                displayColors: true,
                titleFont: {
                    size: 14,
                    family: "'Inter', sans-serif",
                    weight: '600'
                },
                bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                callbacks: {
                    title: function(context) {
                        return `📅 ${context[0].label}`;
                    },
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = formatCurrency(context.raw);
                        const icon = context.dataset.label === 'Income' ? '💰' : 
                                   context.dataset.label === 'Spending' ? '💸' : '📊';
                        return `${icon} ${label}: ${value}`;
                    },
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    color: '#666',
                    padding: 12,
                    callback: function(value, index) {
                        // Show every 3rd label to reduce clutter
                        return index % 3 === 0 ? this.getLabelForValue(value) : '';
                    }
                },
                border: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.08)',
                    drawBorder: false,
                    lineWidth: 1
                },
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    },
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    color: '#666',
                    padding: 12,
                    maxTicksLimit: 8
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            bar: {
                borderRadius: 8,
                borderSkipped: false
            },
            point: {
                hoverRadius: 6,
                radius: 4
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    };

    return (
        <SpendingGridWrapper>
            <CashFlowChart>
                <SectionTitle style={{fontSize: '2rem'}}>
                    Here's how your money moved lately...
                </SectionTitle>

                
                <CashFlowSummary>
                    <CashFlowIcon>
                        {netSummary > 0 ? '📈' : netSummary < 0 ? '📉' : '➡️'}
                    </CashFlowIcon>
                    <CashFlowMessageContainer>
                        <CashFlowMessage>
                            {getCashFlowMessage().main}
                        </CashFlowMessage>
                        {getCashFlowMessage().secondary && (
                            <CashFlowSecondaryMessage>
                                {getCashFlowMessage().secondary}
                            </CashFlowSecondaryMessage>
                        )}
                    </CashFlowMessageContainer>
                </CashFlowSummary>
                
                <ChartContainer>
                    {loading ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>Loading financial data...</LoadingText>
                        </LoadingContainer>
                    ) : (
                        <Bar data={getBarChartData()} options={chartOptions} height={400} />
                    )}
                </ChartContainer>

                <ChartToggles>
                    <DateRangeSelector>
                        <DateRangeButtons>
                            <SlidingBackground activeIndex={dateRangeOptions.findIndex(opt => opt.value === dateRange)} />
                            {dateRangeOptions.map((option, index) => (
                                <DateRangeButton
                                    key={option.value}
                                    active={dateRange === option.value}
                                    onClick={() => setDateRange(option.value)}
                                >
                                    {option.label}
                                </DateRangeButton>
                            ))}
                        </DateRangeButtons>
                    </DateRangeSelector>
                    
                    <ToggleGroup>
                        <ToggleButton 
                            active={showIncome} 
                            onClick={() => setShowIncome(v => !v)}
                            color="rgba(40, 167, 69, 0.8)"
                            aria-label={`${showIncome ? 'Hide' : 'Show'} income data`}
                        >
                            <ToggleIcon>💰</ToggleIcon>
                            Income
                        </ToggleButton>
                        <ToggleButton 
                            active={showSpending} 
                            onClick={() => setShowSpending(v => !v)}
                            color="rgba(220, 53, 69, 0.8)"
                            aria-label={`${showSpending ? 'Hide' : 'Show'} spending data`}
                        >
                            <ToggleIcon>💸</ToggleIcon>
                            Spending
                        </ToggleButton>
                        <ToggleButton 
                            active={showNet} 
                            onClick={() => setShowNet(v => !v)}
                            color="rgba(0, 123, 255, 0.8)"
                            aria-label={`${showNet ? 'Hide' : 'Show'} net data`}
                        >
                            <ToggleIcon>📊</ToggleIcon>
                            Net
                        </ToggleButton>
                    </ToggleGroup>
                </ChartToggles>
            </CashFlowChart>
            <RecentTransactions>
                <SectionTitle style={{fontSize: '1.75rem'}}>Recent Transactions</SectionTitle>
                {loading ? (
                    <LoadingMessage>Loading transactions...</LoadingMessage>
                ) : transactions.length > 0 ? (
                    <TransactionList>
                        {transactions
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 7)
                            .map((tx) => (
                                <TransactionItem key={tx.id}>
                                    <TransactionInfo>
                                        <TransactionName>{tx.vendor || tx.merchant_name}</TransactionName>
                                        <TransactionAccount>{tx.account?.name || 'Unknown Account'}</TransactionAccount>
                                    </TransactionInfo>
                                    <TransactionDetails>
                                        <TransactionAmount style={{ 
                                            color: tx.amount < 0 ? 'rgb(220, 53, 69)' : 'rgb(40, 167, 69)'
                                        }}>
                                            {formatCurrency(Math.abs(tx.amount))}
                                        </TransactionAmount>
                                        <TransactionDate>{formatDate(tx.date)}</TransactionDate>
                                    </TransactionDetails>
                                </TransactionItem>
                            ))}
                    </TransactionList>
                ) : (
                    <EmptyMessage>No recent transactions</EmptyMessage>
                )}
            </RecentTransactions>
        </SpendingGridWrapper>
    );
}

// -------------------------------------------------------- Spending Grid Wrapper.
const SpendingGridWrapper = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    width: 90%;
    gap: 2.5rem;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    overflow: hidden;
`
// -------------------------------------------------------- Section Title (Net Change, Recent Transactions, etc.).
const SectionTitle = styled.h2`
    font-size: 1.5rem;
    justify-self: center;
    align-self: center;
    font-weight: 600;
    margin: 0;
    color: var(--text-secondary);
    text-align: center;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
    width: 70%;
    border-bottom: 4px solid rgba(100, 100, 100, 0.1);
`
// -------------------------------------------------------- Cash Flow Chart.
const CashFlowChart = styled.div`
    font: inherit;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
`
const ChartContainer = styled.div`
    height: 400px;
    width: 100%;
    padding: 1.5rem 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border-radius: 12px;
        pointer-events: none;
    }
`
// -------------------------------------------------------- Chart Toggles. (Time Period & Chart Types).
const ChartToggles = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 0.5rem;
    gap: 0.5rem;
    font-size: 1rem;
`
const ToggleGroup = styled.div`
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 0.75rem;
    display: flex;
    gap: 0.75rem;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border-radius: 16px;
        pointer-events: none;
    }
`
const ToggleButton = styled.button`
    flex: 1;
    background: ${props => props.active ? props.color : 'rgba(255, 255, 255, 0.4)'};
    border: 2px solid ${props => props.active ? props.color : 'transparent'};
    border-radius: 16px;
    padding: 0.75rem 1rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: ${props => props.active ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:hover {
        background: ${props => props.color};
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
`
const ToggleIcon = styled.span`
    font-size: 1.1rem;
    transition: transform 0.3s ease;
    
    ${ToggleButton}:hover & {
        transform: scale(1.1);
    }
`
// -------------------------------------------------------- Stats Within Chart.
const CashFlowSummary = styled.div`
    display: flex;
    width: 90%;
    justify-self: center;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    gap: 1.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    margin: 1rem 0;
    
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
`
const CashFlowIcon = styled.span`
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    z-index: 1;
    position: relative;
    flex-shrink: 0;
`
const CashFlowMessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    z-index: 1;
    position: relative;
`
const CashFlowMessage = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.4;
`
const CashFlowSecondaryMessage = styled.div`
    font-size: 0.95rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    line-height: 1.3;
    font-style: italic;
`
const DateRangeSelector = styled.div`
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 0.5rem;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 1rem;
    position: relative;
    overflow: hidden;
`
const DateRangeButtons = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    width: 100%;
    justify-content: space-between;
    position: relative;
`
const SlidingBackground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: calc(33.333% - 0.33rem);
    height: 100%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 16px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(calc(${props => props.activeIndex} * (100% + 0.5rem)));
    z-index: 1;
`
const DateRangeButton = styled.button`
    flex: 1;
    background: transparent;
    border: none;
    border-radius: 16px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: ${props => props.active ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 0;
    text-align: center;
    position: relative;
    z-index: 2;
    &:hover {
        transform: translateY(-2px);
    }
`
// -------------------------------------------------------- Recent Transactions List.
const RecentTransactions = styled.div`
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
`
// -------------------------------------------------------- Transaction List.
const TransactionList = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-right: 0.5rem;
`
const TransactionItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);
    border: 3px solid transparent;
    border-radius: 12px;
    transition: all 0.2s ease;
    margin-bottom: 1rem;
    &:hover {
        border: 3px solid rgb(33, 144, 248);
        transform: translateX(5px);
        background: rgba(255, 255, 255, 0.7);
    }
`
const TransactionInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`
const TransactionName = styled.div`
    font-weight: 500;
    color: var(--text-primary);
`
const TransactionAccount = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
`
const TransactionDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
`
const TransactionAmount = styled.div`
    font-weight: 600;
`
const TransactionDate = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
`
// -------------------------------------------------------- Loading Messages UI State.
const LoadingMessage = styled.div`
    color: var(--text-secondary);
    text-align: center;
    padding: 1rem;
`
// -------------------------------------------------------- Empty Message UI State.
const EmptyMessage = styled.div`
    color: var(--text-secondary);
    text-align: center;
    padding: 1rem;
`
// -------------------------------------------------------- Loading Container.
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
`
const LoadingSpinner = styled.div`
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`
const LoadingText = styled.div`
    margin-top: 1rem;
    font-size: 1rem;
    color: var(--text-secondary);
`
// -------------------------------------------------------- Export Spending Grid.
export default SpendingGrid;