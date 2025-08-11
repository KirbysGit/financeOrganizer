// ForgotPasswordModal.jsx
//
// This is the modal that the user will see when they click the "Forgot Password?" link in the login page.
// 
// The user will see a modal with a form to enter their email address. Once they submit the form, they will see a message
// saying that a password reset email has been sent to their email address. If they have already reset their password,
// they will see a message saying that a password reset email has already been sent to their email address. The idea with
// this similar to the EmailVerificationModal, is to keep the navigation between the majority of the welcome pipeline 
// within the same modal, so that the user doesn't have to navigate to a different page to deal with everything, also while
// keeping the reviews on the right side of the screen. 

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import colorScheme from '../../../images/colorSchemeIcon.png';
import { sendPasswordResetEmail } from '../../../services/api';

// -------------------------------------------------------- ForgotPasswordModal Component.
const ForgotPasswordModal = ({ onBack, onSuccess }) => {

    // -------------------------------------------------------- State Declarations.
    
    const [email, setEmail] = useState('');                     // State 4 Email Address.
    const [message, setMessage] = useState('');                 // State 4 Message To Display.
    const [errors, setErrors] = useState({});                   // State 4 Errors To Display.
    const [isLoading, setIsLoading] = useState(false);          // State 4 Whether Email Is Being Sent.
    const [successStates, setSuccessStates] = useState({});     // State 4 Success States To Display.

    // -------------------------------------------------------- Validation Functions.
    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address (e.g., user@example.com)';
        }
        return '';
    };

    // -------------------------------------------------------- Handle Input Changes with Validation.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmail(value);
        
        // Real-time validation
        const errorMessage = validateEmail(value);
        setErrors(prev => ({
            ...prev,
            email: errorMessage
        }));
        
        setSuccessStates(prev => ({
            ...prev,
            email: !errorMessage && value.trim() !== ''
        }));
    };

    // -------------------------------------------------------- Handle Form Submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Comprehensive Validation.
        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError });
            setIsLoading(false);
            return;
        }

        // Try To Send Password Reset Email.
        try {
            await sendPasswordResetEmail(email);
            setMessage('Password reset email sent! Please check your inbox.');
            if (onSuccess) {
                onSuccess(email);
            }
        } catch (error) {
            // If Error, Set Error Message.
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else {
                setErrors({ general: 'Failed to send password reset email. Please try again.' });
            }
        } finally {
            setIsLoading(false);
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
                
                {/* Title, "Reset Your Password" */}
                <FormTitle>Reset Your Password</FormTitle>

                {/* Subtitle, "Enter your email address in the form below. We'll send you a link to reset your password." */}
                <FormSubtitle>Enter your email address in the form below. <br /> We'll send you a link to reset your password.</FormSubtitle>
                
                {/* Form. */}
                <StyledForm onSubmit={handleSubmit}>
                    {/* Form Group. */}
                    <FormGroup>
                        {/* Label, "Email Address *" */}
                        <Label htmlFor="email">Email Address <span>*</span></Label>

                        {/* Input Wrapper. */}
                        <InputWrapper $hasError={!!errors.email} $isSuccess={!!successStates.email}>
                            {/* Input. */}
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                $hasError={!!errors.email}
                                autoComplete="email"
                            />

                            {/* Success Checkmark. */}
                            {successStates.email && <SuccessCheckmark />}
                        </InputWrapper>

                        {/* Error Message. */}
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </FormGroup>
                    
                    {/* General Error Message. */}
                    {errors.general && (
                        <GeneralErrorMessage>
                            {errors.general}
                        </GeneralErrorMessage>
                    )}
                    
                    {/* Success Message. */}
                    {message && (
                        <SuccessMessage>
                            {message}
                        </SuccessMessage>
                    )}
                    
                    {/* Submit Button. */}
                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                Sending...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faEnvelope} />
                                Send Reset Link
                            </>
                        )}
                    </SubmitButton>

                    {/* Divider. */}
                    <Divider />

                    {/* Back Prompt. */}
                    <BackPrompt>
                        Ready to sign in? <BackLink onClick={onBack}>Sign in</BackLink>
                    </BackPrompt>

                    
                </StyledForm>
            </FormContainer>
        </ModalContainer>
    );
};

// -------------------------------------------------------- Styled Components.

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
    margin: 0 0 0.5rem 0;
    text-align: center;
`;

// -------------------------------------------------------- Form Subtitle.
const FormSubtitle = styled.p`
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    line-height: 1.5;
`;

// -------------------------------------------------------- Styled Form.
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Form Group.
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.325rem;
`;

// -------------------------------------------------------- Label.
const Label = styled.label`
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;

    span {
        color: var(--amount-negative);
        font-weight: 600;
    }
`;

// -------------------------------------------------------- Input.
const Input = styled.input`
    font: inherit;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: transparent;
    flex: 1;
    
    &:focus {
        outline: none;
    }
    
    &::placeholder {
        color: var(--text-secondary);
    }
`;

// -------------------------------------------------------- Input Wrapper.
const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    border: 2px solid ${props => {
        if (props.$hasError) return 'var(--amount-negative)';
        if (props.$isSuccess) return 'var(--amount-positive)';
        return 'rgba(0, 0, 0, 0.04)';
    }};
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    
    &:focus-within {
        border-color: ${props => {
            if (props.$hasError) return 'var(--amount-negative)';
            if (props.$isSuccess) return 'var(--amount-positive)';
            return 'var(--button-primary)';
        }};
        box-shadow: 0 0 0 3px ${props => {
            if (props.$hasError) return 'rgba(220, 53, 69, 0.1)';
            if (props.$isSuccess) return 'rgba(34, 197, 94, 0.1)';
            return 'rgba(0, 123, 255, 0.1)';
        }};
        background: rgba(255, 255, 255, 1);
    }
    
    &:hover {
        border-color: ${props => {
            if (props.$hasError) return 'var(--amount-negative)';
            if (props.$isSuccess) return 'var(--amount-positive)';
            return 'var(--button-primary)';
        }};
    }
`;

// -------------------------------------------------------- Success Checkmark.
const SuccessCheckmark = styled.div`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    background: var(--amount-positive);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    animation: slideInCheckmark 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
    
    &::before {
        content: '✓';
    }
    
    @keyframes slideInCheckmark {
        from {
            opacity: 0;
            transform: translateY(-50%) translateX(20px) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
        }
    }
`;

// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.span`
    color: var(--amount-negative);
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.25rem;
    padding-right: 0.35rem;
    text-align: left;
    display: block;
`;

// -------------------------------------------------------- General Error Message.
const GeneralErrorMessage = styled.div`
    color: var(--amount-negative);
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.08));
    padding: 1rem 1.25rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: center;
    border: 2px solid rgba(220, 53, 69, 0.3);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
`;

// -------------------------------------------------------- Success Message.
const SuccessMessage = styled.div`
    color: var(--amount-positive);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08));
    padding: 1rem 1.25rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: center;
    border: 2px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
`;

// -------------------------------------------------------- Submit Button.
const SubmitButton = styled.button`
    font: inherit;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
    position: relative;
    overflow: hidden;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &::before {
        z-index: 0;
        content: '';
        position: absolute;
        top: 0;
        left: -60%;
        width: 40%;
        height: 100%;
        background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%);
        transform: skewX(-20deg);
        pointer-events: none;
    }

    &:hover::before,
    &:focus-visible::before {
        animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes shimmer {
        from{ left:-60%; }
        to{ left:120%; }
    }
`;

// -------------------------------------------------------- Loading Spinner.
const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// -------------------------------------------------------- Divider.
const Divider = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    margin: 0.75rem 0 0 0;
    
    &::before,
    &::after {
        content: '';
        flex: 1;
        border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }
`;

// -------------------------------------------------------- Back Prompt.
const BackPrompt = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    padding: 0 0 0.25rem 0;
`;

// -------------------------------------------------------- Back Link.
const BackLink = styled.span`
    color: var(--button-primary);
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
        text-decoration: underline;
    }
`;

export default ForgotPasswordModal;
