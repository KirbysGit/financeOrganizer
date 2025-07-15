// Imports.
import React from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import { useEffect, useState, useRef } from 'react';

// ------------------------------------------------------------------------------------------------ Dictionaries For Meter Gauge.

// -------------------------------------------------------- Brand Colors For Linear Gradient Of Meter Gauge.
const brandColors = {
    red: 'rgb(220, 53, 69)',
    orange: 'rgb(253, 126, 20)',
    yellow: 'rgb(255, 193, 7)',
    green: 'rgb(40, 167, 69)',
    positive: 'rgb(25, 135, 84)' // --amount-positive
};
// -------------------------------------------------------- Gradient Stops With Their Positions (For Marker Color).
const gradientStops = [
    { offset: 0, color: 'rgb(220, 53, 69)' },      // red
    { offset: 0.15, color: 'rgb(253, 126, 20)' },  // orange
    { offset: 0.35, color: 'rgb(255, 193, 7)' },  // yellow
    { offset: 0.65, color: 'rgb(40, 167, 69)' },  // green
    { offset: 0.92, color: 'rgb(25,135,84)' }, // deep green
    { offset: 0.97, color: 'rgb(22, 156, 92)' },  // blend between green and blue
    { offset: 1, color: 'rgb(25, 135, 212)' }      // blue (similar to --button-primary)
];

// ------------------------------------------------------------------------------------------------ Functions.

// -------------------------------------------------------- Helper Function To Interpolate Between Two Colors.
const interpolateColor = (color1, color2, factor) => {
    // Convert RGB String To RGB Object.
    const rgbToRgb = (rgb) => {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        } : null;
    };

    // Parse Colors.
    const c1 = rgbToRgb(color1);
    const c2 = rgbToRgb(color2);

    if (!c1 || !c2) return color1; // Fallback.

    // Interpolate RGB Values.
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
};
// -------------------------------------------------------- Get Color From Gradient At Specific Position (0-1).
const getColorFromGradient = (position) => {
    // Find The Two Stops That Bracket The Position.
    let startStop = gradientStops[0];
    let endStop = gradientStops[gradientStops.length - 1];

    // Find The Two Stops That Bracket The Position.
    for (let i = 0; i < gradientStops.length - 1; i++) {
        if (position >= gradientStops[i].offset && position <= gradientStops[i + 1].offset) {
            startStop = gradientStops[i];
            endStop = gradientStops[i + 1];
            break;
        }
    }

    // If Position Is Exactly At A Stop, Return That Color.
    if (Math.abs(position - startStop.offset) < 0.001) {
        return startStop.color;
    }
    if (Math.abs(position - endStop.offset) < 0.001) {
        return endStop.color;
    }

    // Calculate Interpolation Factor.
    const range = endStop.offset - startStop.offset;
    const factor = range === 0 ? 0 : (position - startStop.offset) / range;

    // Return Interpolated Color.
    return interpolateColor(startStop.color, endStop.color, factor);
};
// -------------------------------------------------------- Polar To Cartesian Conversion.
const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;  // Converts Degrees To Radians.
    const x = centerX + r * Math.cos(angleInRadians);           // Gets X Coordinate.
    const y = centerY + r * Math.sin(angleInRadians);           // Gets Y Coordinate.
    return { x, y };                                            // Returns X & Y Coordinates.
};

// -------------------------------------------------------- Function 4 Formatting Last Updated Time.
const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};

// ------------------------------------------------------------------------------------------------ Meter Gauge Component.
const MeterGauge = ({ score = 0, status, lastUpdated, minScore = 0, maxScore = 100, lastCalculated, countdown, growthData }) => {

    const requestRef = useRef();  // Ref 4 Request Animation Frame.

    const [animatedScore, setAnimatedScore] = useState(0);  // State 4 Animated Score (Default -> 0)

    // Set Display Status.
    const displayStatus = status || "Good";

    // Normalize Score (0-100).
    const normalizedScore = Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));

    // -------------------------------------------------------- Start Animation.
    const startAnimation = () => {
        // Cancel Any Existing Animation.
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        
        // Reset Animated Score To 0.
        setAnimatedScore(0);
        
        // Start New Animation.
        let startTime = null;
        const duration = 1500; 

        // Animate The Score.
        const animate = (timestamp) => {
            // If Start Time Is Null, Set It To The Current Timestamp.
            if (!startTime) startTime = timestamp;

            // Calculate Progress.
            const progress = timestamp - startTime;
            const progressFraction = Math.min(progress / duration, 1);

            // Calculate Current Score.
            const currentScore = progressFraction * normalizedScore;
            
            // Set Animated Score.
            setAnimatedScore(currentScore);

            // If Progress Is Less Than Duration, Request New Animation Frame.
            if (progress < duration) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        // Set Request Animation Frame.
        requestRef.current = requestAnimationFrame(animate);
    };

    // -------------------------------------------------------- Use Effect To Start Animation.
    useEffect(() => {
        startAnimation();
    }, [normalizedScore]);

    // -------------------------------------------------------- Gauge Dimensions.
    const radius = 250;
    const stroke = 50;
    const normalizedRadius = radius - stroke / 2;
    const arcAngle = 230;
    const startAngle = 155; 

    // -------------------------------------------------------- Gauge Calculations.
    const fullCircumference = 2 * Math.PI * normalizedRadius;   // Gets Full Circumference Of Gauge.
    const arcCircumference = (arcAngle / 360) * fullCircumference; // Gets Arc Circumference.
    const gapCircumference = fullCircumference - arcCircumference; // Gets Gap Circumference.

    const strokeDasharray = `${arcCircumference} ${gapCircumference}`; // Gets Stroke Dasharray. (Where It Draws The Arc)
    const scorePercentage = animatedScore / 100; // Gets Score Percentage.
    const markerAngle = startAngle + (scorePercentage * arcAngle); // Gets Marker Angle. (Where Marker Is Placed)


    // Sets Marker Position.
    const markerPos = polarToCartesian(radius, radius, normalizedRadius, markerAngle);
    
    // Calculate Marker's Position Along The Gradient (0-1).
    const gradientPosition = scorePercentage; // This Is Already 0-1.
    const markerColor = getColorFromGradient(gradientPosition); // Gets Marker Color. (Based On Location In Gradient)

    // Determine User Percentile Color.
    let userPercent = 10;
    if (score >= 90) userPercent = 95;
    else if (score >= 75) userPercent = 75;
    else if (score >= 60) userPercent = 50;
    else if (score >= 45) userPercent = 25;

    // Growth indicator logic
    const hasGrowthData = growthData && growthData.has_growth_data;
    const scoreChange = hasGrowthData ? growthData.current_score - growthData.previous_score : 0;
    const showGrowthIndicator = hasGrowthData && Math.abs(scoreChange) > 0;

    return (
        <GaugeContainer>
            <GaugeWrapper>
                
                <svg width={radius * 2} height={radius * 2}>
                    <defs>
                        <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="0">
                            <stop offset="0%" stopColor={brandColors.red} />
                            <stop offset="15%" stopColor={brandColors.orange} />
                            <stop offset="35%" stopColor={brandColors.yellow} />
                            <stop offset="65%" stopColor={brandColors.green} />
                            <stop offset="90%" stopColor={brandColors.positive} />
                            <stop offset="100%" stopColor="var(--button-primary)" />
                        </linearGradient>
                    </defs>
                    
                    {/* Base Circle - Subtle Background Track */}
                    <circle
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={stroke}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                    />
                    {/* Arc segments */}
                    {(() => {
                        const segments = 200;
                        const paths = [];

                        // Draw Arc Segments.
                        for (let i = 0; i < segments; i++) {
                            const t1 = i / segments;
                            const t2 = (i + 1) / segments;
                            const angle1 = startAngle + t1 * arcAngle;
                            const angle2 = startAngle + t2 * arcAngle;
                            const color = getColorFromGradient(t1);
                            const start = polarToCartesian(radius, radius, normalizedRadius, angle1);
                            const end = polarToCartesian(radius, radius, normalizedRadius, angle2);
                            const largeArcFlag = 0;
                            const pathData = [
                                `M ${start.x} ${start.y}`,
                                `A ${normalizedRadius} ${normalizedRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
                            ].join(' ');
                            paths.push(
                                <path
                                    key={i}
                                    d={pathData}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={stroke}
                                    strokeLinecap="round"
                                />
                            );
                        }
                        return paths;
                    })()}
                    {/* Marker - Rendered Last To Be On Top */}
                    <Marker 
                        cx={markerPos.x} 
                        cy={markerPos.y} 
                        r="17.5" 
                        color={markerColor} 
                    />
                </svg>

                <GaugeCenterText>
                        <GaugeScore color={markerColor}>{Math.round(animatedScore)}</GaugeScore>
                        <GaugeStatus>{displayStatus}</GaugeStatus>
                        
                        {/* Growth Indicator */}
                        {showGrowthIndicator && (
                            <GrowthIndicator $isPositive={scoreChange > 0}>
                                <GrowthIcon>{scoreChange > 0 ? '↗' : '↘'}</GrowthIcon>
                                <GrowthText>{Math.abs(scoreChange)} pts</GrowthText>
                            </GrowthIndicator>
                        )}
                        
                        <GaugeUpdate>
                            <UpdateInfo>
                                <UpdateLabel>Last updated:</UpdateLabel>
                                <UpdateTime>{formatLastUpdated(lastCalculated)}</UpdateTime>
                            </UpdateInfo>
                            {countdown && (
                                <CountdownInfo>
                                    <CountdownText>{countdown}</CountdownText>
                                </CountdownInfo>
                            )}
                        </GaugeUpdate>
                </GaugeCenterText>
                
            </GaugeWrapper>
        </GaugeContainer>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Meter Gauge Container.
const GaugeContainer = styled.div`
    margin-top: -1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: inherit;
`;
// -------------------------------------------------------- Direct Gauge Wrapper.
const GaugeWrapper = styled.div`
    padding-top: 2rem;
    position: relative;
    width: auto;
    height: max-content;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: -4rem;
`;
// -------------------------------------------------------- Gauge Center Text Container.
const GaugeCenterText = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
// -------------------------------------------------------- Gauge Score Text. (The Centi. Score)
const GaugeScore = styled.div`
    width: max-content;
    text-align: center;
    font-size: 10rem;
    font-weight: bold;
    line-height: 1;
    margin: 0;
    padding: 0;
    text-align: center;
    color: ${props => props.color};
`;
// -------------------------------------------------------- Gauge Status Text. (Good, Bad, etc.)
const GaugeStatus = styled.div`
    width: max-content;
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-secondary);
`;
// -------------------------------------------------------- Growth Indicator.
const GrowthIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    margin-top: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    background: ${props => props.$isPositive ? 'rgba(25, 135, 84, 0.15)' : 'rgba(220, 53, 69, 0.15)'};
    border: 1px solid ${props => props.$isPositive ? 'rgba(25, 135, 84, 0.3)' : 'rgba(220, 53, 69, 0.3)'};
    animation: ${props => props.$isPositive ? 'pulse' : 'shake'} 2s ease-in-out;
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }
`;
// -------------------------------------------------------- Growth Icon.
const GrowthIcon = styled.span`
    font-size: 1.2rem;
    font-weight: bold;
    color: ${props => props.$isPositive ? 'rgb(25, 135, 84)' : 'rgb(220, 53, 69)'};
`;
// -------------------------------------------------------- Growth Text.
const GrowthText = styled.span`
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$isPositive ? 'rgb(25, 135, 84)' : 'rgb(220, 53, 69)'};
`;
// -------------------------------------------------------- Gauge Update Text. (Last Updated ...)
const GaugeUpdate = styled.div`
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
    font-size: 1rem;
    color: var(--text-tertiary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5em 1.2em;
`;
// -------------------------------------------------------- Update Info Container.
const UpdateInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375em;
`;
// -------------------------------------------------------- Update Label Text.
const UpdateLabel = styled.div`
    font-size: 1.25rem;
    color: var(--text-tertiary);
`;
// -------------------------------------------------------- Update Time Text.
const UpdateTime = styled.div`
    font-size: 1.25rem;
    font-weight: 600;
    background: linear-gradient(to right, var(--button-primary), var(--amount-positive));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;
// -------------------------------------------------------- Countdown Info Container.
const CountdownInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;
// -------------------------------------------------------- Countdown Text.
const CountdownText = styled.div`
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;
// -------------------------------------------------------- Marker. (The Circle That Moves Through Gauge)
const Marker = styled.circle`
    fill: ${props => props.color};
    stroke: #ffffff;
    stroke-width: 4px;
    filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
`;

// Export Component.
export default MeterGauge;
