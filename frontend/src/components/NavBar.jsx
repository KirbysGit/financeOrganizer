// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../styles/colors.css';
import centiLogo from '../images/colorSchemeIcon.png';

// -------------------------------------------------------- NavBar Component.
const NavBar = () => {
    // -------------------------------------------------------- Smooth Scroll To Section.
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // -------------------------------------------------------- Handle Settings Click.
    const handleSettingsClick = () => {
        // TODO: Implement settings functionality
        console.log('Settings clicked');
    };

    return (
        <NavBarWrapper>
            <Logo src={centiLogo}></Logo>
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
            <SettingsButton 
                onClick={handleSettingsClick}
                aria-label="Settings"
                title="Settings"
            >
                <FontAwesomeIcon icon={faCog} />
            </SettingsButton>
        </NavBarWrapper>
    )
}

// -------------------------------------------------------- NavBar Wrapper.
const NavBarWrapper = styled.div`
    font-family: 'DM Sans', serif;
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    background: linear-gradient(45deg, rgb(172, 236, 220), rgb(200, 238, 238));
    border-bottom: 5px solid rgba(255, 255, 255, 0.2);
    align-items: center;
    padding: 0 2rem;
`

const NavBarContent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
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
    font-size: 1.1rem;
    font-weight: 500;
    color: #2c3e50;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
        color: #1a252f;
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #2c3e50;
        transition: all 0.3s ease;
        transform: translateX(-50%);
    }

    &:hover::after {
        width: 80%;
    }
`

const SettingsButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #2c3e50;
    font-size: 1.2rem;

    &:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: rotate(90deg);
        color: #1a252f;
    }

    &:active {
        transform: rotate(90deg) scale(0.95);
    }
`

// -------------------------------------------------------- Logo. (Centi.)
const Logo = styled.img`
    width: 110px;
    padding: 0.5rem;
`

// Export Component.
export default NavBar;

