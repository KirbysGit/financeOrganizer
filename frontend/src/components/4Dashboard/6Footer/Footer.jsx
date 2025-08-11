// Footer.jsx

// This is the footer component that is used on the dashboard. It contains the quick links, features, and contact us 
// button. Also some other links like my GitHub and LinkedIn.

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHeart, faShieldAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import toast from 'react-hot-toast';

// Local Imports.
import '../../../styles/colors.css';
import centiLogo from '../../../images/colorSchemeIcon.png';
import ContactUsModal from './ContactUsModal';

// -------------------------------------------------------- Footer Component.
const Footer = ({ user }) => {
    // States.
    const currentYear = new Date().getFullYear();
    const [showContactModal, setShowContactModal] = useState(false);

    // -------------------------------------------------------- Handle Contact Click.

    const handleContactClick = () => {
        setShowContactModal(true);
    };

    // -------------------------------------------------------- Handle Privacy Click.
    const handlePrivacyClick = () => {
        toast.success("🔒 We're working on our Privacy Policy! Coming soon.", {
            duration: 4000,
            style: {
                background: 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 25px rgba(65, 173, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            },
            iconTheme: {
                primary: 'white',
                secondary: 'rgba(255, 255, 255, 0.8)'
            }
        });
    };

    // -------------------------------------------------------- Handle Terms Click.
    const handleTermsClick = () => {
        toast.success("📋 We're working on our Terms of Service! Coming soon.", {
            duration: 4000,
            style: {
                background: 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 25px rgba(65, 173, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            },
            iconTheme: {
                primary: 'white',
                secondary: 'rgba(255, 255, 255, 0.8)'
            }
        });
    };

    // -------------------------------------------------------- Handle GitHub Click.
    const handleGitHubClick = () => {
        window.open('https://github.com/KirbysGit', '_blank');
    };

    // -------------------------------------------------------- Handle LinkedIn Click.
    const handleLinkedInClick = () => {
        window.open('https://www.linkedin.com/in/colinwkirby/', '_blank');
    };

    // -------------------------------------------------------- Return The Footer Component.
    return (
        <>
        <FooterWrapper>
            <FooterContent>
                {/* Main Footer Section */}
                <MainFooterSection>
                    {/* Brand Section */}
                    <BrandSection>
                        <BrandLogo src={centiLogo} alt="Centi Logo" />
                        <BrandDescription>
                            Your personal finance companion. Track, analyze, and optimize your financial journey with intelligent insights and beautiful visualizations.
                        </BrandDescription>
                        <BrandTagline>
                            Making cents of your finances <span style={{ color: 'var(--amount-positive)' }}>💚</span>
                        </BrandTagline>
                    </BrandSection>

                    {/* Quick Links Section */}
                    <QuickLinksSection>
                        <SectionTitle>Quick Links</SectionTitle>
                        <QuickLinksList>
                            <QuickLink onClick={() => {
                                const element = document.getElementById('recent-section');
                                if (element) {
                                    const offset = 30;
                                    const elementPosition = element.offsetTop - offset;
                                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                                }
                            }}>
                                Recent Activity
                            </QuickLink>
                            <QuickLink onClick={() => {
                                const element = document.getElementById('centi-score-section');
                                if (element) {
                                    const elementRect = element.getBoundingClientRect();
                                    const elementHeight = elementRect.height;
                                    const windowHeight = window.innerHeight;
                                    const offset = (windowHeight - elementHeight) / 2;
                                    const elementPosition = element.offsetTop - offset;
                                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                                }
                            }}>
                                Centi Score
                            </QuickLink>
                            <QuickLink onClick={() => {
                                const element = document.getElementById('accounts-section');
                                if (element) {
                                    const offset = 30;
                                    const elementPosition = element.offsetTop - offset;
                                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                                }
                            }}>
                                Accounts
                            </QuickLink>
                            <QuickLink onClick={() => {
                                const element = document.getElementById('transactions-section');
                                if (element) {
                                    const offset = 30;
                                    const elementPosition = element.offsetTop - offset;
                                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                                }
                            }}>
                                Transactions
                            </QuickLink>
                        </QuickLinksList>
                    </QuickLinksSection>

                    {/* Features Section */}
                    <FeaturesSection>
                        <SectionTitle>Features</SectionTitle>
                        <FeaturesList>
                            <FeatureItem>
                                <FeatureIcon>
                                    <FontAwesomeIcon icon={faShieldAlt} />
                                </FeatureIcon>
                                <FeatureText>Secure Data</FeatureText>
                            </FeatureItem>
                            <FeatureItem>
                                <FeatureIcon>
                                    <FontAwesomeIcon icon={faLock} />
                                </FeatureIcon>
                                <FeatureText>Privacy First</FeatureText>
                            </FeatureItem>
                            <FeatureItem>
                                <FeatureIcon>
                                    <FontAwesomeIcon icon={faHeart} />
                                </FeatureIcon>
                                <FeatureText>Personal Finance</FeatureText>
                            </FeatureItem>
                        </FeaturesList>
                    </FeaturesSection>

                    {/* Contact Section */}
                    <ContactSection>
                        <SectionTitle>Get In Touch</SectionTitle>
                        <ContactButton onClick={handleContactClick}>
                            <FontAwesomeIcon icon={faEnvelope} />
                            Contact Us
                        </ContactButton>
                        <SocialLinks>
                            <SocialLink onClick={handleGitHubClick} title="GitHub">
                                <FontAwesomeIcon icon={faGithub} />
                            </SocialLink>
                            <SocialLink onClick={handleLinkedInClick} title="LinkedIn">
                                <FontAwesomeIcon icon={faLinkedin} />
                            </SocialLink>
                        </SocialLinks>
                    </ContactSection>
                </MainFooterSection>

                {/* Bottom Footer Section */}
                <BottomFooterSection>
                    <BottomFooterContent>
                        <CopyrightText>
                            © {currentYear} Centi. Made with <FontAwesomeIcon icon={faHeart} style={{ color: '#dc3545' }} /> for personal finance enthusiasts.
                        </CopyrightText>
                        <LegalLinks>
                            <LegalLink onClick={handlePrivacyClick}>
                                Privacy Policy
                            </LegalLink>
                            <LegalLink onClick={handleTermsClick}>
                                Terms of Service
                            </LegalLink>
                        </LegalLinks>
                    </BottomFooterContent>
                </BottomFooterSection>
            </FooterContent>
        </FooterWrapper>

            {/* Contact Us Modal */}
            <ContactUsModal 
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                user={user}
            />
        </>
    );
};

// -------------------------------------------------------- Footer Styled Components.
const FooterWrapper = styled.footer`
    width: 100%;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    border: 3px solid transparent;
    margin-top: 2rem;
    position: relative;
    z-index: 100;
`;

const FooterContent = styled.div`
    width: 90%;
    margin: 0 auto;
    padding: 1.5rem 0 0.5rem 0;
`;

const MainFooterSection = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        text-align: center;
    }
`;

const BrandSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const BrandLogo = styled.img`
    width: 60px;
    height: auto;
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.1) rotate(3deg);
    }
`;

const BrandDescription = styled.p`
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-align: justify;
    line-height: 1.4;
    margin: 0;
    max-width: 300px;
    
    @media (max-width: 768px) {
        max-width: none;
    }
`;

const BrandTagline = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 0.25rem;
`;

const SectionTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const QuickLinksSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const QuickLinksList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const QuickLink = styled.button`
    font: inherit;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    text-align: left;
    padding: 0.25rem 0;
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
        color: var(--button-primary);
        transform: translateX(5px);
    }
    
    &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        transition: width 0.3s ease;
        transform: translateY(-50%);
    }
    
    &:hover::before {
        width: 8px;
    }
`;

const FeaturesSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const FeaturesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
`;

const FeatureIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
`;

const FeatureText = styled.span`
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
`;

const ContactSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const ContactButton = styled.button`
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
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const SocialLinks = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
`;

const SocialLink = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-secondary);
    font-size: 1.1rem;
    
    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        border-color: transparent;
    }
`;

const BottomFooterSection = styled.div`
    padding-top: 1rem;
    padding-bottom: 1rem;
`;

const BottomFooterContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
`;

const CopyrightText = styled.div`
    color: var(--text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.25rem;
    }
`;

const LegalLinks = styled.div`
    display: flex;
    gap: 2rem;
    
    @media (max-width: 768px) {
        gap: 1rem;
    }
`;

const LegalLink = styled.button`
    font: inherit;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        color: var(--button-primary);
        text-decoration: underline;
    }
`;

export default Footer; 