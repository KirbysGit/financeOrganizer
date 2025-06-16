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
        // Get the last 30 days of data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Filter transactions from last 30 days
        const recentTransactions = transactions.filter(tx => 
            new Date(tx.date) >= thirtyDaysAgo
        );

        // Create an array of dates for the last 30 days
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

        // Calculate running totals
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
            income: cumulativeIncome,
            spending: cumulativeSpending
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
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
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    },
                    font: {
                        size: 12
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const getChartData = () => ({
        labels: chartData?.labels || [],
        datasets: [
            {
                label: 'Income',
                data: chartData?.income || [],
                borderColor: 'rgb(40, 167, 69)',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Spending',
                data: chartData?.spending || [],
                borderColor: 'rgb(220, 53, 69)',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    });

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
                <SectionTitle>Monthly Cash Flow</SectionTitle>
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
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
`

const TransactionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.5rem;
`

const TransactionItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 3px solid transparent;
    border-radius: 12px;
    transition: all 0.2s ease;

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

export default SpendingGrid;