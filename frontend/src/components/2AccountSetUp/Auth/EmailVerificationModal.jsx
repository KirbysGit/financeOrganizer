// EmailVerificationModal.jsx
//
// This is the modal that the user will see after they have signed up successfully with an account.
// 
// After a successful sign up, the user will be transitioned to this modal, it then informs them that an email has been
// sent to their email address to verify their account. It allows them to resend the email if they did not receive it,
// or if they have already verified their email, it will allow them to sign in to the app. I wanted to make sure the
// navigation between the majority of the welcome pipeline wasn't a ton of different pages, so using this modal within
// the AccountSetUpScreen helps accomplish that.

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheckCircle, faArrowRight, faRotate } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import colorScheme from '../../../images/colorSchemeIcon.png';
import { resendVerificationEmail } from '../../../services/api';

// -------------------------------------------------------- EmailVerificationModal Component.
const EmailVerificationModal = ({ userEmail, onShowLogin, onEmailVerificationComplete }) => {
    
    // -------------------------------------------------------- State Declarations.
    
    const [isResending, setIsResending] = useState(false);      // State 4 Whether Email Is Being Resent.
    const [resendMessage, setResendMessage] = useState('');     // State 4 Message To Display.

    // -------------------------------------------------------- Handle Resending Email.
    const handleResendEmail = async () => {
        // If No Email Address, Set Error Message.
        if (!userEmail) {
            setResendMessage('No email address available.');
            return;
        }

        // Try To Resend Email.
        try {
            setIsResending(true);
            await resendVerificationEmail(userEmail);
            setResendMessage('Verification email sent!');
        } catch (error) {
            // If Error, Set Error Message.
            let errorMessage = 'Failed to resend verification email. Please try again.';
            
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (Array.isArray(error.response.data)) {
                    errorMessage = error.response.data.map(err => err.msg || err.message).join(', ');
                }
            }
            
            setResendMessage(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    // -------------------------------------------------------- Return JSX.
    return (
        <ModalContainer>
            <FormContainer>
                {/* Logo. */}
                <LogoContainer>
                    <Logo src={colorScheme} alt="Centi Logo" />
                </LogoContainer>
                
                {/* Title, "Almost There! 📧" */}
                <FormTitle>Almost There! 📧</FormTitle>

                {/* Subtitle, "Your account has been created successfully. We've sent a verification email to complete your registration to the email address below:" */}
                <FormSubtitle>
                    Your account has been created successfully. We've sent a verification email to complete your registration to the email address below:
                </FormSubtitle>
                
                {/* Email Address. */}
                <EmailDisplay>
                    <EmailAddress>{userEmail}</EmailAddress>
                </EmailDisplay>

                {/* Divider. */}
                <Divider />

                {/* Instructions Section. */}
                <InstructionsSection>
                    <InstructionTitle>What's Next?</InstructionTitle>
                    <InstructionsList>
                        <InstructionItem>
                            <InstructionNumber>1</InstructionNumber>
                            <InstructionText>Check Your Email's Inbox for Our Verification Email. </InstructionText>
                        </InstructionItem>
                        <InstructionItem>
                            <InstructionNumber>2</InstructionNumber>
                            <InstructionText>Click the "Verify Email Address" Button in the Email.</InstructionText>
                        </InstructionItem>
                        <InstructionItem>
                            <InstructionNumber>3</InstructionNumber>
                            <InstructionText>Return Here & Sign In to Start Using Centi.</InstructionText>
                        </InstructionItem>
                    </InstructionsList>
                </InstructionsSection>
            
                {/* Button Section. For Resending Email & Login Prompt. */}
                <ButtonSection>
                    <ResendSection>
                        <ResendText>Didn't Receive Our Email?</ResendText>
                        <ResendButton 
                            onClick={handleResendEmail}
                            disabled={isResending}
                        >
                            {isResending ? (
                            <>
                                Sending... <FontAwesomeIcon icon={faRotate} />
                            </>
                        ) : (
                            <>
                                Resend <FontAwesomeIcon icon={faRotate} />
                            </>
                        )}
                        </ResendButton>
                        {resendMessage && (
                            <ResendMessage $type={resendMessage.includes('sent') ? 'success' : 'error'}>
                                {resendMessage}
                            </ResendMessage>
                        )}
                    </ResendSection>
                    
                    {/* Vertical Divider. */}
                    <VerticalDivider />
                    
                    {/* Login Prompt. */}
                    <LoginPrompt>
                        <LoginText>Already Verified?</LoginText>
                        <LoginButton onClick={() => {
                            console.log('EmailVerificationModal: Sign In button clicked');
                            console.log('EmailVerificationModal: onEmailVerificationComplete exists:', !!onEmailVerificationComplete);
                            console.log('EmailVerificationModal: onShowLogin exists:', !!onShowLogin);
                            
                            if (onEmailVerificationComplete) {
                                console.log('EmailVerificationModal: Calling onEmailVerificationComplete');
                                onEmailVerificationComplete();
                            } else {
                                console.log('EmailVerificationModal: Calling onShowLogin');
                                onShowLogin();
                            }
                        }}>
                            Sign In Now
                            <FontAwesomeIcon icon={faArrowRight} />
                        </LoginButton>
                    </LoginPrompt>
                </ButtonSection>
            </FormContainer>
        </ModalContainer>
    );
};

// ------------------------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Modal Container.
const ModalContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 6rem 0 0 0;
    padding: 1rem 2rem 1rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 500px;
    width: 100%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    @media (max-width: 1024px) {
        margin: 1rem;
        max-width: 100%;
    }
`;

// -------------------------------------------------------- Form Container.
const FormContainer = styled.div`
    width: 100%;
`;

// -------------------------------------------------------- Logo Container.
const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
`;

// -------------------------------------------------------- Logo.
const Logo = styled.img`
    height: 60px;
    width: auto;
    border-radius: 8px;
`;

// -------------------------------------------------------- Form Title.
const FormTitle = styled.h2`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.75rem 0;
    text-align: center;
    line-height: 1.3;
`;

// -------------------------------------------------------- Form Subtitle.
const FormSubtitle = styled.p`
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 1rem 0;
    font-size: 1rem;
    line-height: 1.5;
`;

// -------------------------------------------------------- Email Display.
const EmailDisplay = styled.div`
    text-align: center;
    margin: 0.5rem 0;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.05));
    border: 2px solid rgba(0, 123, 255, 0.2);
    border-radius: 12px;
`;

// -------------------------------------------------------- Email Address.
const EmailAddress = styled.span`
    font-weight: 600;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.1rem;
`;

// -------------------------------------------------------- Instructions Section.
const InstructionsSection = styled.div`
`;

// -------------------------------------------------------- Instruction Title.
const InstructionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    text-align: center;
`;

// -------------------------------------------------------- Instructions List.
const InstructionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

// -------------------------------------------------------- Instruction Item.
const InstructionItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
`;

// -------------------------------------------------------- Instruction Number.
const InstructionNumber = styled.div`
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    flex-shrink: 0;
`;

// -------------------------------------------------------- Instruction Text.
const InstructionText = styled.span`
    background: linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    border: 2px solid transparent;
    border-radius: 12px;
    color: var(--text-secondary);
    font-size: 0.9rem;
    flex: 1;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 10px 20px rgba(0, 123, 255, 0.2);
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
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
`;

// -------------------------------------------------------- Button Section.
const ButtonSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
    }
`;

// -------------------------------------------------------- Login Prompt.
const LoginPrompt = styled.div`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    flex: 1;
`;

// -------------------------------------------------------- Login Text.
const LoginText = styled.div`
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
`;

// -------------------------------------------------------- Login Button.
const LoginButton = styled.button`
    font: inherit;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
    
    &:active {
        transform: translateY(-1px) scale(0.98);
        transition: all 0.1s ease;
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
    
    svg {
        transition: transform 0.3s ease;
    }
    
    &:hover svg {
        transform: translateX(3px);
    }
`;

// -------------------------------------------------------- Vertical Divider.
const VerticalDivider = styled.div`
    width: 1px;
    background: rgba(0, 0, 0, 0.1);
    height: 100px;
    margin: 0 1rem;
    align-self: center;
    
    @media (max-width: 768px) {
        display: none;
    }
`;

// -------------------------------------------------------- Resend Section.
const ResendSection = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
`;

// -------------------------------------------------------- Resend Text.
const ResendText = styled.p`
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0 0 0.25rem 0;
`;

// -------------------------------------------------------- Resend Button.
const ResendButton = styled.button`
    gap: 0.5rem;
    font: inherit;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    
    &:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
    
    &:active:not(:disabled) {
        transform: translateY(-1px) scale(0.98);
        transition: all 0.1s ease;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
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
    
    &:hover:not(:disabled)::before {
        left: 100%;
    }
    
    svg {
        transition: transform 0.3s ease;
    }
    
    &:hover:not(:disabled) svg {
        transform: rotate(180deg);
    }
    
    &:disabled svg {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// -------------------------------------------------------- Resend Message.
const ResendMessage = styled.div`
    font-size: 0.9rem;
    font-weight: 500;
    color: ${props => props.$type === 'success' 
        ? 'var(--amount-positive)'
        : 'var(--amount-negative)'
    };
    text-align: center;
    animation: slideDown 0.3s ease-out;
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// -------------------------------------------------------- Export EmailVerificationModal Component.
export default EmailVerificationModal; 