// AboutCenti.jsx

// This is the About Centi page that explains the background, purpose, and future plans for the Centi application.
// It features a modal design with particle backdrop similar to other authentication pages.

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faRocket, faCode, faChartLine, faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

// Local Imports.
import '../../styles/colors.css';
import ParticleBackdropFinance from '../2AccountSetUp/Auth/ParticleBackdropFinance';

// -------------------------------------------------------- AboutCenti Component.
const AboutCenti = ({ isOpen, onClose }) => {
    
    // -------------------------------------------------------- Handle Close.
    const handleClose = () => {
        onClose();
    };

    // -------------------------------------------------------- Handle GitHub Click.
    const handleGitHubClick = () => {
        window.open('https://github.com/KirbysGit', '_blank');
    };

    // -------------------------------------------------------- Handle LinkedIn Click.
    const handleLinkedInClick = () => {
        window.open('https://www.linkedin.com/in/colinwkirby/', '_blank');
    };

    // -------------------------------------------------------- Return JSX.
    if (!isOpen) return null;

    return (
        <>
            {/* Particle Backdrop */}
            <ParticleBackdropFinance />
            
            {/* Modal Overlay */}
            <ModalOverlay onClick={handleClose}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <ModalHeader>
                        <HeaderTitle>About Centi</HeaderTitle>
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faTimes} />
                        </CloseButton>
                    </ModalHeader>

                    {/* Content */}
                    <ModalBody>
                        {/* Mission Statement */}
                        <Section>
                            <SectionTitle>
                                <FontAwesomeIcon icon={faHeart} />
                                Why I Created Centi
                            </SectionTitle>
                            <SectionContent>
                                After the closure of Mint, I realized how much I missed having a simple, 
                                friendly way to track my finances. Most financial tracking apps today focus 
                                on complex formatting of data and take a brutalist approach to the actual user 
                                experience. Throwing lots of data at the user with minimal explanation. I wanted
                                to create something that simply shows you where your money is going.
                            </SectionContent>
                        </Section>

                        {/* Vision */}
                        <Section>
                            <SectionTitle>
                                <FontAwesomeIcon icon={faRocket} />
                                The Vision
                            </SectionTitle>
                            <SectionContent>
                                Centi aims to create a welcoming environment that provides personalized 
                                financial advice based on your unique financial background. It's designed 
                                to help you track growth, understand spending habits, organize transactions, 
                                and monitor your financial health through a custom Centi Score. The idea for
                                the UI behind the Dashboard is that from top to bottom, the users data is 
                                displayed in a more "complex" way as you scroll down, its still not like 
                                overwhelming, but its starts out with a general overview and gets more
                                specific as you scroll down.
                            </SectionContent>
                        </Section>

                        {/* Current State */}
                        <Section>
                            <SectionTitle>
                                <FontAwesomeIcon icon={faChartLine} />
                                Where We Are Now
                            </SectionTitle>
                            <SectionContent>
                                Currently, Centi is a showcase of my full-stack development skills, 
                                featuring frontend design expertise and backend organization. The goal is 
                                simple: when you log in, you should immediately see "Oh, that's where my 
                                money is going" without feeling overwhelmed by complex interfaces.
                            </SectionContent>
                        </Section>

                        {/* Development Process */}
                        <Section>
                            <SectionTitle>
                                <FontAwesomeIcon icon={faCode} />
                                Development Journey
                            </SectionTitle>
                            <SectionContent>
                                I used Cursor AI as a major help in creating this project, primarily 
                                for brute work like inline commenting and styling similar components. 
                                However, every single line of code has been personally overseen and 
                                refined by me to ensure quality and functionality.
                            </SectionContent>
                        </Section>

                        {/* Future Plans */}
                        <Section>
                            <SectionTitle>
                                <FontAwesomeIcon icon={faShieldAlt} />
                                Future Plans
                            </SectionTitle>
                            <SectionContent>
                                I have many exciting plans for Centi's future! This is just the beginning 
                                of what I hope will become a comprehensive, user-friendly financial 
                                companion that truly puts the user experience first. You can look at
                                the Github Repo for more information on the future plans.
                            </SectionContent>
                        </Section>

                        {/* Connect Section */}
                        <ConnectSection>
                            <ConnectTitle>Let's Connect!</ConnectTitle>
                            <ConnectDescription>
                                I'm always open to feedback, collaboration, or just connecting with 
                                fellow developers and finance enthusiasts.
                            </ConnectDescription>
                            <SocialLinks>
                                <SocialButton onClick={handleGitHubClick}>
                                    <FontAwesomeIcon icon={faGithub} />
                                    GitHub
                                </SocialButton>
                                <SocialButton onClick={handleLinkedInClick}>
                                    <FontAwesomeIcon icon={faLinkedin} />
                                    LinkedIn
                                </SocialButton>
                            </SocialLinks>
                        </ConnectSection>
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </>
    );
};

// -------------------------------------------------------- Styled Components.
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const ModalBody = styled.div`
    padding: 2rem;
`;

const Section = styled.div`
    margin-bottom: 2rem;
    
    &:last-of-type {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
        color: var(--button-primary);
        font-size: 1.1rem;
    }
`;

const SectionContent = styled.p`
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
    text-align: justify;
`;

const ConnectSection = styled.div`
    background: linear-gradient(135deg, rgba(65, 173, 255, 0.05), rgba(40, 167, 69, 0.05));
    border-radius: 16px;
    padding: 2rem;
    margin-top: 2rem;
    text-align: center;
    border: 1px solid rgba(65, 173, 255, 0.1);
`;

const ConnectTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
`;

const ConnectDescription = styled.p`
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
`;

const SocialLinks = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
`;

const SocialButton = styled.button`
    font: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(65, 173, 255, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const ModalFooter = styled.div`
    padding: 1rem 2rem 2rem 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-secondary);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: var(--text-primary);
        transform: translateY(-1px);
    }
`;

export default AboutCenti;
