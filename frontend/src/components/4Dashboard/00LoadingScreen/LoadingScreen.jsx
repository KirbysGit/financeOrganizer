
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Custom hook to get viewport dimensions
 * Returns the current window width and height, updating on resize
 */
function useViewportDimensions() {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        function handleResize() {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return dimensions;
}

// helper — reflects y back inside the current band so it never sits
// exactly on min or max.  `bounce` is 0-1: 0 = stick to edge, 1 = full reflect
function softClamp(y, min, max, bounce = 0.6) {
  if (y < min) {
    const over = min - y;
    y = min + over * bounce + Math.random() * over * 0.2;  // tiny jitter
  } else if (y > max) {
    const over = y - max;
    y = max - over * bounce - Math.random() * over * 0.2;
  }
  return y;
}

/**
 * Generates a sector-constrained random-walk stock chart SVG path.
 * - Chart is split into 5 horizontal sectors, each with increasing y-bands.
 * - The walk is volatile but always trends upward, never regressing to a previous sector's min.
 * - The last sector allows a final pop, but not an out-of-place spike.
 * @param {number} numPoints
 * @param {number} width
 * @param {number} height
 * @returns {string} SVG path string
 */
function generateStockChartPath(numPoints = 100, width = 800, height = 200) {
    const minY   = 30;               // top of chart
    const maxY   = height - 20;      // bottom of chart
    const xStep  = width / (numPoints - 1);
    const points = [];
    const sectors = 5;
  
    /* ----- sector helpers -------------------------------------------------- */
    const sectorHeight = (maxY - minY) / sectors;
    const sectorBands = Array.from({ length: sectors }, (_, i) => ({
      // little side-margins so the line never touches band edges
      min: minY + i * sectorHeight + sectorHeight * 0.08,
      max: minY + (i + 1) * sectorHeight - sectorHeight * 0.08,
    }));
  
    /* ---------- start at the very bottom band (sector #4 for 5 sectors) ---- */
    let y = sectorBands[sectors - 1].max;
  
    /* ---------- random-walk parameters ------------------------------------- */
    const volatility = 60;
    const bias       = 0.3;                    // positive → y decreases → visual “up”
    const numShocks  = 1 + Math.floor(Math.random() * 3);
  
    const shockIndices = new Set();
    while (shockIndices.size < numShocks) {
      const idx = Math.floor(numPoints * (0.2 + 0.6 * Math.random()));
      if (idx > 0 && idx < numPoints - 1) shockIndices.add(idx);
    }
  
    /* ---------- main loop --------------------------------------------------- */
    for (let i = 0; i < numPoints; i++) {
      /* ❶  Flip the sector mapping: i = 0 → bottom sector, i = last → top */
      const sectorIdx =
        sectors - 1 - Math.min(sectors - 1, Math.floor((i / (numPoints - 1)) * sectors));
      const { min, max } = sectorBands[sectorIdx];
  
      if (i > 0) {
        // small random jump with slight upward pressure
        const jump = (Math.random() - 0.5) * volatility * 2 + bias;
        y -= jump;                              // subtract → smaller y → higher on screen
  
        // occasional big “news” shock
        if (shockIndices.has(i)) {
          const shock = volatility * 4 * (Math.random() > 0.5 ? 1 : -1);
          y -= shock;
        }
      }
  
      // keep y inside the current sector *without* flat clamping
      y = softClamp(y, min, max, 0.6);

      // Optional: mean-reversion toward sector center
      const center = (min + max) / 2;
      y += (center - y) * 0.05;
  
      points.push({ x: i * xStep, y });
    }
  
    /* ---------- finish near the top-right corner --------------------------- */
    points[points.length - 1].y = minY + 3;
  
    return points.reduce(
      (d, p, idx) => d + (idx ? `L${p.x},${p.y}` : `M${p.x},${p.y}`),
      ''
    );
  }
  

// =============================================================================
// LOADING SCREEN COMPONENT
// =============================================================================

/**
 * LoadingScreen Component
 * 
 * Props:
 * - loading: boolean - Whether to show the loading screen
 * - loadingProgress: number - Current loading progress (0-1)
 * - loadingStep: number - Current loading step index
 * - isTransitioning: boolean - Whether a step transition is in progress
 */
const LoadingScreen = ({ 
    loading = false, 
    loadingProgress = 0, 
    loadingStep = 0, 
    isTransitioning = false 
}) => {
    
    // =============================================================================
    // VIEWPORT DIMENSIONS
    // =============================================================================
    
    // Get actual screen dimensions
    const { width: screenWidth, height: screenHeight } = useViewportDimensions();
    
    // =============================================================================
    // CHART CONFIGURATION
    // =============================================================================
    
    // Chart dimensions - use actual screen dimensions
    const chartWidth = screenWidth;
    const chartHeight = screenHeight;
    
    // Generate the stock chart path once
    const chartPath = useMemo(() => {
        return generateStockChartPath(100, chartWidth, chartHeight);
    }, [chartWidth, chartHeight]);
    
    // Add these hooks and refs at the top of the LoadingScreen component
    const svgRef = useRef();
    const pathRef = useRef();
    const [pathLen, setPathLen] = useState(0);
    const [endPt, setEndPt] = useState(null);

    // Measure path length and update on chartPath or size change
    useLayoutEffect(() => {
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength();
            setPathLen(len);
        }
    }, [chartPath, chartWidth, chartHeight]);

    // Update the glowing ball position as loading progresses
    const strokeWidth = 6; // or whatever your actual stroke width is
    useEffect(() => {
        if (!pathRef.current || !pathLen) return;

        const ballR = 20;              // keep in sync with <circle r="10">
        const cap   = strokeWidth / 2; // 3 px for a 6-px stroke
        const centreLen = Math.min(
            pathLen,
            Math.max(0, pathLen * loadingProgress + cap + ballR)
        );
        setEndPt(pathRef.current.getPointAtLength(centreLen));
    }, [loadingProgress, pathLen, strokeWidth]);
    
    // =============================================================================
    // RENDER
    // =============================================================================
    
    // Don't render anything if not loading
    if (!loading) {
        return null;
    }
    
    return (
        <LoadingScreenContainer>
            {/* =============================================================================
                STATIC STOCK CHART BACKGROUND
                =============================================================================
                This creates a static background with a stock chart that:
                - Shows a complete stock chart line
                - Has a gradient stroke
                - Includes axis labels for context
                - Serves as a decorative background
            */}
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
                    {/* =============================================================================
                        SVG DEFINITIONS - GRADIENTS
                        =============================================================================
                        Define the gradient used for the stock chart line
                        Creates a smooth transition from blue to green
                    */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#b6e0fe" /> {/* Light blue */}
                            <stop offset="100%" stopColor="#a7ffeb" /> {/* Light green */}
                        </linearGradient>
                    </defs>
                    
                    {/* =============================================================================
                        CHART AXIS LABELS
                        =============================================================================
                        Add descriptive labels to make the chart more meaningful
                        Y-axis is rotated 90 degrees for vertical text
                    */}
                    {/* Y-axis label - "Your Money" */}
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
                    
                    {/* =============================================================================
                        STATIC STOCK CHART LINE
                        =============================================================================
                        This is the complete stock chart line:
                        - Uses the generated path
                        - Has a gradient stroke and glow effect
                        - Shows the complete line (no animation)
                        - vectorEffect="non-scaling-stroke" keeps line width consistent
                    */}
                    {/* Animated stock chart line */}
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
                    {/* Glowing ball at the end of the animated line */}
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
                
                {/* =============================================================================
                    FAST FORWARD DATE DISPLAY
                    =============================================================================
                    Shows dates progressing from today to 6 months from now
                    Creates the illusion of time passing as money grows
                */}
            </StockChartBackground>
            
            {/* =============================================================================
                LOADING CONTENT CONTAINER
                =============================================================================
                This contains all the loading UI elements:
                - Animated icon circle
                - Loading message
                - Progress bar
                - Step indicators
            */}
            <LoadingContainer>
                {/* =============================================================================
                    ANIMATED LOADING CIRCLE
                    =============================================================================
                    The main loading indicator with:
                    - Pulsing animation
                    - Ripple effect
                    - Current step icon
                    - Smooth transitions between steps
                */}
                <LoadingCircle>
                    <LoadingIcon $transitioning={isTransitioning ? 'out' : 'in'}>
                        <FontAwesomeIcon icon={LOADING_STEPS[loadingStep].icon} />
                    </LoadingIcon>
                </LoadingCircle>
                
                {/* =============================================================================
                    LOADING MESSAGE
                    =============================================================================
                    Displays the current step's message
                    Updates as the loading progresses through different phases
                */}
                <LoadingMessage>
                    {LOADING_STEPS[loadingStep].message}
                </LoadingMessage>
                
                {/* =============================================================================
                    PROGRESS BAR
                    =============================================================================
                    Visual representation of overall loading progress
                    Includes shimmer animation for visual appeal
                */}
                <LoadingProgress>
                    <ProgressBar $progress={loadingProgress} />
                </LoadingProgress>
                
                {/* =============================================================================
                    STEP INDICATORS
                    =============================================================================
                    Shows all loading steps with visual feedback:
                    - Completed steps are green
                    - Current step is blue and scaled up
                    - Future steps are gray
                    - Each step has its own icon
                */}
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

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

/**
 * Main loading screen container
 * Covers the full viewport with a gradient background
 */
const LoadingScreenContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(231, 240, 250) 0%, #e9ecef 100%);
`;

/**
 * Container for the static stock chart background
 * Positioned absolutely to fill the entire loading screen
 */
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

/**
 * Main loading content container
 * Contains all the loading UI elements with glass-morphism effect
 */
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

/**
 * Animated loading circle with pulsing and ripple effects
 * Contains the current step's icon
 */
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

/**
 * Icon container with smooth transitions between steps
 * Handles the slide animations when switching between loading steps
 */
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

/**
 * Progress bar container
 * Provides the background for the animated progress bar
 */
const LoadingProgress = styled.div`
    width: 300px;
    height: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
`;

/**
 * Animated progress bar with shimmer effect
 * Shows the overall loading progress with smooth width animation
 */
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

/**
 * Container for step indicators
 * Displays all loading steps in a horizontal row
 */
const LoadingSteps = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

/**
 * Individual step indicator with state-based styling
 * Shows different colors and animations based on step status
 */
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

/**
 * Date display styled to match the chart theme
 * Positioned in the top-right corner
 */
const DateDisplay = styled.div`
    display: flex;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 20px;
    padding: 8px 12px;
    font-size: 3rem;
    font-weight: bold;
    color: white;
    transition: opacity 0.3s ease;
    z-index: 10; /* Ensure it's above the chart */
    pointer-events: none; /* Prevent interference with other elements */
`;

export default LoadingScreen;