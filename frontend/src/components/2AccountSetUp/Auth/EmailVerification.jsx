// EmailVerification.jsx
//
// This is the page that the user will see after they have clicked the verification link in their email.
// 
// The user will see a card with a message upon load saying that its verifying their email, then assuming a successful
// verification, it will show them the success message with some confetti and a redirect option to the login page. If
// the verification fails, it will show them an error message and a resend option. The particles in the background are 
// more an addition of filling the empty space in the back and making it more eye catching.

// Imports.
import Confetti from 'react-confetti';
import { styled } from 'styled-components';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSpinner, faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import ParticleBackdropFinance from './ParticleBackdropFinance';
import { verifyEmail, resendVerificationEmail } from '../../../services/api';

// -------------------------------------------------------- EmailVerification Component.
const EmailVerification = () => {
    
    // -------------------------------------------------------- State Declarations.
    
    const [email, setEmail] = useState('');                     // State 4 Email Address.
    const [message, setMessage] = useState('');                 // State 4 Message To Display.
    const [status, setStatus] = useState('verifying');          // State 4 Status Of Verification.
    const [isResending, setIsResending] = useState(false);      // State 4 Whether Email Is Being Resent.
    const [showConfetti, setShowConfetti] = useState(false);    // State 4 Whether Confetti Should Be Shown.
    const [clickConfetti, setClickConfetti] = useState(false);  // State 4 Whether Click Confetti Should Be Shown.

    // -------------------------------------------------------- Use Effect For Checking URL Parameters.
    useEffect(() => {
        console.log('EmailVerification: Component Mounted, Checking URL Parameters...');
        
        // Get Token & Email From URL Parameters.
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const emailParam = urlParams.get('email');
                
        // Set Email If It Exists.
        if (emailParam) {
            setEmail(emailParam);
        }

        // Call Handle Verification If Token Exists.
        if (token) {
            handleVerification(token);
        } else {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email for the correct link.');
        }
    }, []);

    // -------------------------------------------------------- Handle Verification.
    const handleVerification = async (token) => {
        try {
            setStatus('verifying');
            
            const response = await verifyEmail(token);
            
            setStatus('success');
            setMessage(response.data.message || 'Email verified successfully!');
            setShowConfetti(true);
        } catch (error) {            
            if (error.response?.status === 400) {
                setStatus('expired');
                setMessage('This verification link has expired. Please request a new one.');
            } else {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed. Please try again.');
            }
        }
    };

    // -------------------------------------------------------- Handle Resending Email.
    const handleResendEmail = async () => {
        if (!email) {
            setMessage('Please enter your email address to resend the verification email.');
            return;
        }

        try {
            setIsResending(true);
            await resendVerificationEmail(email);
            setMessage('Verification email sent!');
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    // -------------------------------------------------------- Handle Going To Login.
    const handleGoToLogin = () => {
        // After Successful Verification, Navigate To The Main App.
        // The App Will Detect The Verified User And Proceed Appropriately.
        window.location.href = '/';
    };

    // -------------------------------------------------------- Handle Emoji Click For Confetti.
    const handleEmojiClick = () => {
        if (status === 'success') {
            setClickConfetti(true);
            // Clear The Click Confetti After 3 Seconds.
            setTimeout(() => {
                setClickConfetti(false);
            }, 3000);
        }
    };

    // -------------------------------------------------------- Get Status Content. (Loading, Success, Error, Expired)
    const getStatusContent = () => {
        switch (status) {
            case 'verifying':
                return {
                    icon: 'loading',
                    title: 'Verifying Your Email...',
                    subtitle: (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}>
                            <span>Please wait while we verify your email address</span>
                            <span style={{
                                background: 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                            }}>
                                {email}
                            </span>
                            <span>This should only take a moment.</span>
                        </div>
                    ),
                    color: 'var(--button-primary)',
                    animation: 'loading'
                };
            case 'success':
                return {
                    icon: '🎉',
                    title: 'Your Email Has Been Verified!',
                    subtitle: (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}>
                            <span>Your account under the email address</span>
                            <span style={{
                                background: 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '600',
                                fontSize: '1.75rem',
                            }}>
                                {email}
                            </span>
                            <span>is now active and ready to use.</span>
                        </div>
                    ),
                    color: 'var(--amount-positive)',
                    animation: 'confetti'
                };
            case 'error':
                return {
                    icon: faExclamationTriangle,
                    title: 'Verification Failed',
                    subtitle: 'There was an error verifying your email. Please try again.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
            case 'expired':
                return {
                    icon: faExclamationTriangle,
                    title: 'Link Expired',
                    subtitle: 'This verification link has expired. Please request a new one.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
            default:
                return {
                    icon: faExclamationTriangle,
                    title: 'Error',
                    subtitle: 'An unexpected error occurred.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
        }
    };

    // -------------------------------------------------------- Get Status Content.
    const statusContent = getStatusContent();

    // -------------------------------------------------------- Return JSX.
    return (
        <Container>
            {/* Glass Morphism Particles */}
            {!window.matchMedia("(prefers-reduced-motion: reduce)").matches && (
                <ParticleBackdropFinance />
            )}

            {/* Confetti Upon Successful Verification. */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFA07A', '#20B2AA', '#FF69B4']}
                    gravity={0.3}
                    wind={0.05}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
            )}

            {/* Confetti Upon Click Of Emoji. */}
            {clickConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    colors={['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#32CD32', '#9370DB', '#FF6347', '#20B2AA', '#FF1493', '#00FA9A']}
                    gravity={0.3}
                    wind={0.05}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
            )}

            {/* Main Card For Verification Message. */}
            <Card>

                {/* Success Indicator. */}
                {status === 'success' && (
                    <SuccessIndicatorContainer>
                        {/* Self-Drawing Checkmark. */}
                        <DrawingCheckmark>
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="rgba(34, 197, 94, 0.1)"
                                    stroke="var(--amount-positive)"
                                    strokeWidth="3"
                                    className="checkmark-circle"
                                />
                                <path
                                    d="M25 50 L40 65 L75 35"
                                    stroke="var(--amount-positive)"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="checkmark-path"
                                />
                            </svg>
                        </DrawingCheckmark>
                    </SuccessIndicatorContainer>
                )}
            
                {/* Title , "Your Email Has Been Verified!" */}
                <Title>{statusContent.title}</Title>

                {/* Additional Subtitle, "You can now head over to Centi to begin tracking." */}
                {status === 'success' && (
                    <AdditionalSubtitle>
                        You can now head over to Centi to begin tracking.
                    </AdditionalSubtitle>
                )}

                {/* Status Icon. */}
                <StatusIcon 
                    icon={statusContent.icon} 
                    $color={statusContent.color}
                    $animation={statusContent.animation}
                    onEmojiClick={handleEmojiClick}
                />

                {/* Divider. */}
                <Divider />

                {/* Subtitle. */}
                <Subtitle>{statusContent.subtitle}</Subtitle>
                
                {/* Divider. */}
                <Divider />
                
                {/* Login Button. */}
                {status === 'success' && (
                    <SuccessSection>
                        <LoginButton onClick={handleGoToLogin}>
                            Go to Login <FontAwesomeIcon icon={faArrowRight} />
                        </LoginButton>
                    </SuccessSection>
                )}
                
                {/* Resend Section. */}
                {(status === 'error' || status === 'expired') && (
                    <ResendSection>
                        <ResendTitle>Need a new verification email?</ResendTitle>
                        <EmailInput
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <ResendButton 
                            onClick={handleResendEmail}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    Resend Verification Email
                                </>
                            )}
                        </ResendButton>
                    </ResendSection>
                )}
            </Card>
        </Container>
    );
};

// -------------------------------------------------------- Styled Components.
const Container = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    padding: 1rem;
    position: relative;
    overflow: hidden;
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    padding: 2rem 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 525px;
    width: 100%;
    text-align: center;
    backdrop-filter: blur(10px);
    animation: pop 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    z-index: 2;
    
    @keyframes pop {
        from {
            transform: scale(0.92);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

// -------------------------------------------------------- Status Icon.
const StatusIcon = ({ icon, $color, $animation, onEmojiClick }) => {
    
    // Handling Emoji Icon.
    if (typeof icon === 'string' && icon.includes('🎉')) {
        return (
            <EmojiIcon 
                $color={$color}
                $animation={$animation}
                onClick={onEmojiClick}
                $clickable={!!onEmojiClick}
            >
                {icon}
            </EmojiIcon>
        );
    }
    
    // Handling Loading Spinner.
    if (icon === 'loading') {
        return <LoadingSpinner $color={$color} />;
    }
    
    // Handling Font Awesome Icon.
    return (
        <FontAwesomeIcon 
            icon={icon} 
            style={{ 
                fontSize: '4rem',
                color: $color,
                marginBottom: '1.5rem',
                animation: $animation === 'spin' ? 'spin 1s linear infinite' : 'none'
            }}
        />
    );
};

// -------------------------------------------------------- Emoji Icon.
const EmojiIcon = styled.div`
    font-size: 5rem;
    color: ${props => props.$color};
    margin-bottom: 1.5rem;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    transition: all 0.3s ease;
    animation: ${props => {
        if (props.$animation === 'confetti') {
            return 'bounce 0.6s ease-in-out';
        }
        return 'none';
    }};
    
    ${props => props.$clickable && `
        &:hover {
            transform: scale(1.1);
            filter: brightness(1.2);
        }
        
        &:active {
            transform: scale(0.95);
        }
    `}
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-20px);
        }
        60% {
            transform: translateY(-10px);
        }
    }
`;

// -------------------------------------------------------- Loading Spinner.
const LoadingSpinner = styled.div`
    width: 80px;
    height: 80px;
    margin: 1rem auto 1.5rem auto;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 4px solid rgba(0, 123, 255, 0.1);
        border-radius: 50%;
    }
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 4px solid transparent;
        border-top: 4px solid ${props => props.$color};
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

// -------------------------------------------------------- Title.
const Title = styled.h1`
    align-self: center;
    justify-self: center;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
`;

// -------------------------------------------------------- Subtitle.
const Subtitle = styled.p`
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
`;

// -------------------------------------------------------- Additional Subtitle.
const AdditionalSubtitle = styled.p`
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0.5rem 0 0.5rem 0;
    line-height: 1.5;
    font-weight: 500;
`;

// -------------------------------------------------------- Success Section.
const SuccessSection = styled.div`
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
`;

// -------------------------------------------------------- Login Button.
const LoginButton = styled.button`
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
    gap: 0.75rem;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

// -------------------------------------------------------- Resend Section.
const ResendSection = styled.div`
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

// -------------------------------------------------------- Resend Title.
const ResendTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
`;

// -------------------------------------------------------- Email Input.
const EmailInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- Resend Button.
const ResendButton = styled.button`
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

// -------------------------------------------------------- Divider.
const Divider = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    
    &::before,
    &::after {
        content: '';
        flex: 1;
        border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
`;

// -------------------------------------------------------- Success Indicator Container.
const SuccessIndicatorContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
`;

// -------------------------------------------------------- Drawing Checkmark.
const DrawingCheckmark = styled.div`
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: checkmarkAppear 0.5s ease-out;
    
    svg {
        filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
    }
    
    .checkmark-circle {
        animation: circleAppear 0.3s ease-out;
    }
    
    .checkmark-path {
        stroke-dasharray: 80;
        stroke-dashoffset: 80;
        animation: drawCheckmark 1.2s ease-out 0.8s forwards;
    }
    
    @keyframes checkmarkAppear {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes circleAppear {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes drawCheckmark {
        0% {
            stroke-dashoffset: 80;
        }
        100% {
            stroke-dashoffset: 0;
        }
    }
`;

// -------------------------------------------------------- Export EmailVerification Component.
export default EmailVerification; 