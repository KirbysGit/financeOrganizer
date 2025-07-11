// Imports.
import React, { useState, useRef, useEffect } from 'react';
import { styled, keyframes, css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt, faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import centiLogo from '../../../images/colorSchemeIcon.png';

// -------------------------------------------------------- Animations.
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

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
            const navbarHeight = 80; // Approximate navbar height
            const elementPosition = element.offsetTop - navbarHeight;
            
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

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInitials = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

    return (
        <NavBarWrapper>
            <LeftSection>
            <Logo src={centiLogo} alt="Centi Logo" />
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
            </LeftSection>
            
            <RightSection ref={dropdownRef}>
                <UserInfo>
                    <UserAvatar>
                        {user.picture ? (
                            <UserImage src={user.picture} alt={`${user.first_name || 'User'}'s profile`} />
                        ) : (
                            <FontAwesomeIcon icon={faUser} />
                        )}
                    </UserAvatar>
                    <UserDetails>
                        <UserName>{user.first_name || 'User'}</UserName>
                        <UserEmail>{user.email || 'user@example.com'}</UserEmail>
                    </UserDetails>
                </UserInfo>
                
                <SettingsButton 
                    onClick={handleSettingsClick}
                    aria-label="Settings"
                    title="Settings"
                    $isOpen={isDropdownOpen}
                >
                    <GearIcon icon={faCog} $isOpen={isDropdownOpen} />
                </SettingsButton>
                
                {isDropdownOpen && (
                    <DropdownMenu>
                        <DropdownItem onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Sign Out</span>
                        </DropdownItem>
                    </DropdownMenu>
                )}
            </RightSection>
        </NavBarWrapper>
    )
}

// -------------------------------------------------------- NavBar Wrapper.
const NavBarWrapper = styled.div`
    font-family: 'DM Sans', serif;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 0 2rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
    position: relative;
    z-index: 100;
    height: 80px;
    width: 100%;
`

const LeftSection = styled.div`
    display: flex;
    align-items: center;
    gap: 3rem;
`

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
`

const NavLinks = styled.div`
    display: flex;
    gap: 2rem;
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

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.06);
        border-color: rgba(0, 0, 0, 0.1);
    }
`

const UserAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
`

const UserImage = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`

const UserName = styled.span`
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    line-height: 1;
`

const UserEmail = styled.span`
    font-size: 0.75rem;
    color: #666;
    line-height: 1;
`

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
`;

const GearIcon = styled(FontAwesomeIcon)`
    transition: all 0.3s ease;
    animation: ${props => props.$isOpen ? css`${spin} 0.6s ease-in-out` : 'none'};
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.08);
    min-width: 200px;
    z-index: 1000;
    animation: ${css`${slideIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1)`};
    overflow: hidden;
`;

const DropdownHeader = styled.div`
    padding: 1rem 1.25rem 0.75rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
`;

const DropdownTitle = styled.h3`
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    opacity: 0.9;
`;

const DropdownDivider = styled.div`
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 0.5rem 0;
`;

const DropdownItem = styled.button`
    font: inherit;
    width: 100%;
    padding: 0.875rem 1.25rem;
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
    text-align: left;

    &:hover {
        background: rgba(0, 123, 255, 0.05);
        color: var(--button-primary);
        transform: translateX(4px);
    }

    svg {
        font-size: 0.8rem;
        opacity: 0.8;
    }
`;

// -------------------------------------------------------- Logo. (Centi.)
const Logo = styled.img`
    width: 80px;
    padding: 0.75rem;
    transition: all 0.3s ease-in-out;

    &:hover {
        transform: scale(1.5);
        rotate: 3deg;
    }
`

// Export Component.
export default NavBar;

