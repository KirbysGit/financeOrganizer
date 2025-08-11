// ForgotPasswordPage.jsx
//
// This is the page that the user will see when they click the link in the "Forgot Password?" email.
// 
// The user will load onto a page with a form to enter their new password. The form will just prompt for a new password
// will basically identical styling to the password forms in our SignUpModal, it will verify they meet the password co-
// mplexity requirements, and then will allow them to submit the form. It also verifies that the password is new. And I
// re-used the the same particle backdrop as the EmailVerificationPage, again just for eye-catching purposes.

// Imports.
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faX, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import colorScheme from '../../../images/colorSchemeIcon.png';
import { resetPassword, verifyPasswordResetToken } from '../../../services/api';
import ParticleBackdropFinance from './ParticleBackdropFinance';

// -------------------------------------------------------- ForgotPasswordPage Component.
const ForgotPasswordPage = () => {
    
    // -------------------------------------------------------- State Declarations.
    
    const [email, setEmail] = useState('');                                         // State 4 Email Address.
    const [token, setToken] = useState('');                                         // State 4 Token.
    const [errors, setErrors] = useState({});                                       // State 4 Errors To Display.
    const [message, setMessage] = useState('');                                     // State 4 Message To Display.
    const [status, setStatus] = useState('verifying');                              // State 4 Status Of Verification.
    const [isLoading, setIsLoading] = useState(false);                              // State 4 Whether Email Is Being Sent.
    const [successStates, setSuccessStates] = useState({});                         // State 4 Success States To Display.
    const [showPassword, setShowPassword] = useState(false);                        // State 4 Whether Password Is Being Shown.
    const [passwordFocused, setPasswordFocused] = useState(false);                  // State 4 Whether Password Is Focused.
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);          // State 4 Whether Confirm Password Is Being Shown.
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);    // State 4 Whether Confirm Password Is Focused.
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' }); // State 4 Form Data.
    const [passwordRequirementsShown, setPasswordRequirementsShown] = useState(false); // State 4 Whether Password Requirements Are Shown.
    const [confirmPasswordRequirementsShown, setConfirmPasswordRequirementsShown] = useState(false); // State 4 Whether Confirm Password Requirements Are Shown.

    // -------------------------------------------------------- Use Effect For Checking URL Parameters.
    useEffect(() => {
        // Get Token & Email From URL Parameters.
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        const emailParam = urlParams.get('email');
        
        // Set Email If It Exists.
        if (emailParam) {
            setEmail(emailParam);
        }

        if (tokenParam) {
            setToken(tokenParam);
            handleTokenVerification(tokenParam);
        } else {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new password reset.');
        }
    }, []);

    // -------------------------------------------------------- Handle Token Verification.
    const handleTokenVerification = async (token) => {
        try {
            setStatus('verifying');
            await verifyPasswordResetToken(token);
            setStatus('success');
        } catch (error) {
            // If Error, Set Error Message.
            console.error('Token verification failed:', error);
            if (error.response?.status === 400) {
                setStatus('expired');
                setMessage('This password reset link has expired. Please request a new one.');
            } else {
                setStatus('error');
                setMessage('Invalid reset link. Please request a new password reset.');
            }
        }
    };

    // -------------------------------------------------------- Password Requirements Checker.
    const checkPasswordRequirements = (password) => {
        return {
            minLength: password.length >= 10,
            hasComplexChar: /[@$!%*?&#]/.test(password),
            hasTwoNumbers: (password.match(/\d/g) || []).length >= 2,
            hasCapitalLetter: /[A-Z]/.test(password)
        };
    };

    // -------------------------------------------------------- Check if Password is Fully Valid.
    const isPasswordFullyValid = (password) => {
        const requirements = checkPasswordRequirements(password);
        return requirements.minLength && requirements.hasComplexChar && requirements.hasTwoNumbers && requirements.hasCapitalLetter;
    };

    // -------------------------------------------------------- Validation Functions.
    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        if (value.length < 10) return 'Password must be at least 10 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character (@$!%*?&)';
        return '';
    };

    // -------------------------------------------------------- Validate Confirm Password.
    const validateConfirmPassword = (value, password = formData.password) => {
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
    };

    // -------------------------------------------------------- Handle Input Changes with Validation.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-Time Validation.
        let errorMessage = '';
        switch (name) {
            case 'password':
                errorMessage = validatePassword(value);
                // Also Validate Confirm Password If It Has A Value.
                if (formData.confirmPassword) {
                    const confirmError = validateConfirmPassword(formData.confirmPassword, value);
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: confirmError
                    }));
                }
                // Update Confirm Password Success State When Password Changes.
                if (formData.confirmPassword) {
                    setSuccessStates(prev => ({
                        ...prev,
                        confirmPassword: !validateConfirmPassword(formData.confirmPassword, value) && 
                                       formData.confirmPassword.trim() !== '' && 
                                       isPasswordFullyValid(value)
                    }));
                }
                break;
            case 'confirmPassword':
                errorMessage = validateConfirmPassword(value);
                break;
            default:
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
        
        // Update Success States.
        setSuccessStates(prev => ({
            ...prev,
            [name]: !errorMessage && value.trim() !== ''
        }));
        
        // Special Handling For Confirm Password - Only Show Success If Password Is Also Valid.
        if (name === 'confirmPassword') {
            setSuccessStates(prev => ({
                ...prev,
                confirmPassword: !errorMessage && value.trim() !== '' && isPasswordFullyValid(formData.password)
            }));
        }
    };

    // -------------------------------------------------------- Handle Form Submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Comprehensive Validation.
        const newErrors = {};
        newErrors.password = validatePassword(formData.password);
        newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);

        // Remove Empty Error Messages.
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );

        if (Object.keys(filteredErrors).length > 0) {
            setErrors(filteredErrors);
            setIsLoading(false);
            return;
        }

        try {
            const resetData = {
                token: token,
                new_password: formData.password
            };
            
            await resetPassword(resetData);
            setMessage('Password successfully reset! Redirecting to login...');
            
            // Redirect To Login After 2 Seconds.
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error('Password reset failed:', error);
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else {
                setErrors({ general: 'Password reset failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Get Status Content.
    const getStatusContent = () => {
        switch (status) {
            case 'verifying':
                return {
                    title: 'Verifying Reset Link...',
                    subtitle: 'Please wait while we verify your password reset link.',
                    color: 'var(--button-primary)',
                    animation: 'loading'
                };
            case 'success':
                return {
                    title: 'Reset Your Password',
                    subtitle: 'Create a new secure password for your account',
                    color: 'var(--amount-positive)',
                    animation: 'none'
                };
            case 'error':
                return {
                    title: 'Invalid Reset Link',
                    subtitle: 'This password reset link is invalid or has expired.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
            case 'expired':
                return {
                    title: 'Link Expired',
                    subtitle: 'This password reset link has expired. Please request a new one.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
            default:
                return {
                    title: 'Error',
                    subtitle: 'An unexpected error occurred.',
                    color: 'var(--amount-negative)',
                    animation: 'none'
                };
        }
    };

    // -------------------------------------------------------- Status Content.
    const statusContent = getStatusContent();

    // -------------------------------------------------------- Return JSX.
    return (
        <Container>
            {/* Glass Morphism Particles. */}
            {!window.matchMedia("(prefers-reduced-motion: reduce)").matches && (
                <ParticleBackdropFinance />
            )}
            
            <Card>
                {/* Logo. */}
                <LogoContainer>
                    <Logo src={colorScheme} alt="Centi Logo" />
                </LogoContainer>
                
                {/* Title. */}
                <Title>{statusContent.title}</Title>

                {/* Subtitle. */}
                <Subtitle>{statusContent.subtitle}</Subtitle>

                {/* Form. */}
                {status === 'success' && (
                    <StyledForm onSubmit={handleSubmit}>
                        {/* Form Group. */}
                        <FormGroup>
                            {/* Label, "New Password *" */}
                            <Label htmlFor="password">New Password <span>*</span></Label>

                            {/* Input Wrapper. */}
                            <InputWrapper $hasError={!!errors.password} $isSuccess={!!successStates.password}>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setPasswordFocused(true);
                                        setPasswordRequirementsShown(true);
                                    }}
                                    placeholder="Create a new password"
                                    $hasError={!!errors.password}
                                    autoComplete="new-password"
                                />
                                <PasswordToggle
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    $hasSuccess={!!successStates.password}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </PasswordToggle>
                                {successStates.password && <SuccessCheckmark />}
                            </InputWrapper>

                            {/* Error Message. */}
                            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

                            {/* Password Requirements. */}
                            <PasswordRequirements $isVisible={passwordRequirementsShown}>
                                <RequirementItem $isMet={checkPasswordRequirements(formData.password).minLength}>
                                    <RequirementIcon $isMet={checkPasswordRequirements(formData.password).minLength}>
                                        {checkPasswordRequirements(formData.password).minLength ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon icon={faX} />
                                        )}
                                    </RequirementIcon>
                                    Minimum 10 characters
                                </RequirementItem>
                                <RequirementItem $isMet={checkPasswordRequirements(formData.password).hasComplexChar}>
                                    <RequirementIcon $isMet={checkPasswordRequirements(formData.password).hasComplexChar}>
                                        {checkPasswordRequirements(formData.password).hasComplexChar ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon icon={faX} />
                                        )}
                                    </RequirementIcon>
                                    One complex character (!@#$%^&*)
                                </RequirementItem>
                                <RequirementItem $isMet={checkPasswordRequirements(formData.password).hasTwoNumbers}>
                                    <RequirementIcon $isMet={checkPasswordRequirements(formData.password).hasTwoNumbers}>
                                        {checkPasswordRequirements(formData.password).hasTwoNumbers ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon icon={faX} />
                                        )}
                                    </RequirementIcon>
                                    Two numbers
                                </RequirementItem>
                                <RequirementItem $isMet={checkPasswordRequirements(formData.password).hasCapitalLetter}>
                                    <RequirementIcon $isMet={checkPasswordRequirements(formData.password).hasCapitalLetter}>
                                        {checkPasswordRequirements(formData.password).hasCapitalLetter ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon icon={faX} />
                                        )}
                                    </RequirementIcon>
                                    One capital letter
                                </RequirementItem>
                            </PasswordRequirements>
                        </FormGroup>
                        
                        {/* Form Group. */}
                        <FormGroup>
                            {/* Label, "Confirm New Password *" */}
                            <Label htmlFor="confirmPassword">Confirm New Password <span>*</span></Label>

                            {/* Input Wrapper. */}
                            <InputWrapper $hasError={!!errors.confirmPassword} $isSuccess={!!successStates.confirmPassword}>
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setConfirmPasswordFocused(true);
                                        setConfirmPasswordRequirementsShown(true);
                                    }}
                                    placeholder="Confirm your new password"
                                    $hasError={!!errors.confirmPassword}
                                    autoComplete="new-password"
                                />
                                <PasswordToggle
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    $hasSuccess={!!successStates.confirmPassword}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </PasswordToggle>
                                {successStates.confirmPassword && <SuccessCheckmark />}
                            </InputWrapper>

                            {/* Error Message. */}
                            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}

                            {/* Password Requirements. */}
                            <PasswordRequirements $isVisible={confirmPasswordRequirementsShown}>
                                <RequirementItem $isMet={formData.password === formData.confirmPassword && isPasswordFullyValid(formData.password)}>
                                    <RequirementIcon $isMet={formData.password === formData.confirmPassword && isPasswordFullyValid(formData.password)}>
                                        {formData.password === formData.confirmPassword && isPasswordFullyValid(formData.password) ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon icon={faX} />
                                        )}
                                    </RequirementIcon>
                                    Passwords must match
                                </RequirementItem>
                            </PasswordRequirements>
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
                                    Resetting Password...
                                </>
                            ) : (
                                <>
                                    Reset Password
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </>
                            )}
                        </SubmitButton>
                    </StyledForm>
                )}
                
                {/* Error Section. */}
                {(status === 'error' || status === 'expired') && (
                    <ErrorSection>
                        <ErrorMessage>{message}</ErrorMessage>
                        <BackButton onClick={() => window.location.href = '/'}>
                            Back to Login
                        </BackButton>
                    </ErrorSection>
                )}
            </Card>
        </Container>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Container.
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

// -------------------------------------------------------- Card.
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

// -------------------------------------------------------- Logo Container.
const LogoContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
`;

// -------------------------------------------------------- Logo.
const Logo = styled.img`
    height: 60px;
    width: auto;
    border-radius: 8px;
`;

// -------------------------------------------------------- Title (e.g. "Reset Your Password")
const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
`;

// -------------------------------------------------------- Subtitle (e.g. "Enter your email address in the form below. We'll send you a link to reset your password.")
const Subtitle = styled.p`
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
`;

// -------------------------------------------------------- Styled Form For Inputs.
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
`;

// -------------------------------------------------------- Form Group.
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.325rem;
`;

// -------------------------------------------------------- Label. (e.g. "New Password *")
const Label = styled.label`
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;

    span {
        color: var(--amount-negative);
        font-weight: 600;
    }
`;

// -------------------------------------------------------- Input. (e.g. "Create a new password")
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

// -------------------------------------------------------- Password Toggle.
const PasswordToggle = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.75rem;
    margin-right: ${props => props.$hasSuccess ? '2.5rem' : '0.25rem'};
    transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        color: var(--text-primary);
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
    
    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    &:active:not(:disabled) {
        transform: translateY(-1px);
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

// -------------------------------------------------------- Password Requirements.
const PasswordRequirements = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: ${props => props.$isVisible ? '0.75rem' : '0'};
    padding: ${props => props.$isVisible ? '0.75rem' : '0'};
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    max-height: ${props => props.$isVisible ? '200px' : '0'};
    opacity: ${props => props.$isVisible ? '1' : '0'};
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(-10px)'};
    pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

// -------------------------------------------------------- Requirement Item.
const RequirementItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: ${props => props.$isMet ? 'var(--amount-positive)' : 'var(--text-secondary)'};
    transition: color 0.3s ease;
`;

// -------------------------------------------------------- Requirement Icon.
const RequirementIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.$isMet ? 'var(--amount-positive)' : 'transparent'};
    color: ${props => props.$isMet ? 'white' : 'var(--text-secondary)'};
    font-size: 0.7rem;
    font-weight: bold;
    border: 1px solid ${props => props.$isMet ? 'var(--amount-positive)' : 'rgba(0, 0, 0, 0.2)'};
    transition: all 0.3s ease;
`;

// -------------------------------------------------------- Error Section.
const ErrorSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
`;

// -------------------------------------------------------- Back Button.
const BackButton = styled.button`
    font: inherit;
    background: transparent;
    color: var(--text-secondary);
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.75rem 1.5rem;
    
    &:hover {
        background: rgba(0, 0, 0, 0.05);
        border-color: var(--button-primary);
        color: var(--button-primary);
    }
`;

export default ForgotPasswordPage;
