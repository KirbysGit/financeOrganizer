// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faFileUpload, faPlus, faChartLine, faShieldAlt, faRocket, faArrowRight, faCheckCircle, faUser, faChartBar, faPiggyBank, faSmile, faArrowRightLong, faCheck } from '@fortawesome/free-solid-svg-icons';


// Image Imports.
import plaidLogo from '../../images/plaid.png';         // Plaid Logo In How It Works.
import bofaLogo from '../../images/bofaLogo.png';       // BofA Logo In How It Works Section.
import chaseLogo from '../../images/chaseLogo.png';     // Chase Logo In How It Works Section.
import googleLogo from '../../images/googleLogo.png';   // Google Logo In How It Works Section.
import centiLogo from '../../images/colorScheme.png';   // Centi Logo In Navbar.

// Local Imports.
import '../../styles/colors.css';
// API Imports.
import { uploadCSV } from '../../services/api';

// -------------------------------------------------------- WelcomeScreen Component.
const WelcomeScreen = ({ onShowAccountSetUp }) => {
    // Modal States.
    const [activeModal, setActiveModal] = useState(null);           // 'plaid', 'csv', 'transaction'.
    const [existingAccounts, setExistingAccounts] = useState([]);   // Existing Accounts.
    const [activeStep, setActiveStep] = useState(0);                // Active Step.

    // -------------------------------------------------------- Step Animation Effect.
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prevStep) => (prevStep + 1) % 3);
        }, 5000); // Change step every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // -------------------------------------------------------- Handle CSV Upload.
    const handleCSVUpload = async (formData) => {
        try {
            const response = await uploadCSV(formData);
            return response.data; // Return the data directly
        } catch (error) {
            // Re-throw the error so FileUploadModal can handle it
            throw error;
        }
    };

    // -------------------------------------------------------- Handle Upload Success.
    const handleUploadSuccess = (result) => {
        console.log('Upload successful:', result);
        onGetStarted(); // Navigate to dashboard
    };

    // -------------------------------------------------------- Close Modal & Clear States.
    const closeModal = () => {
        // Set Active Modal State To Null.
        setActiveModal(null);
    };

    const handleSignIn = () => {
        onShowAccountSetUp('login');
    };

    const handleGetStarted = () => {
        onShowAccountSetUp('signup');
    };

    return (
        <>
            <NavBar>
                <NavLogo src={centiLogo} alt="Centi Logo" />
                <NavActions>
                    <SignInButton onClick={handleSignIn}>Sign In</SignInButton>
                </NavActions>
            </NavBar>
            <LandingContainer>
                {/* Hero Section */}
                <HeroSection>
                    <HeroContent>
                        <HeroTitle>Take Control of Your Finances</HeroTitle>
                        <HeroSubtitle>
                            Centi helps you track, analyze, and optimize your spending with powerful insights and intuitive tools. 
                        </HeroSubtitle>
                        <HeroCTA>
                            <GetStartedButton onClick={handleGetStarted}>
                                Get Started
                                <FontAwesomeIcon icon={faArrowRight} />
                            </GetStartedButton>
                            <HeroSubtext>Free forever • No credit card required</HeroSubtext>
                        </HeroCTA>
                    </HeroContent>
                    <HeroVisual>
                        <HeroImage src={centiLogo} alt="Centi Dashboard Preview" />
                    </HeroVisual>
                </HeroSection>

                {/* Features Section */}
                <WaveDivider viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" fill="url(#waveGradient)" />
                    <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#b6e0fe" />
                            <stop offset="100%" stopColor="#a7ffeb" />
                        </linearGradient>
                    </defs>
                </WaveDivider>
                <FeaturesSection>
                    <SectionTitle>
                        Unlock Your Financial Potential with Centi
                        <SectionSubtitle>
                            Everything you need to master your finances, in one beautiful platform.
                        </SectionSubtitle>
                    </SectionTitle>
                    <FeaturesGrid>
                        <FeatureCard>
                            <FeatureIcon $color="#00d4aa">
                                <FontAwesomeIcon icon={faChartLine} />
                            </FeatureIcon>
                            <FeatureTitle>Smart Analytics</FeatureTitle>
                            <FeatureDescription>
                                Get deep insights into your spending patterns with AI-powered analysis and personalized recommendations.
                            </FeatureDescription>
                        </FeatureCard>

                        <FeatureCard>
                            <FeatureIcon $color="#007bff">
                                <FontAwesomeIcon icon={faShieldAlt} />
                            </FeatureIcon>
                            <FeatureTitle>Bank-Level Security</FeatureTitle>
                            <FeatureDescription>
                                Your financial data is protected with enterprise-grade encryption and secure connections.
                            </FeatureDescription>
                        </FeatureCard>

                        <FeatureCard>
                            <FeatureIcon $color="#28a745">
                                <FontAwesomeIcon icon={faRocket} />
                            </FeatureIcon>
                            <FeatureTitle>Quick Setup</FeatureTitle>
                            <FeatureDescription>
                                Connect your bank accounts in minutes or upload statements. Start tracking immediately.
                            </FeatureDescription>
                        </FeatureCard>
                    </FeaturesGrid>
                </FeaturesSection>
                <WaveDivider viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}> 
                    <path d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" fill="url(#waveGradient2)" />
                    <defs>
                        <linearGradient id="waveGradient2" x1="1" y1="0" x2="0" y2="0">
                            <stop offset="0%" stopColor="#b6e0fe" />
                            <stop offset="100%" stopColor="#a7ffeb" />
                        </linearGradient>
                    </defs>
                </WaveDivider>

                {/* How It Works Section */}
                <HowItWorksSection>
                    <SectionTitle>
                        Your Journey to Financial Freedom
                        <SectionSubtitle>
                            From sign-up to savings in just three simple steps. See how Centi transforms your financial life.
                        </SectionSubtitle>
                    </SectionTitle>
                    <StepsContainer>
                        <Step $isActive={activeStep === 0}>
                            <StepNumber $isActive={activeStep === 0}><span>1</span></StepNumber>
                            <StepContent>
                                <Step1FlowWrapper>
                                    <Step1FlowSVG viewBox="0 0 400 120" preserveAspectRatio="none">
                                        {/* Google to User - Positive Parabola (upward curve) */}
                                        <path d="M80,60 Q160,100 200,60" stroke="var(--button-primary)" strokeWidth="3" fill="none" strokeDasharray="8,6"/>
                                        {/* User to Checkmark - Negative Parabola (downward curve) */}
                                        <path d="M210,60 Q260,20 320,60" stroke="var(--amount-positive)" strokeWidth="3" fill="none" strokeDasharray="8,6"/>
                                    </Step1FlowSVG>
                                    <Step1Container>
                                        <Step1Icon>
                                            <Logo src={googleLogo} alt="Google Logo" />
                                        </Step1Icon>
                                        <Step1Icon>
                                            <FontAwesomeIcon icon={faUser} style={{fontSize: '1.5rem', color: 'white'}}/>
                                        </Step1Icon>
                                        <Step1Icon>
                                            <FontAwesomeIcon icon={faCheck} style={{fontSize: '1.5rem', color: 'white'}}/>
                                        </Step1Icon>
                                    </Step1Container>
                                </Step1FlowWrapper>
                                <StepTitle>Join Centi in One Tap</StepTitle>
                                <StepDescription>Use Google Sign-In or a quick email—no credit card needed.</StepDescription>
                            </StepContent>
                        </Step>
                        <Step $isActive={activeStep === 1}>
                            <StepNumber $isActive={activeStep === 1}><span>2</span></StepNumber>
                            <StepContent>
                                <Step2LinesWrapper>
                                    <Step2LinesSVG viewBox="0 0 400 200" preserveAspectRatio="none">
                                        {/* BofA to Plaid */}
                                        <path d="M60,30 Q200,30 200,80" stroke="var(--button-primary)" strokeWidth="4" fill="none" strokeDasharray="10,8"/>
                                        {/* Chase to Plaid */}
                                        <path d="M60,130 Q200,130 200,80" stroke="var(--button-primary)" strokeWidth="4" fill="none" strokeDasharray="10,8"/>
                                        {/* Plaid to User */}
                                        <path d="M200,80 Q320,80 300,80" stroke="var(--amount-positive)" strokeWidth="4" fill="none" strokeDasharray="10,8"/>
                                    </Step2LinesSVG>
                                    <Step2Container>
                                        <Column1Container>
                                            <Step2Icon>
                                                <Logo src={bofaLogo} style={{width: '80%'}} alt="BofA Logo" />
                                            </Step2Icon>
                                            <Step2Icon>
                                                <Logo src={chaseLogo} style={{height: '85%'}} alt="Chase Logo" />
                                            </Step2Icon>
                                        </Column1Container>
                                        <Column2Container>
                                            <Step2Icon>
                                                <Logo src={plaidLogo} style={{height: '75%'}} alt="Plaid Logo" />
                                            </Step2Icon>
                                        </Column2Container>
                                        <Column3Container>
                                            <StepIcon>
                                                <FontAwesomeIcon icon={faUser} />
                                            </StepIcon>
                                        </Column3Container>
                                    </Step2Container>
                                </Step2LinesWrapper>
                                <StepTitle>Link Your Money, Securely</StepTitle>
                                <StepDescription>Bank-grade Plaid connect in under 2 min—or drag-and-drop a CSV if you prefer.</StepDescription>
                            </StepContent>
                        </Step>
                        <Step $isActive={activeStep === 2}>
                            <StepNumber $isActive={activeStep === 2}><span>3</span></StepNumber>
                            <StepContent>
                                <Step3FlowWrapper>
                                    <Step3FlowSVG viewBox="0 0 400 120" preserveAspectRatio="none">
                                        {/* Chart to Piggy Bank - Negative Parabola (downward curve) */}
                                        <path d="M80,60 Q100,20 200,60" stroke="var(--button-primary)" strokeWidth="3" fill="none" strokeDasharray="8,6"/>
                                        {/* Piggy Bank to Smile - Positive Parabola (upward curve) */}
                                        <path d="M210,60 Q260,100 320,60" stroke="var(--amount-positive)" strokeWidth="3" fill="none" strokeDasharray="8,6"/>
                                    </Step3FlowSVG>
                                    <Step3Container>
                                        <Step3Icon>
                                            <FontAwesomeIcon icon={faChartBar} style={{fontSize: '1.5rem', color: 'white'}}/>
                                        </Step3Icon>
                                        <Step3Icon>
                                            <FontAwesomeIcon icon={faPiggyBank} style={{fontSize: '1.5rem', color: 'white'}}/>
                                        </Step3Icon>
                                        <Step3Icon>
                                            <FontAwesomeIcon icon={faSmile} style={{fontSize: '1.5rem', color: 'white'}}/>
                                        </Step3Icon>
                                    </Step3Container>
                                </Step3FlowWrapper>
                                <StepTitle>See Where Every Dollar Goes</StepTitle>
                                <StepDescription>Instant dashboards spotlight trends and reveal easy ways to save.</StepDescription>
                            </StepContent>
                        </Step>
                    </StepsContainer>
                </HowItWorksSection>

                {/* CTA Section */}
                <WaveDivider viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" fill="url(#ctaWaveGradient)" />
                    <defs>
                        <linearGradient id="ctaWaveGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--button-primary)" />
                            <stop offset="100%" stopColor="var(--amount-positive)" />
                        </linearGradient>
                    </defs>
                </WaveDivider>
                <CTASection>
                    <CTAContent>
                        <CTATitle>Ready to Transform Your Finances?</CTATitle>
                        <CTASubtitle>
                            Join thousands of users who are already taking control of their financial future with Centi.
                        </CTASubtitle>
                        <CTAButton onClick={handleGetStarted}>
                            Start Your Free Journey
                            <FontAwesomeIcon icon={faArrowRight} />
                        </CTAButton>
                        <CTABenefits>
                            <BenefitItem>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>No setup fees</span>
                            </BenefitItem>
                            <BenefitItem>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>Cancel anytime</span>
                            </BenefitItem>
                            <BenefitItem>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>24/7 support</span>
                            </BenefitItem>
                        </CTABenefits>
                    </CTAContent>
                </CTASection>
            </LandingContainer>
        </>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Landing Container.
const LandingContainer = styled.div`
    width: 100%;
    padding: 2rem 6rem 0 6rem;
`;

// -------------------------------------------------------- Hero Section.
const HeroSection = styled.div`
    display: grid;
    grid-template-columns: 3fr 5fr;
    align-items: center;
    padding: 4rem 0;
    min-height: 70vh;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }
`;
const HeroContent = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 5rem;
    gap: 1.5rem;
`;
const HeroTitle = styled.h1`
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
    text-align: left;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;
const HeroSubtitle = styled.p`
    font-size: 1.3rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
    max-width: 500px;
    text-align: justify;

    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;
const HeroCTA = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;
const GetStartedButton = styled.button`
    font: inherit;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    width: fit-content;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
    }

    &:active {
        transform: translateY(0);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -60%;
        width: 40%;
        height: 100%;
        background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
        pointer-events: none;
        transform: skewX(-20deg);
        animation: glimmer 2.8s cubic-bezier(0.4,0,0.2,1) infinite;
    }

    @keyframes glimmer {
        0% {
            left: -60%;
        }
        70% {
            left: 120%;
        }
        100% {
            left: 120%;
        }
    }
`;
const HeroSubtext = styled.p`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
`;
const HeroVisual = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;
const HeroImage = styled.img`
    width: 100%;
    max-width: 500px;
    height: auto;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

// -------------------------------------------------------- Features Section.
const WaveDivider = styled.svg`
    justify-self: center;
    display: block;
    width: 100vw;
    height: 120px;
    min-width: 100%;
    position: relative;
    z-index: 2;
    pointer-events: none;
`;
const FeaturesSection = styled.div`
    width: 100vw;
    justify-self: center;
    padding: 5rem 5rem;
    background: linear-gradient(90deg, #b6e0fe 0%, #a7ffeb 100%);
    border-radius: 0;
    position: relative;
    z-index: 1;
`;
const SectionTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 1.2rem 0;
    background: linear-gradient(90deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--button-primary);
    letter-spacing: 0.5px;
`;
const SectionSubtitle = styled.div`
    font-size: 1.15rem;
    color: var(--text-secondary);
    font-weight: 400;
    margin-top: 0.5rem;
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
`;
const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem 2rem 0 2rem;
`;
const FeatureCard = styled.div`
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.8s ease-out both;

    &:hover {
        transform: translateY(-6px) scale(1.035);
        box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        border: 2.5px solid transparent;
        background-clip: padding-box;
    }

    @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes gradientBarMove {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 0%; }
    }
`;
const FeatureIcon = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
    color: white;
    font-size: 1.8rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s, transform 0.3s;
    position: relative;
    z-index: 3;
    
    ${FeatureCard}:hover & {
        animation: iconPulse 1.2s infinite alternate;
        box-shadow: 0 0 0 6px rgba(0, 212, 170, 0.12), 0 8px 20px rgba(0, 0, 0, 0.18);
        transform: scale(1.08);
    }
    @keyframes iconPulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.10); }
        100% { box-shadow: 0 0 0 10px rgba(0, 212, 170, 0.18); }
    }
`;
const FeatureTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(90deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
        color: var(--button-primary);
    letter-spacing: 0.5px;
`;
const FeatureDescription = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
`;

// -------------------------------------------------------- How It Works Section.
const HowItWorksSection = styled.div`
    padding: 6rem 0;
`;
const StepsContainer = styled.div`
    margin-top: 2rem;
    align-items: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 0 2rem;
`;
const Step = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    
    ${props => props.$isActive && `
        transform: translateY(-8px) scale(1.02);
        filter: drop-shadow(0 8px 25px rgba(0, 123, 255, 0.3));
    `}
`;
const StepNumber = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 1)) padding-box, 
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    border: 3px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.$isActive && `
        transform: translateX(-50%) scale(1.15);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.5);
        animation: numberPulse 2s ease-in-out infinite;
    `}

    span {
        background: linear-gradient(135deg,
                var(--button-primary),
                var(--amount-positive));
        -webkit-background-clip: text;   /* Safari/Chrome */
                background-clip: text;   /* Firefox */
        -webkit-text-fill-color: transparent;
                color: transparent;      /* fallback */
        line-height: 1;                  /* centres the digit nicely */
    }

    @keyframes numberPulse {
        0%, 100% { 
            transform: translateX(-50%) scale(1.15);
            box-shadow: 0 12px 30px rgba(0, 123, 255, 0.5);
        }
        50% { 
            transform: translateX(-50%) scale(1.25);
            box-shadow: 0 16px 40px rgba(0, 123, 255, 0.7);
        }
    }
`;
const StepContent = styled.div`
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1)) padding-box, 
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    border: 3px solid transparent;
    border-radius: 12px;
    min-height: 150px;
    padding: 2.5rem;
    gap: 0.5rem;
    margin-top: 30px;
`;
const Step2LinesWrapper = styled.div`
    position: relative;
    width: 100%;
    min-height: 140px;
`;
const Step2LinesSVG = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 170px;
    pointer-events: none;
    z-index: 0;
`;

// -------------------------------------------------------- Step 3 Flow Components.
const Step3FlowWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 120px;
`;
const Step3FlowSVG = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    pointer-events: none;
    z-index: 0;
`;
const Step3Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 3rem;
`;
const Step3Icon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
    font-size: 1.25rem;
    position: relative;
    z-index: 2;
    border: 3px solid rgba(255, 255, 255, 0.9);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
`;

// -------------------------------------------------------- Step 1 Flow Components.
const Step1FlowWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 120px;
`;
const Step1FlowSVG = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    pointer-events: none;
    z-index: 0;
`;
const Step1Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 3rem;
`;
const Step1Icon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
    font-size: 1.25rem;
    position: relative;
    z-index: 2;
    border: 3px solid rgba(255, 255, 255, 0.9);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
`;

// -------------------------------------------------------- Step 2 Flow Components.
const Step2Container = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
`;
const Column1Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
`;
const Column2Container = styled.div`
        display: flex;
        flex-direction: column;
    gap: 1rem;
    justify-content: center;
        align-items: center;
`;
const Column3Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    
    FontAwesomeIcon {
        color: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    }
`;
const Step2Icon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    border: 3px solid transparent;
    background: linear-gradient(white, white) padding-box, 
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    color: white;
    font-size: 1.25rem;
    z-index: 1;
`;
const StepIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
    font-size: 1.25rem;
    position: relative;
    z-index: ${props => props.$overlap ? '1' : '2'};
    margin-left: ${props => props.$overlap ? '-20px' : '0'};
    border: 3px solid rgba(255, 255, 255, 0.9);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
`;
const Logo = styled.img`
    width: auto;
    height: 60%;
    object-fit: contain;
`;
const StepTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
`;
const StepDescription = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
`;

// -------------------------------------------------------- CTA Section.
const CTASection = styled.div`
    padding: 6rem 0;
    width: 100vw;
    justify-self: center;
    background: linear-gradient(90deg, var(--button-primary), var(--amount-positive));
    text-align: center;
`;
const CTAContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 0 2rem;
`;
const CTATitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    color: white;
`;
const CTASubtitle = styled.p`
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    max-width: 600px;
    line-height: 1.6;
`;
const CTAButton = styled.button`
    font: inherit;
    background: white;
    color: var(--button-primary);
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    &:hover {
            transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
`;
const CTABenefits = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;
const BenefitItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;

    svg {
        color: #4ade80;
    }
`;

// -------------------------------------------------------- NavBar.
const NavBar = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1.5px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    z-index: 100;
    padding: 0 5.5rem;
`;
const NavLogo = styled.img`
    height: 100px;
    width: auto;
    border-radius: 8px;
`;
const NavActions = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;
const SignInButton = styled.button`
    font: inherit;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.7em 1.6em;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: background 0.4s, transform 0.2s;
    
    &:hover {
        background: linear-gradient(135deg, var(--amount-positive), var(--button-primary));
        transform: translateY(-2px) scale(1.04);
    }
`;

// -------------------------------------------------------- Export WelcomeScreen Component.
export default WelcomeScreen; 