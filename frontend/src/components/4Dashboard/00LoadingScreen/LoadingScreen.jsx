// LoadingScreen.jsx

// This is the loading screen component used for loading the user's information into the Dashboard.
// Had the idea of like a stock chart as the loading aniamtion, so I made it, some weird behaviors with it,
// but I think the current result looks really good, and its a very unique loading screen. Maybe in future
// smooth it out more and get a more exact seeded random walk, but for now this is good enough.

// Imports.
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { 
    faUser, 
    faDatabase, 
    faSync, 
    faChartLine, 
    faPalette 
} from '@fortawesome/free-solid-svg-icons';

// Defines Loading Steps & Icons & Corresponding Messages.
const LOADING_STEPS = [
    { 
        icon: faUser, 
        message: "Grabbing your data...", 
        duration: 600 
    },
    { 
        icon: faDatabase, 
        message: "Connecting to accounts...", 
        duration: 600 
    },
    { 
        icon: faSync, 
        message: "Syncing transactions...", 
        duration: 600 
    },
    { 
        icon: faChartLine, 
        message: "Calculating insights...", 
        duration: 600 
    },
    { 
        icon: faPalette, 
        message: "Making it beautiful...", 
        duration: 600 
    },
];

// ------------------------------------------------------------------------------------------------ Helper Functions.

// Custom Hook To Get Viewport Dimensions.
function useViewportDimensions() {
    // Get Window Width & Height.
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Handle Resize.
    useEffect(() => {
        function handleResize() {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        // Add Event Listener For Resize.
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Return Dimensions.
    return dimensions;
}

// Soft Clamp Function.
// Helper — Reflects Y Back Inside The Current Band So It Never Sits Exactly On Min Or Max.
// `Bounce` Is 0-1: 0 = Stick To Edge, 1 = Full Reflect.
function softClamp(y, min, max, bounce = 0.6) {
  if (y < min) {
    const over = min - y;
    y = min + over * bounce + Math.random() * over * 0.2;  // Tiny Jitter.
  } else if (y > max) {
    const over = y - max;
    y = max - over * bounce - Math.random() * over * 0.2;
  }
  return y;
}

// Generate Stock Chart Path.
function generateStockChartPath(numPoints = 100, width = 800, height = 200) {
    const minY   = 30;               // Top Of Chart.
    const maxY   = height - 20;      // Bottom Of Chart.
    const xStep  = width / (numPoints - 1);
    const points = [];
    const sectors = 5;
  
    // Sector Helpers.
    const sectorHeight = (maxY - minY) / sectors;
    const sectorBands = Array.from({ length: sectors }, (_, i) => ({
      // Little Side-Margins So The Line Never Touches Band Edges.
      min: minY + i * sectorHeight + sectorHeight * 0.08,
      max: minY + (i + 1) * sectorHeight - sectorHeight * 0.08,
    }));
  
    // Start At The Very Bottom Band (Sector #4 For 5 Sectors).
    let y = sectorBands[sectors - 1].max;
  
    // Random-Walk Parameters.
    const volatility = 60;
    const bias       = 0.3;                    // Positive → Y Decreases → Visual “Up”.
    const numShocks  = 1 + Math.floor(Math.random() * 3);
  
    const shockIndices = new Set();
    while (shockIndices.size < numShocks) {
      const idx = Math.floor(numPoints * (0.2 + 0.6 * Math.random()));
      if (idx > 0 && idx < numPoints - 1) shockIndices.add(idx);
    }
  
    // Main Loop.
    for (let i = 0; i < numPoints; i++) {
      // Flip The Sector Mapping: i = 0 → Bottom Sector, i = Last → Top.
      const sectorIdx =
        sectors - 1 - Math.min(sectors - 1, Math.floor((i / (numPoints - 1)) * sectors));
      const { min, max } = sectorBands[sectorIdx];
  
      if (i > 0) {
        // Small Random Jump With Slight Upward Pressure.
        const jump = (Math.random() - 0.5) * volatility * 2 + bias;
        y -= jump;                              // Subtract → Smaller Y → Higher On Screen.
  
        // Occasional Big “News” Shock.
        if (shockIndices.has(i)) {
          const shock = volatility * 4 * (Math.random() > 0.5 ? 1 : -1);
          y -= shock;
        }
      }
  
      // Keep Y Inside The Current Sector *Without* Flat Clamping.
      y = softClamp(y, min, max, 0.6);

      // Optional: Mean-Reversion Toward Sector Center.
      const center = (min + max) / 2;
      y += (center - y) * 0.05;
  
      points.push({ x: i * xStep, y });
    }
  
    // Finish Near The Top-Right Corner.
    points[points.length - 1].y = minY + 3;
  
    return points.reduce(
      (d, p, idx) => d + (idx ? `L${p.x},${p.y}` : `M${p.x},${p.y}`),
      ''
    );
  }
  

// ------------------------------------------------------------------------------------------------ LoadingScreen Component.
const LoadingScreen = ({ 
    loading = false, 
    loadingProgress = 0, 
    loadingStep = 0, 
    isTransitioning = false 
}) => {
    
    // ------------------------------------------------------------------------------------------------ Viewport Dimensions.
    
    // Get Actual Screen Dimensions.
    const { width: screenWidth, height: screenHeight } = useViewportDimensions();
    
    // ------------------------------------------------------------------------------------------------ Chart Configuration.
    
    // Chart Dimensions - Use Actual Screen Dimensions.
    const chartWidth = screenWidth;
    const chartHeight = screenHeight;
    
    // Generate The Stock Chart Path Once.
    const chartPath = useMemo(() => {
        return generateStockChartPath(100, chartWidth, chartHeight);
    }, [chartWidth, chartHeight]);
    
    // Add These Hooks And Refs At The Top Of The LoadingScreen Component.
    const svgRef = useRef();
    const pathRef = useRef();
    const [pathLen, setPathLen] = useState(0);
    const [endPt, setEndPt] = useState(null);

    // Measure Path Length And Update On ChartPath Or Size Change.
    useLayoutEffect(() => {
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength();
            setPathLen(len);
        }
    }, [chartPath, chartWidth, chartHeight]);

    // Update The Glowing Ball Position As Loading Progresses.
    const strokeWidth = 6; // Or Whatever Your Actual Stroke Width Is.
    useEffect(() => {
        if (!pathRef.current || !pathLen) return;

        const ballR = 20;              // Keep In Sync With <circle r="10">.
        const cap   = strokeWidth / 2; // 3 Px For A 6-Px Stroke.
        const centreLen = Math.min(
            pathLen,
            Math.max(0, pathLen * loadingProgress + cap + ballR)
        );
        setEndPt(pathRef.current.getPointAtLength(centreLen));
    }, [loadingProgress, pathLen, strokeWidth]);
    
    // ------------------------------------------------------------------------------------------------ Render.
    
    // Don't Render Anything If Not Loading.
    if (!loading) {
        return null;
    }
    
    return (
        <LoadingScreenContainer>
            <StockChartBackground>
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%' 
                    }}
                    ref={svgRef}
                >
                    {/* Gradient For The Stock Chart Line. */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#b6e0fe" /> {/* Light blue */}
                            <stop offset="100%" stopColor="#a7ffeb" /> {/* Light green */}
                        </linearGradient>
                    </defs>
                    
                    {/* Chart Axis Labels. */}
                    <text 
                        x={20} 
                        y={chartHeight/2 + 120} 
                        fill="#b6e0fe" 
                        fontSize="4rem" 
                        fontWeight="bold" 
                        transform={`rotate(-90 20,${chartHeight/2 + 30})`} 
                        textAnchor="middle"
                    >
                        Your Money
                    </text>
                    
                    {/* X-axis label - "Your Time" */}
                    <text 
                        x={chartWidth/2} 
                        y={chartHeight - 50} 
                        fill="#b6e0fe" 
                        fontSize="4rem" 
                        fontWeight="bold" 
                        textAnchor="middle"
                    >
                        Your Time
                    </text>
                    
                    {/* Animated Stock Chart Line. */}
                    <path
                        ref={pathRef}
                        d={chartPath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="6"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        filter="drop-shadow(0 0 8px #b6e0fe)"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray={pathLen}
                        strokeDashoffset={pathLen * (1 - loadingProgress)}
                    />

                    {/* Glowing Ball At The End Of The Animated Line. */}
                    {pathLen > 0 && endPt && (
                        <>
                            {/* Halo */}
                            <circle
                                cx={endPt.x}
                                cy={endPt.y}
                                r="20"
                                fill="#a7ffeb"
                                opacity="0.25"
                                filter="blur(2px)"
                                pointerEvents="none"
                            />
                            {/* Main ball */}
                            <circle
                                cx={endPt.x}
                                cy={endPt.y}
                                r="15"
                                fill="#a7ffeb"
                                filter="drop-shadow(0 0 16px #a7ffeb)"
                                pointerEvents="none"
                            />
                        </>
                    )}
                    
                </svg>

            </StockChartBackground>
            
            <LoadingContainer>
                {/* Animated Loading Circle. */}
                <LoadingCircle>
                    <LoadingIcon $transitioning={isTransitioning ? 'out' : 'in'}>
                        <FontAwesomeIcon icon={LOADING_STEPS[loadingStep].icon} />
                    </LoadingIcon>
                </LoadingCircle>
                
                {/* Loading Message. */}
                <LoadingMessage>
                    {LOADING_STEPS[loadingStep].message}
                </LoadingMessage>
                
                {/* Progress Bar. */}
                <LoadingProgress>
                    <ProgressBar $progress={loadingProgress} />
                </LoadingProgress>
                
                {/* Step Indicators. */}
                <LoadingSteps>
                    {LOADING_STEPS.map((step, index) => (
                        <StepIndicator 
                            key={index} 
                            $active={index === loadingStep}
                            $completed={index < loadingStep}
                        >
                            <FontAwesomeIcon icon={step.icon} />
                        </StepIndicator>
                    ))}
                </LoadingSteps>
            </LoadingContainer>
        </LoadingScreenContainer>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Main Loading Screen Container.
const LoadingScreenContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(231, 240, 250) 0%, #e9ecef 100%);
`;

// -------------------------------------------------------- Stock Chart Background Container.
const StockChartBackground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4f46e5, #10b981); /* Darker green gradient */
    z-index: 1; /* Ensure it's below the loading modal */
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
`;

// -------------------------------------------------------- Main Loading Content Container.
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 3rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: slideIn 0.5s ease-out;
    z-index: 3; /* Ensure it's above the chart background */

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// -------------------------------------------------------- Animated Loading Circle.
const LoadingCircle = styled.div`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
    animation: pulse 2s ease-in-out infinite;
    position: relative;

    /* Ripple effect around the circle */
    &::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        opacity: 0.3;
        animation: ripple 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes ripple {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(1.2); opacity: 0; }
    }
`;

// -------------------------------------------------------- Loading Icon.
const LoadingIcon = styled.div`
    color: white;
    font-size: 2.5rem;
    transition: all 0.3s ease;
    animation: ${props => {
        if (props.$transitioning === 'out') return 'slideOutLeft 0.5s ease-in-out forwards';
        if (props.$transitioning === 'in') return 'slideInRight 0.5s ease-in-out forwards';
        return 'none';
    }};

    @keyframes slideOutLeft {
        0% { 
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        100% { 
            transform: translateX(-80px) scale(0.7);
            opacity: 0;
        }
    }

    @keyframes slideInRight {
        0% { 
            transform: translateX(80px) scale(0.7);
            opacity: 0;
        }
        100% { 
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
`;

/**
 * Loading message text with gradient effect
 * Displays the current step's descriptive message
 */
const LoadingMessage = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    animation: fadeInOut 0.3s ease-in-out;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--button-primary);

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
    }
`;

// -------------------------------------------------------- Progress Bar.
const LoadingProgress = styled.div`
    width: 300px;
    height: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
`;

// -------------------------------------------------------- Animated Progress Bar.
const ProgressBar = styled.div`
    height: 100%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 4px;
    width: ${props => props.$progress * 100}%;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;

    /* Shimmer effect that moves across the progress bar */
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;

// -------------------------------------------------------- Loading Steps.
const LoadingSteps = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

// -------------------------------------------------------- Step Indicator.
const StepIndicator = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: ${props => {
        if (props.$completed) return 'linear-gradient(135deg, var(--amount-positive), #28a745)'; // Green for completed
        if (props.$active) return 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))'; // Blue for active
        return 'rgba(0, 0, 0, 0.1)'; // Gray for future steps
    }};
    color: ${props => props.$completed || props.$active ? 'white' : 'var(--text-secondary)'};
    box-shadow: ${props => props.$active ? '0 4px 12px rgba(0, 123, 255, 0.3)' : 'none'};
    transform: ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};

    /* Bounce animation for the active step's icon */
    svg {
        animation: ${props => props.$active ? 'bounce 0.6s ease-in-out' : 'none'};
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;

// Export The LoadingScreen Component.
export default LoadingScreen;