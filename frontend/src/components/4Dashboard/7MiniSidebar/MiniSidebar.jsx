// MiniSidebar.jsx

// This is the mini sidebar component that is used on the dashboard. It contains the navigation items for the dashboard.
// It also contains the smooth scroll functionality for the dashboard.

// Imports.
import React, { useState, useEffect, useRef } from 'react';
import { styled, keyframes, css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUser, faCreditCard, faList } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';

// -------------------------------------------------------- Animations.
const slideIn = keyframes`
    from {
        transform: translateX(-100%) translateY(-50%);
        opacity: 0;
    }
    to {
        transform: translateX(0) translateY(-50%);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(0) translateY(-50%);
        opacity: 1;
    }
    to {
        transform: translateX(-100%) translateY(-50%);
        opacity: 0;
    }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// -------------------------------------------------------- MiniSidebar Component.
const MiniSidebar = () => {
    // States.
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('recent-section');
    
    // Race-Free Observer Control Using Refs.
    const ignoreObserverRef = useRef(false);      // True = Ignore IO Events.
    const scrollingRef = useRef(false);           // True While Smooth-Scroll Is Running.
    const observerRef = useRef(null);
    let settleTimer = null;                       // Debounce For "Scroll Stopped".

    // -------------------------------------------------------- Scroll Detection.
    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector('[data-navbar]');
            if (navbar) {
                const navbarRect = navbar.getBoundingClientRect();
                setIsVisible(navbarRect.bottom < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

        // -------------------------------------------------------- Intersection Observer for Active Section.
    useEffect(() => {
        const sections = [
            'recent-section',
            'centi-score-section', 
            'accounts-section',
            'transactions-section'
        ];

        const handleIntersection = (entries) => {
            // Bail Early If Observer Should Be Ignored.
            if (ignoreObserverRef.current) return;       // Bail While Programme-Scrolling.
            
            let bestSection = null;
            let highestRatio = 0;
            
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                const isIntersecting = entry.isIntersecting;
                const intersectionRatio = entry.intersectionRatio;
                
                if (isIntersecting && intersectionRatio > highestRatio) {
                    highestRatio = intersectionRatio;
                    bestSection = sectionId;
                }
            });
            
            // Only Update If We Found A Section With Significant Intersection.
            if (bestSection && highestRatio > 0.1) {
                const sectionMap = {
                    'recent-section': 'recent-section',
                    'centi-score-section': 'centi-score-section',
                    'accounts-section': 'accounts-section',
                    'transactions-section': 'transactions-section'
                };
                
                const navItemId = sectionMap[bestSection];
                if (navItemId) {
                    setActiveSection(navItemId);
                }
            }
        };

        // Create Single Observer That Lives For The Lifetime Of The Component.
        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        });

        // Observe All Section Elements.
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                observerRef.current.observe(element);
            }
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []); // No Dependencies - Observer Lives For Component Lifetime.



    // -------------------------------------------------------- Smooth Scroll To Section.
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) return;

        // Short-Circuit If Already Active.
        if (activeSection === sectionId) return;

        // Tell The Observer To Ignore Everything.
        ignoreObserverRef.current = true;           // freeze highlight
        scrollingRef.current = true;
        
        // Highlight The Pill Immediately For Snappier UI.
        setActiveSection(sectionId);

        // Calculate Scroll Position.
        const offset = sectionId === 'centi-score-section'
            ? (window.innerHeight - element.getBoundingClientRect().height) / 2
            : 30;

        // Scroll To Target Position.
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });

        // Wait Until Scrolling Stops.
        const onScroll = () => {
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
                window.removeEventListener('scroll', onScroll);
                ignoreObserverRef.current = false;      // Let IO Run Again.
                scrollingRef.current = false;
            }, 120);                                  // 120 Ms Of No Scroll → Settled.
        };
        window.addEventListener('scroll', onScroll);
    };

    // -------------------------------------------------------- Navigation Items.
    const navItems = [
        {
            id: 'recent-section',
            icon: faChartLine,
            label: 'Recent Activity',
            color: '#4f46e5'
        },
        {
            id: 'centi-score-section',
            icon: faUser,
            label: 'Centi Score',
            color: '#10b981'
        },
        {
            id: 'accounts-section',
            icon: faCreditCard,
            label: 'Accounts',
            color: '#f59e0b'
        },
        {
            id: 'transactions-section',
            icon: faList,
            label: 'Transactions',
            color: '#ef4444'
        }
    ];

    return (
        <SidebarContainer $isVisible={isVisible}>
            <SidebarContent>
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        $isActive={activeSection === item.id}
                    >
                        <IconWrapper $isActive={activeSection === item.id}>
                            <FontAwesomeIcon icon={item.icon} />
                        </IconWrapper>
                        <LabelWrapper $isActive={activeSection === item.id}>
                            {item.label}
                        </LabelWrapper>
                    </NavItem>
                ))}
            </SidebarContent>
        </SidebarContainer>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Sidebar Container.
const SidebarContainer = styled.div`
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s ease;
    opacity: ${props => props.$isVisible ? 1 : 0};
    visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
    animation: ${props => props.$isVisible ? slideIn : slideOut} 0.3s ease-out;
`;

// -------------------------------------------------------- Sidebar Content.
const SidebarContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 50px;
    padding: 1rem 0.75rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
`;

// -------------------------------------------------------- Nav Item.
const NavItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: visible;
    
    background: ${props => props.$isActive 
        ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' 
        : 'rgba(0, 0, 0, 0.03)'
    };
    
    color: ${props => props.$isActive ? 'white' : 'var(--text-secondary)'};
    
    &:hover {
        transform: scale(1.05);
        background: ${props => props.$isActive 
            ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' 
            : 'rgba(0, 0, 0, 0.06)'
        };
        box-shadow: ${props => props.$isActive 
            ? '0 8px 25px rgba(0, 123, 255, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)'
        };
    }
    
    &:active {
        transform: scale(1.02);
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
`;

// -------------------------------------------------------- Icon Wrapper.
const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    min-width: 50px;
    z-index: 2;
    
    ${props => props.$isActive && css`
        animation: ${pulse} 2s infinite;
    `}
`;

// -------------------------------------------------------- Label Wrapper.
const LabelWrapper = styled.div`
    position: absolute;
    left: 25px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: inherit;
    padding: 0 1.125rem 0 1.5rem;
    background: ${props => props.$isActive 
        ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' 
        : 'rgb(230, 230, 230)'
    };
    border-radius: 0 25px 25px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 0;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 1;
    
    ${props => props.$isActive && `
        font-weight: 600;
    `}
    
    /* Expand Tooltip On Parent Hover. */
    ${NavItem}:hover & {
        opacity: 1;
        visibility: visible;
        width: 150px;
        transition-delay: 0.1s;
    }
`;

// -------------------------------------------------------- Export The MiniSidebar Component.
export default MiniSidebar; 