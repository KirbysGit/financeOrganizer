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
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('recent-section');
    
    // Race-free observer control using refs
    const ignoreObserverRef = useRef(false);      // true = ignore IO events
    const scrollingRef = useRef(false);           // true while smooth-scroll is running
    const observerRef = useRef(null);
    let settleTimer = null;                       // debounce for "scroll stopped"

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
            // Bail early if observer should be ignored
            if (ignoreObserverRef.current) return;       // bail while programme-scrolling
            
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
            
            // Only update if we found a section with significant intersection
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

        // Create single observer that lives for the lifetime of the component
        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        });

        // Observe all section elements
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
    }, []); // No dependencies - observer lives for component lifetime



    // -------------------------------------------------------- Smooth Scroll To Section.
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) return;

        // Short-circuit if already active
        if (activeSection === sectionId) return;

        // Tell the observer to ignore everything
        ignoreObserverRef.current = true;           // freeze highlight
        scrollingRef.current = true;
        
        // Highlight the pill immediately for snappier UI
        setActiveSection(sectionId);

        // Calculate scroll position
        const offset = sectionId === 'centi-score-section'
            ? (window.innerHeight - element.getBoundingClientRect().height) / 2
            : 30;

        // Scroll to target position
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });

        // ---------- wait until scrolling stops -------------
        const onScroll = () => {
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
                window.removeEventListener('scroll', onScroll);
                ignoreObserverRef.current = false;      // let IO run again
                scrollingRef.current = false;
            }, 120);                                  // 120 ms of no scroll → settled
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
    
    /* Expand tooltip on parent hover */
    ${NavItem}:hover & {
        opacity: 1;
        visibility: visible;
        width: 150px;
        transition-delay: 0.1s;
    }
`;



export default MiniSidebar; 