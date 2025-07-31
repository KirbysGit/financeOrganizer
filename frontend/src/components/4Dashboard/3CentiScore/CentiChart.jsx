// Imports.
import React from "react";
import { useMemo, useRef } from "react";
import { styled } from "styled-components";

import { Line } from "react-chartjs-2";
import 'chart.js/auto';


// ------------------------------------------------------------------------------------------------ Centi Chart Component.
const CentiChart = ({ scoreHistory }) => { 
    const raw = scoreHistory?.history?.scores || [];

    // Filter out invalid dates and scores
    const validRaw = raw.filter(r => {
        const d = new Date(r.score_date);
        return !isNaN(d) && typeof r.total_score === 'number';
    });

    if (!validRaw.length) {
        return (
            <ChartWrapper>
                <EmptyChartMessage>No Centi Score data available yet. Complete a few weeks to see your progress!</EmptyChartMessage>
            </ChartWrapper>
        );
    }

    const points = useMemo(() => [...validRaw].map(p => ({
        date: new Date(p.score_date),
        score: p.total_score,
    })).sort((a, b) => a.date.valueOf() - b.date.valueOf()), [validRaw]);

    console.log("Raw Data:", raw);
    
    console.log("Points:", points);

    const chartRef = useRef(null);

    const data = useMemo(() => {
        
        const toSundayIso = (d) => {
            const s = new Date(d);
            s.setDate(s.getDate() - s.getDay());   // 0 = Sunday
            s.setHours(0, 0, 0, 0);
            return s.toISOString().slice(0, 10);   // "YYYY-MM-DD"
        };
    
        /* 1 —— lookup: Sunday‑ISO → latest score that week */
        const scoreBySunday = Object.fromEntries(
            raw.map(r => [toSundayIso(new Date(r.score_date)), r.total_score])
        );
    
        /* 2 —— choose the pivot Sunday = Sunday‑of‑latest score */
        const latest = new Date(Math.max(...raw.map(r => Date.parse(r.score_date))));
        const pivot  = new Date(latest);
        pivot.setDate(pivot.getDate() - pivot.getDay()); // back to Sunday
    
        /* 3 —— build three Sundays before + pivot + three after */
        const sundays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(pivot);
            d.setDate(pivot.getDate() + (i - 3) * 7);
            return d;
        });
    
        /* 4 —— labels & data */
        const labels = sundays.map(d =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
    
        const dataPoints = sundays.map(d =>
            scoreBySunday[toSundayIso(d)] ?? null    // null where no score yet
        );

        // Generate Dataset For Chart.
        const dataset = {
            label: "CentiScore",
            data: dataPoints,
            tension: 0.5,
            borderWidth: 4,
            pointRadius: 7,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(0, 123, 255, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 3,
            pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 4,
            fill: true,
            borderColor: ctx => {
                if(!ctx.chart.ctx) return 'rgba(0, 123, 255, 1)';
                const g = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                g.addColorStop(0, 'rgba(0, 123, 255, 1)');
                g.addColorStop(1, 'rgba(40, 167, 69, 0.8)');
                return g;
            },
            backgroundColor: ctx => {
                if(!ctx.chart.ctx) return 'rgba(0, 123, 255, 0.1)';
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                g.addColorStop(0, 'rgba(0, 123, 255, 0.35)');
                g.addColorStop(1, 'rgba(40, 167, 69, 0.05)');
                return g;
            },
            spanGaps: true, // Connect points across null values
        };

        return { labels, datasets: [dataset] };
    }, [points]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        // Animation
        animation: {
            duration: 1200,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1a1a1a',
                bodyColor: '#4a4a4a',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 2,
                padding: 16,
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
                        return `📊 CentiScore: ${context.parsed.y}`;
                    },
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false,
                    lineWidth: 1
                },
                ticks: {
                    maxRotation: 0,
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    color: '#666',
                    padding: 12,
                    callback: function(value, index) {
                        // Show every 2nd label for better spacing
                        return index % 2 === 0 ? this.getLabelForValue(value) : '';
                    }
                },
                border: {
                    display: false
                },
                min: 0,
                max: 8 // Show 9 points total (0-8)
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.08)',
                    drawBorder: false,
                    lineWidth: 1
                },
                ticks: {
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    color: '#666',
                    padding: 12,
                    maxTicksLimit: 8,
                    stepSize: 20
                },
                border: {
                    display: false
                },
                suggestMax: Math.max(...points.map(p => p.score)) + 10
            },
        },
        // Interaction
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        // Elements
        elements: {
            point: {
                hoverRadius: 8,
                radius: 6
            }
        },
        // Layout
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
        <ChartWrapper>
            <Line ref={chartRef} data={data} options={options} height={425} />
        </ChartWrapper>
    )
};

const ChartWrapper = styled.div`
    transition: all 0.3s ease;
    border: 3px solid transparent;
    position: relative;
    width: 100%;    
    height: max-content;
    border-radius: 12px;
    padding: 1rem;
`;

const ChartTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
    text-align: center;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    padding-bottom: 0.75rem;
    width: 70%;
    margin-left: auto;
    margin-right: auto;
`;

const EmptyChartMessage = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 1.1rem;
    padding: 2rem;
`;


export default CentiChart;