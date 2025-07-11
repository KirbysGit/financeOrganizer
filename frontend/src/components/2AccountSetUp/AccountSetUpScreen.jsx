// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../styles/colors.css';
import LoginModal from './Auth/LoginModal';
import SignUpModal from './Auth/SignUpModal';

// -------------------------------------------------------- AccountSetUpScreen Component.
const AccountSetUpScreen = ({ onBack, onSignUpSuccess, onLoginSuccess, modalType }) => {
    
    // States 4 Screen.
    const [activeAuthModal, setActiveAuthModal] = useState(modalType);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // -------------------------------------------------------- Handle Sign Up Success.
    const handleSignUpSuccess = () => {
        console.log('AccountSetUpScreen: handleSignUpSuccess called, calling onSignUpSuccess...');
        onSignUpSuccess();
    };

    // -------------------------------------------------------- Handle Login Success.
    const handleLoginSuccess = () => {
        console.log('AccountSetUpScreen: handleLoginSuccess called, calling onLoginSuccess...');
        onLoginSuccess();
    };

    // -------------------------------------------------------- Handle Modal Switch with Animation.
    const handleSwitchToLogin = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveAuthModal('login');
            setIsTransitioning(false);
        }, 400); // Match the CSS transition duration
    };

    const handleSwitchToSignUp = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveAuthModal('signup');
            setIsTransitioning(false);
        }, 400); // Match the CSS transition duration
    };

    return (
        <ScreenContainer>
            <BackButton onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Home
            </BackButton>
            
            <AuthContainer>
                {/* Left Side - Auth Form */}
                <LeftGrid>
                    <ModalWrapper $isTransitioning={isTransitioning}>
                        {activeAuthModal === 'signup' ? (
                            <SignUpModal 
                                onSignUpSuccess={handleSignUpSuccess}
                                onShowLogin={handleSwitchToLogin}
                            />
                        ) : (
                            <LoginModal 
                                onLoginSuccess={handleLoginSuccess}
                                onShowSignUp={handleSwitchToSignUp}
                            />
                        )}
                    </ModalWrapper>
                </LeftGrid>
                
                {/* Right Side - Reviews */}
                <ReviewsSection>
                    <ReviewsContainer>
                        <ReviewsTitle>What Our Users Say</ReviewsTitle>
                        <ReviewsSubtitle>Join thousands of satisfied customers</ReviewsSubtitle>
                        
                        <ReviewsList>
                            <ReviewCard $align="start" $index={0}>
                                <ReviewHeader>
                                    <ReviewerAvatar>SM</ReviewerAvatar>
                                    <ReviewerInfo>
                                        <ReviewerName>Sarah Mitchell</ReviewerName>
                                        <ReviewerTitle>Marketing Manager</ReviewerTitle>
                                    </ReviewerInfo>
                                    <StarsContainer>
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faStar} />
                                        ))}
                                    </StarsContainer>
                                </ReviewHeader>
                                <ReviewText>
                                    "Centi completely transformed how I manage my finances. The insights are incredible and the interface is so intuitive. I've saved over $2,000 in just 3 months!"
                                </ReviewText>
                            </ReviewCard>
                            
                            <ReviewCard $align="end" $index={1}>
                                <ReviewHeader>
                                    <ReviewerAvatar>DJ</ReviewerAvatar>
                                    <ReviewerInfo>
                                        <ReviewerName>David Johnson</ReviewerName>
                                        <ReviewerTitle>Software Engineer</ReviewerTitle>
                                    </ReviewerInfo>
                                    <StarsContainer>
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faStar} />
                                        ))}
                                    </StarsContainer>
                                </ReviewHeader>
                                <ReviewText>
                                    "Finally, a finance app that doesn't overwhelm me with unnecessary features. Centi focuses on what matters and makes tracking expenses actually enjoyable."
                                </ReviewText>
                            </ReviewCard>
                            
                            <ReviewCard $align="start" $index={2}>
                                <ReviewHeader>
                                    <ReviewerAvatar>ML</ReviewerAvatar>
                                    <ReviewerInfo>
                                        <ReviewerName>Maria Lopez</ReviewerName>
                                        <ReviewerTitle>Small Business Owner</ReviewerTitle>
                                    </ReviewerInfo>
                                    <StarsContainer>
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faStar} />
                                        ))}
                                    </StarsContainer>
                                </ReviewHeader>
                                <ReviewText>
                                    "As a business owner, I need to track both personal and business expenses. Centi makes it seamless and the security gives me peace of mind."
                                </ReviewText>
                            </ReviewCard>
                            
                            <ReviewCard $align="end" $index={3}>
                                <ReviewHeader>
                                    <ReviewerAvatar>TF</ReviewerAvatar>
                                    <ReviewerInfo>
                                        <ReviewerName>Tom & Sarah Foster</ReviewerName>
                                        <ReviewerTitle>Family of Four</ReviewerTitle>
                                    </ReviewerInfo>
                                    <StarsContainer>
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faStar} />
                                        ))}
                                    </StarsContainer>
                                </ReviewHeader>
                                <ReviewText>
                                    "Managing our family budget used to be a nightmare. Centi makes it so easy to track everything - from groceries to kids' activities. We've saved over $3,500 this year!"
                                </ReviewText>
                            </ReviewCard>
                        </ReviewsList>
                    </ReviewsContainer>
                </ReviewsSection>
            </AuthContainer>
        </ScreenContainer>
    );
};

// -------------------------------------------------------- Styled Components.
const ScreenContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    z-index: 1000;
`;

const BackButton = styled.button`
    font: inherit;
    position: absolute;
    top: 2rem;
    left: 2rem;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blue(18px) saturate(160%);
    -webkit-backdrop-filter: blue(18px) saturate(160%);

    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 140px;
    
    &:hover {
        transform: translateX(-5px);
        color: rgb(219, 219, 219);
    }
`;

const AuthContainer = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 3fr 4fr;
    min-height: 100vh;
    border-radius: 24px;
    background: transparent;
    align-items: center;
    justify-content: center;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
`;

const LeftGrid = styled.div`
    display: flex;
    width: 100%;
    height: max-content;
    justify-content: center;
    align-self: flex-start;
`;

const ModalWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => props.$isTransitioning ? 'scale(0.95)' : 'scale(1)'};
    opacity: ${props => props.$isTransitioning ? '0.8' : '1'};
`;

const ReviewsSection = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
    }
    
    @media (max-width: 1024px) {
        display: none;
    }
`;

const ReviewsContainer = styled.div`
    max-width: 800px;
    width: 100%;
    position: relative;
    z-index: 1;
`;

const ReviewsTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem 0;
    text-align: center;
`;

const ReviewsSubtitle = styled.p`
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    margin: 0 0 3rem 0;
    font-size: 1.1rem;
`;

const ReviewsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 3rem;
`;

const ReviewCard = styled.div`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    align-self: ${props => props.$align === 'end' ? 'flex-end' : 'flex-start'};
    max-width: 85%;
    animation: float 6s ease-in-out infinite;
    animation-delay: ${props => props.$index * 1.5}s;
    
    &:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.15);
        animation-play-state: paused;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-8px);
        }
    }
`;

const ReviewHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const ReviewerAvatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 1.1rem;
`;

const ReviewerInfo = styled.div`
    flex: 1;
`;

const ReviewerName = styled.h4`
    color: white;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
`;

const ReviewerTitle = styled.p`
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.9rem;
`;

const StarsContainer = styled.div`
    display: flex;
    gap: 0.25rem;
    color: #ffd700;
    font-size: 0.9rem;
`;

const ReviewText = styled.p`
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin: 0;
    font-style: italic;
`;

export default AccountSetUpScreen;
