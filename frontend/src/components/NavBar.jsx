// Imports.
import React, { useState, useRef, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../styles/colors.css';
import centiLogo from '../images/colorSchemeIcon.png';

// -------------------------------------------------------- NavBar Component.
const NavBar = ({ onLogout }) => {
    // State for dropdown menu.
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // -------------------------------------------------------- Close Dropdown When Clicking Outside.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // -------------------------------------------------------- Smooth Scroll To Section.
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 19; // Approximate navbar height
            const elementPosition = element.offsetTop - navbarHeight; // Extra 20px for breathing room
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    };

    // -------------------------------------------------------- Handle Settings Click.
    const handleSettingsClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // -------------------------------------------------------- Handle Logout.
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setIsDropdownOpen(false);
    };

    return (
        <NavBarWrapper>
            <Logo src={centiLogo} alt="Centi Logo" />
            <NavBarContent>
                <NavLinks>
                    <NavLink onClick={() => scrollToSection('recent-section')}>
                        Recent
                    </NavLink>
                    <NavLink onClick={() => scrollToSection('accounts-section')}>
                        Accounts
                    </NavLink>
                    <NavLink onClick={() => scrollToSection('transactions-section')}>
                        Transactions
                    </NavLink>
                </NavLinks>
            </NavBarContent>
            <SettingsContainer ref={dropdownRef}>
                <SettingsButton 
                    onClick={handleSettingsClick}
                    aria-label="Settings"
                    title="Settings"
                    $isOpen={isDropdownOpen}
                >
                    <FontAwesomeIcon icon={faCog} />
                    <FontAwesomeIcon icon={faChevronDown} className="chevron" />
                </SettingsButton>
                
                {isDropdownOpen && (
                    <DropdownMenu>
                        <DropdownItem onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Log Out</span>
                        </DropdownItem>
                    </DropdownMenu>
                )}
            </SettingsContainer>
        </NavBarWrapper>
    )
}

// -------------------------------------------------------- NavBar Wrapper.
const NavBarWrapper = styled.div`
    font-family: 'DM Sans', serif;
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    align-items: center;
    padding: 0 2rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 0;
    z-index: 100;
`

const NavBarContent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const NavLinks = styled.div`
    display: flex;
    gap: 3rem;
    align-items: center;
`

const NavLink = styled.button`
    background: none;
    border: none;
    font-family: 'DM Sans', serif;
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
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

const SettingsContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SettingsButton = styled.button`
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #666;
    font-size: 1.1rem;
    position: relative;

    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        border-color: transparent;
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
    }

    .chevron {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 0.6rem;
        transition: transform 0.3s ease;
        transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
    min-width: 160px;
    z-index: 1000;
    animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes dropdownSlideIn {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const DropdownItem = styled.button`
    font: inherit;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 0.25rem;

    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        transform: translateX(4px);
    }

    &:first-child {
        margin-top: 0.5rem;
    }

    &:last-child {
        margin-bottom: 0.5rem;
    }
`;

// -------------------------------------------------------- Logo. (Centi.)
const Logo = styled.img`
    width: 65px;
    padding: 0.75rem;
    transition: all 0.3s ease-in-out;

    &:hover {
        transform: scale(1.5);
        rotate: 3deg;
    }
`

// Export Component.
export default NavBar;

