// Imports.
import React from "react";
import { useMemo, useRef } from "react";
import { styled } from "styled-components";

import { Line } from "react-chartjs-2";
import 'chart.js/auto';

// ------------------------------------------------------------------------------------------------ Centi Chart Component.
const CentiChart = ({ scoreHistory }) => { 
    const raw = scoreHistory.history.scores;

    console.log("Raw Data:", raw);
    
    const points = useMemo(() => [...raw].map(p => ({
        date: new Date(p.score_date),
        score: p.total_score,
    })).sort((a, b) => a.date.valueOf() - b.date.valueOf()), [raw]);

    console.log("Points:", points);

    const chartRef = useRef(null);

    const data = useMemo(() => {
        const labels = points.map(p => p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const dataset = {
            label: "CentiScore",
            data: points.map(p => p.score),
            tension: 0.4,
            borderWidth: 4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(0, 123, 255, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 3,
            pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 4,
            fill: true,
            borderColor: ctx => {
                if(!ctx.chart.ctx) return 'rgb(13, 110, 253)';
                const g = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                g.addColorStop(0, 'rgb(13, 110, 253)');
                g.addColorStop(1, 'rgb(25, 135, 84, 0.05)');
                return g;
            },
            backgroundColor: ctx => {
                if(!ctx.chart.ctx) return 'rgba(13, 110, 253, 0.15)';
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                g.addColorStop(0, 'rgba(13, 110, 253, 0.35)');
                g.addColorStop(1, 'rgba(25, 135, 84, 0.05)');
                return g;
            },
        };

        return { labels, datasets: [dataset] };
    }, [points]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `Score: ${ctx.parsed.y}`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 20 }, suggestMax: Math.max(...points.map(p => p.score)) + 10 },
        },
    };

   
    return (
        <>
            <ChartContainer>
                <Line ref={chartRef} data={data} options={options} />
            </ChartContainer>
        </>
    )
};

const ChartContainer = styled.div`
    border: 2px solid red;
    width: 100%; 
    position: relative;
`;

export default CentiChart;