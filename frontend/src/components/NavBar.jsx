// Imports.
import React from 'react';
import { styled } from 'styled-components';

// Local Imports.
import '../styles/colors.css';
import centiLogo from '../images/horizMainTransparent.png';

// -------------------------------------------------------- NavBar Component.
const NavBar = () => {
    return (
        <NavBarWrapper>
            <Logo src={centiLogo}></Logo>
        </NavBarWrapper>
    )
}

// -------------------------------------------------------- NavBar Wrapper.
const NavBarWrapper = styled.div`
    font-family: 'DM Sans', serif;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: linear-gradient(45deg, rgb(172, 236, 220), rgb(200, 238, 238));
    border-bottom: 5px solid rgba(255, 255, 255, 0.2);
`
// -------------------------------------------------------- Logo.
const Logo = styled.img`
    width: 200px;
    padding: 0.5rem;
`


export default NavBar;

