// NavBar.jsx

// This is the navigation bar component for the Dashboard, it is a simple navigation bar with a logo,
// a user info section, and a settings button. It also has a dropdown menu for the user to sign out.
// I want to add more to it, like specific settings, more links as we expand the site, and some more
// features, but I also don't want to leave a bunch of placeholders for V1, so I'm going to keep it 
// there for right now.

// Imports.
import React, { useState, useRef, useEffect } from 'react';
import { styled, keyframes, css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import centiLogo from '../../../images/colorSchemeIcon.png';

// -------------------------------------------------------- Animations.
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
`;

// -------------------------------------------------------- NavBar Component.
const NavBar = ({ onLogout }) => {
    // State For Dropdown Menu.
    const dropdownRef = useRef(null);                               // Dropdown Ref.
    const [isLoggingOut, setIsLoggingOut] = useState(false);        // State 4 Logging Out.
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);    // State 4 Dropdown Open.

    // -------------------------------------------------------- Close Dropdown When Clicking Outside.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        // Add Event Listener For Click Outside.
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // -------------------------------------------------------- Smooth Scroll To Section.
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // Special Handling For Centi Score To Center It On Screen.
            if (sectionId === 'centi-score-section') {
                const elementRect = element.getBoundingClientRect();
                const elementHeight = elementRect.height;
                const windowHeight = window.innerHeight;
                const offset = (windowHeight - elementHeight) / 2;
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            } else {
                // Standard Offset For Other Sections.
                const offset = 30;
                const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                    top: elementPosition,
                behavior: 'smooth'
            });
            }
        }
    };

    // -------------------------------------------------------- Handle Settings Click.
    const handleSettingsClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // -------------------------------------------------------- Handle Logout.
    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent Multiple Clicks.
        
        console.log('Logout button clicked');
        setIsLoggingOut(true);
        
        try {
            if (onLogout) {
                await onLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Reset Loading State On Error.
            setIsLoggingOut(false);
        } finally {
            setIsDropdownOpen(false);
        }
    };

    // Get User Info From LocalStorage.
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInitials = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

    // -------------------------------------------------------- Render.
    
    return (
        <NavBarWrapper data-navbar>
            {/* Left Section. */}
            <LeftSection>
                {/* Logo. */}
                <Logo src={centiLogo} alt="Centi Logo" />

                    {/* Nav Links. */}
                    <NavLinks>
                        <NavLink onClick={() => scrollToSection('recent-section')}>
                            Recent
                        </NavLink>
                        <NavLink onClick={() => scrollToSection('centi-score-section')}>
                            Centi Score
                        </NavLink>
                        <NavLink onClick={() => scrollToSection('accounts-section')}>
                            Accounts
                        </NavLink>
                        <NavLink onClick={() => scrollToSection('transactions-section')}>
                            Transactions
                        </NavLink>
                    </NavLinks>
            </LeftSection>
            
            {/* Right Section. */}
            <RightSection ref={dropdownRef}>
                {/* User Info. */}
                <UserInfo>
                    {/* User Avatar. */}
                    <UserAvatar>
                        {/* User Image. */}
                        {user.picture ? (
                            <UserImage src={user.picture} alt={`${user.first_name || 'User'}'s profile`} />
                        ) : (
                            <FontAwesomeIcon icon={faUser} />
                        )}
                    </UserAvatar>

                    {/* User Details. */}
                    <UserDetails>
                        {/* User Name. */}
                        <UserName>{user.first_name || 'User'}</UserName>

                        {/* User Email. */}
                        <UserEmail>{user.email || 'user@example.com'}</UserEmail>
                    </UserDetails>
                </UserInfo>
                
                {/* Settings Button. */}
                <SettingsButton 
                    onClick={handleSettingsClick}
                    aria-label="Settings"
                    title="Settings"
                    $isOpen={isDropdownOpen}
                >
                    <GearIcon icon={faCog} $isOpen={isDropdownOpen} />
                </SettingsButton>
                
                {/* Dropdown Menu. */}
                {isDropdownOpen && (
                    <DropdownMenu>
                        {/* Dropdown Item. */}
                        <DropdownItem 
                            onClick={handleLogout}
                            $isLoggingOut={isLoggingOut}
                            disabled={isLoggingOut}
                        >
                            {/* Logging Out. */}
                            {isLoggingOut ? (
                                <>
                                    {/* Signing Out Icon. */}
                                    <FontAwesomeIcon icon={faSpinner} spin />

                                    {/* Signing Out Text. */}
                                    <span>Signing Out...</span>
                                </>
                            ) : (
                                <>
                                    {/* Sign Out Icon. */}
                                    <FontAwesomeIcon icon={faSignOutAlt} />

                                    {/* Sign Out Text. */}
                                    <span>Sign Out</span>
                                </>
                            )}
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
    height: 80px;
    z-index: 1000;
    width: 100%;
`

// -------------------------------------------------------- Left Section.
const LeftSection = styled.div`
    display: flex;
    align-items: center;
    gap: 3rem;
    height: 100%;
`

// -------------------------------------------------------- Right Section.
const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
`

// -------------------------------------------------------- Nav Links.
const NavLinks = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`

// -------------------------------------------------------- Nav Link.
const NavLink = styled.div`
    height: 100%;
    font-family: 'DM Sans', serif;
    font-size: 1.2rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    padding: 0.75rem 2rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border-radius: 0px 0px 4px 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 3px solid rgba(0, 0, 0, 0.1);

    &:first-child {
        border-left: 3px solid rgba(0, 0, 0, 0.1);
    }

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

// -------------------------------------------------------- User Info.
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

// -------------------------------------------------------- User Avatar.
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

// -------------------------------------------------------- User Image.
const UserImage = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

// -------------------------------------------------------- User Details.
const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`

// -------------------------------------------------------- User Name.
const UserName = styled.span`
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    line-height: 1;
`

// -------------------------------------------------------- User Email.
const UserEmail = styled.span`
    font-size: 0.75rem;
    color: #666;
    line-height: 1;
`

// -------------------------------------------------------- Settings Button.
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

// -------------------------------------------------------- Gear Icon.
const GearIcon = styled(FontAwesomeIcon)`
    transition: all 0.3s ease;
    animation: ${props => props.$isOpen ? css`${spin} 0.6s ease-in-out` : 'none'};
`;

// -------------------------------------------------------- Dropdown Menu.
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
    animation: ${css`${slideIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1)`};
    overflow: hidden;
`;

// -------------------------------------------------------- Dropdown Item.
const DropdownItem = styled.div`
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
    position: relative;
    overflow: hidden;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #ffe6e6, #ffebeb);
        color: #dc3545;
        border-left: 3px solid #dc3545;
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
    }

    &:active:not(:disabled) {
        transform: translateX(1px);
        background: linear-gradient(135deg, #ffd6d6, #ffe1e1);
    }

    ${props => props.$isLoggingOut && css`
        color: #dc3545;
        font-weight: 600;
        background: linear-gradient(135deg, #fff5f5, #ffe6e6);
        border-left: 3px solid #dc3545;
        animation: ${shake} 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        
        &:hover {
            background: linear-gradient(135deg, #ffe6e6, #ffd6d6);
            transform: none;
        }
    `}

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        color: #666;
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

// Export The NavBar Component.
export default NavBar;

