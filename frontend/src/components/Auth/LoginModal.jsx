// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../styles/colors.css';
import colorScheme from '../../images/colorSchemeIcon.png';
import googleLogo from '../../images/googleLogo.png';
import { loginUser, googleAuth, googleAuthCode } from '../../services/api';

// -------------------------------------------------------- LoginModal Component.
const LoginModal = ({ onLoginSuccess, onShowSignUp }) => {
    // Form States.
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    // UI States.
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successStates, setSuccessStates] = useState({});

    // -------------------------------------------------------- Validation Functions.
    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address (e.g., user@example.com)';
        }
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        return '';
    };

    // -------------------------------------------------------- Handle Input Changes with Validation.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-time validation
        let errorMessage = '';
        switch (name) {
            case 'email':
                errorMessage = validateEmail(value);
                break;
            case 'password':
                errorMessage = validatePassword(value);
                break;
            default:
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
        
        // Update success states
        setSuccessStates(prev => ({
            ...prev,
            [name]: !errorMessage && value.trim() !== ''
        }));
    };

    // -------------------------------------------------------- Handle Form Submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Comprehensive Validation.
        const newErrors = {};
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);

        // Remove Empty Error Messages.
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );

        if (Object.keys(filteredErrors).length > 0) {
            setErrors(filteredErrors);
            setIsLoading(false);
            return;
        }

        // Call The Login API.
        try {
            console.log('LoginModal: Form submitted successfully, calling login API...');
            
            const credentials = {
                email: formData.email,
                password: formData.password
            };
            
            const response = await loginUser(credentials);
            console.log('LoginModal: Login successful:', response.data);
            
            // Store The Access Token In Local Storage.
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            onLoginSuccess();
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else {
                setErrors({ general: 'Login failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Google Sign In.
    const handleGoogleSuccess = async (response) => {
        try {
            setIsLoading(true);
            console.log('Google Sign In Success:', response);
            
            // For auth-code flow, we send the authorization code to the backend
            // The backend will exchange it for tokens and user info
            const authData = {
                code: response.code,
                redirect_uri: window.location.origin
            };
            
            console.log('Sending authorization code to backend:', authData);
            
            // Send authorization code to backend for authentication/registration
            const authResponse = await googleAuthCode(authData);
            const authResult = authResponse.data;
            console.log('Backend Google auth response:', authResult);
            
            // Store the access token and user data
            localStorage.setItem('access_token', authResult.access_token);
            localStorage.setItem('user', JSON.stringify(authResult.user));
            
            // Call onLoginSuccess callback
            onLoginSuccess();
            
        } catch (error) {
            console.error('Google authentication failed:', error);
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error.message) {
                setErrors({ general: error.message });
            } else {
                setErrors({ general: 'Google authentication failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Google Login Hook.
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            console.error('Google Sign In Failed');
            setErrors({ general: 'Google sign in failed. Please try again.' });
        },
        flow: 'auth-code',
        scope: 'openid email profile',
        ux_mode: 'popup',
    });

    // -------------------------------------------------------- Custom Google Login with Centered Popup.
    const handleCustomGoogleLogin = () => {
        // Add a visual indicator that popup is opening
        const button = document.querySelector('.google-login-button');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Use the Google login function
        googleLogin();
    };

    // -------------------------------------------------------- Google One Tap Login.
    useGoogleOneTapLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            console.error('Google One Tap Login Failed');
            // Don't show error for One Tap as it's optional
        },
        disabled: false, // Enable One Tap
        auto_select: false, // Don't auto-select, let user choose
        cancel_on_tap_outside: true, // Close when clicking outside
        prompt_parent_id: 'google-one-tap-container' // Optional: specify container
    });

    return (
        <>
            {/* Google One Tap Container */}
            <div id="google-one-tap-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }} />
            
            <ModalContainer>
            <FormContainer>
                <LogoContainer>
                    <Logo src={colorScheme} alt="Centi Logo" />
                </LogoContainer>
                
                <FormTitle>Welcome Back</FormTitle>
                <FormSubtitle>Sign in to continue managing your finances</FormSubtitle>
                
                <StyledForm onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="email">Email Address <span>*</span></Label>
                        <InputWrapper $hasError={!!errors.email} $isSuccess={!!successStates.email}>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                $hasError={!!errors.email}
                            />
                            {successStates.email && <SuccessCheckmark />}
                        </InputWrapper>
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                        <Label htmlFor="password">Password <span>*</span></Label>
                        <InputWrapper $hasError={!!errors.password} $isSuccess={!!successStates.password}>
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                $hasError={!!errors.password}
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </PasswordToggle>
                            {successStates.password && <SuccessCheckmark />}
                        </InputWrapper>
                        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                    </FormGroup>
                    
                    {errors.general && <GeneralErrorMessage>{errors.general}</GeneralErrorMessage>}
                    
                    <SignInButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </SignInButton>
                </StyledForm>
                
                <Divider>
                    <DividerText>or</DividerText>
                </Divider>
                
                <CustomGoogleButton 
                    className="google-login-button"
                    type="button" 
                    onClick={handleCustomGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <GoogleLogo src={googleLogo} alt="Google" />
                            Continue with Google
                        </>
                    )}
                </CustomGoogleButton>
                
                <LoginPrompt>
                    Don't have an account? <LoginLink onClick={onShowSignUp}>Sign up</LoginLink>
                </LoginPrompt>
            </FormContainer>
            </ModalContainer>
        </>
    );
};

// -------------------------------------------------------- Styled Components
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

const FormContainer = styled.div`
    width: 100%;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Logo = styled.img`
    height: 80px;
    width: auto;
    border-radius: 8px;
`;

const FormTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    text-align: center;
`;

const FormSubtitle = styled.p`
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.325rem;
`;

const Label = styled.label`
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;

    span {
        color: var(--amount-negative);
        font-weight: 600;
    }
`;

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

const PasswordToggle = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.75rem;
    margin-right: 0.25rem;
    
    &:hover {
        color: var(--text-primary);
    }
`;

const ErrorMessage = styled.span`
    color: var(--amount-negative);
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.25rem;
    padding-right: 0.35rem;
    text-align: left;
    display: block;
`;

const GeneralErrorMessage = styled.div`
    color: var(--amount-negative);
    background: rgba(220, 53, 69, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    text-align: center;
`;

const SignInButton = styled.button`
    font: inherit;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &::before {
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

const Divider = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1rem 0;
    
    &::before,
    &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
`;

const DividerText = styled.span`
    padding: 0 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

const CustomGoogleButton = styled.button`
    display: flex;
    width: 100%;
    font: inherit;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.9);
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-primary);
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
        border-color: var(--button-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 1);
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    &.google-login-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

const GoogleLogo = styled.img`
    width: 20px;
    height: 20px;
`;

const LoginPrompt = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 1rem 0 0 0;
`;

const LoginLink = styled.span`
    color: var(--button-primary);
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
        text-decoration: underline;
    }
`;

export default LoginModal;
