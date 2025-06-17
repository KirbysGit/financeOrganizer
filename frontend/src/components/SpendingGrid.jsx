import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { fetchDetailedTransactions } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
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
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'cumulative'

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const res = await fetchDetailedTransactions();
                // Sort by date and get most recent 5 for the list
                const sortedTransactions = res.data
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);
                setTransactions(sortedTransactions);

                // Process data for the chart
                const last30Days = processChartData(res.data);
                setChartData(last30Days);
            } catch (err) {
                console.log("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        getTransactions();
    }, []);

    const processChartData = (transactions) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = transactions.filter(tx => 
            new Date(tx.date) >= thirtyDaysAgo
        );

        // Create array of dates for the last 30 days
        const dates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
        });

        // Initialize data arrays
        const incomeData = new Array(30).fill(0);
        const spendingData = new Array(30).fill(0);

        // Process transactions
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

        // Calculate net cash flow
        const netData = incomeData.map((inc, i) => inc - spendingData[i]);

        // Calculate cumulative if needed
        let runningIncome = 0;
        let runningSpending = 0;
        const cumulativeIncome = incomeData.map(amount => {
            runningIncome += amount;
            return runningIncome;
        });
        const cumulativeSpending = spendingData.map(amount => {
            runningSpending += amount;
            return runningSpending;
        });

        return {
            labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            daily: {
                income: incomeData,
                spending: spendingData,
                net: netData
            },
            cumulative: {
                income: cumulativeIncome,
                spending: cumulativeSpending,
                net: netData.map((_, i) => cumulativeIncome[i] - cumulativeSpending[i])
            }
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                display: false // We'll use custom legend
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = formatCurrency(context.raw);
                        return `${label}: ${value}`;
                    }
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
                        family: "'Inter', sans-serif"
                    },
                    color: '#666',
                    callback: function(value, index) {
                        // Show every 5th tick
                        return index % 5 === 0 ? this.getLabelForValue(value) : '';
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    },
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    color: '#666',
                    padding: 10
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4
            }
        }
    };

    const getChartData = () => {
        const data = viewMode === 'daily' ? chartData?.daily : chartData?.cumulative;
        return {
            labels: chartData?.labels || [],
            datasets: [
                {
                    label: 'Income',
                    data: data?.income || [],
                    borderColor: 'var(--amount-positive)',
                    backgroundColor: 'rgba(40, 167, 69, 0.15)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'var(--amount-positive)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'var(--amount-positive)'
                },
                {
                    label: 'Spending',
                    data: data?.spending || [],
                    borderColor: 'var(--amount-negative)',
                    backgroundColor: 'rgba(220, 53, 69, 0.15)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'var(--amount-negative)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'var(--amount-negative)'
                },
                {
                    label: 'Net Cash Flow',
                    data: data?.net || [],
                    borderColor: 'var(--button-primary)',
                    backgroundColor: 'rgba(13, 110, 253, 0.15)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: 'var(--button-primary)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'var(--button-primary)',
                    hidden: true
                }
            ]
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

    return (
        <SpendingGridWrapper>
            <RecentTransactions>
                <SectionTitle>Recent Transactions</SectionTitle>
                {loading ? (
                    <LoadingMessage>Loading transactions...</LoadingMessage>
                ) : transactions.length > 0 ? (
                    <TransactionList>
                        {transactions.map((tx) => (
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
            <CashFlowChart>
                <ChartHeader>
                    <SectionTitle>Your Past 30 Days at a Glance</SectionTitle>
                    <ViewToggle>
                        <ToggleButton 
                            active={viewMode === 'daily'} 
                            onClick={() => setViewMode('daily')}
                        >
                            Daily
                        </ToggleButton>
                        <ToggleButton 
                            active={viewMode === 'cumulative'} 
                            onClick={() => setViewMode('cumulative')}
                        >
                            Cumulative
                        </ToggleButton>
                    </ViewToggle>
                </ChartHeader>
                <LegendRow>
                    <LegendItem>
                        <LegendDot color="var(--amount-positive)" />
                        Income
                    </LegendItem>
                    <LegendItem>
                        <LegendDot color="var(--amount-negative)" />
                        Spending
                    </LegendItem>
                    <LegendItem>
                        <LegendDot color="var(--button-primary)" />
                        Net Flow
                    </LegendItem>
                </LegendRow>
                {loading ? (
                    <LoadingMessage>Loading chart data...</LoadingMessage>
                ) : chartData ? (
                    <ChartContainer>
                        <Line data={getChartData()} options={chartOptions} />
                    </ChartContainer>
                ) : (
                    <EmptyMessage>No data available for chart</EmptyMessage>
                )}
            </CashFlowChart>
        </SpendingGridWrapper>
    );
}

// -------------------------------------------------------- Wrapper For Spending Grid.
const SpendingGridWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    width: 90%;
    gap: 2.5rem;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    overflow: hidden;
`

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
    max-height: 600px;
    overflow-y: auto;
`

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

const LoadingMessage = styled.div`
    color: var(--text-secondary);
    text-align: center;
    padding: 1rem;
`

const EmptyMessage = styled.div`
    color: var(--text-secondary);
    text-align: center;
    padding: 1rem;
`

const CashFlowChart = styled.div`
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    box-sizing: border-box;
    overflow: hidden;
`

const ChartContainer = styled.div`
    height: 400px;
    width: 100%;
    padding: 1rem 0;
`

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`

const ViewToggle = styled.div`
    display: flex;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    padding: 0.25rem;
    border-radius: 8px;
`

const ToggleButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: ${props => props.active ? 'var(--button-primary)' : 'transparent'};
    color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.active ? 'var(--button-primary)' : 'rgba(33, 144, 248, 0.1)'};
    }
`

const LegendRow = styled.div`
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 1rem;
`

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
`

const LegendDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.color};
`

export default SpendingGrid;