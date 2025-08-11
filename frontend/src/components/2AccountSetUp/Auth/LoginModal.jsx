// LoginModal.jsx
//
// This is the modal that the user will see when they click the "Sign In" button in the WelcomeScreen.
// 
// The user will see a modal with a form to enter their email address and password or they can sign in with Google.
// The form will validate their inputs, and if they are valid allow them to sign in, If the user's information is 
// correct, they will be redirected to the dashboard. If the user's information is incorrect, they will see an error
// message. There is allow an option for Forgot Password, which will redirect them to the ForgotPasswordModal. Also,
// there is an option to sign up, which will redirect them to the SignUpModal.

// Imports.
import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';

// Local Imports.
import '../../../styles/colors.css';                                // Styling 4 JS.
import googleLogo from '../../../images/googleLogo.png';            // Google Logo Used In Google Button.
import colorScheme from '../../../images/colorSchemeIcon.png';      // Centi Logo Used In Modal.

// API Imports.
import { loginUser, googleAuthCode, getFiles, getAccounts, getTransactions } from '../../../services/api';

// -------------------------------------------------------- LoginModal Component.
const LoginModal = ({ onLoginSuccess, onShowSignUp, onShowForgotPassword }) => {
    
    // -------------------------------------------------------- State Declarations.

    const [errors, setErrors] = useState({});                               // State 4 Errors.
    const [isLoading, setIsLoading] = useState(false);                      // State 4 Loading.
    const [successStates, setSuccessStates] = useState({});                 // State 4 Success States.
    const [showPassword, setShowPassword] = useState(false);                // State 4 Show Password.
    const [formData, setFormData] = useState({email: '', password: ''});    // State 4 Form Data.

    // -------------------------------------------------------- Validation Functions.
    const validateEmail = (value) => {
        // If Email Is Empty, Return Error.
        if (!value.trim()) return 'Email is required';

        // If Email Is Invalid, Return Error. (Must Be In Format: 'user@example.com')
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address (e.g., user@example.com)';
        }

        // If Email Is Valid, Return Empty String.
        return '';
    };
    const validatePassword = (value) => {
        // If Password Is Empty, Return Error.
        if (!value) return 'Password is required.';

        // If Password Is Valid, Return Empty String.
        return '';
    };

    // -------------------------------------------------------- Handle Input Changes With Validation.
    const handleInputChange = (e) => {
        // Get Name & Value From Input.
        const { name, value } = e.target;

        // Update Form Data. (Prev State + New Value)
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-Time Validation.
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
        
        // Update Errors. (Prev State + New Error)
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
        
        // Update Success States. (Prev State + New Success State)
        setSuccessStates(prev => ({
            ...prev,
            [name]: !errorMessage && value.trim() !== ''
        }));
    };

    // -------------------------------------------------------- Handle Form Submission.
    const handleSubmit = async (e) => {
        // Prevent Default Form Submission.
        e.preventDefault();

        // Set Loading State To True.
        setIsLoading(true);

        // Comprehensive Validation.
        const newErrors = {};
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);

        // Remove Empty Error Messages.
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );

        // If There Are Errors, Set Errors & Loading State To False.
        if (Object.keys(filteredErrors).length > 0) {
            setErrors(filteredErrors);
            setIsLoading(false);
            return;
        }

        // Call The Login API.
        try {
            // Create Credentials Object.
            const credentials = {
                email: formData.email,
                password: formData.password
            };
            
            // Call The Login API.
            const response = await loginUser(credentials);
            
            // Store User Data In Local Storage. (Cookies Handle The Token Automatically)
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Check if user has data before redirecting
            const hasData = await checkUserHasData();
            
            // Call OnLoginSuccess Callback with data status
            onLoginSuccess(hasData);
        } catch (error) {
            // Log Login Failure.
            console.error('Login failed:', error);

            // If There Are Errors, Set Errors.
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else {
                setErrors({ general: 'Login failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Check If User Has Data.
    const checkUserHasData = async () => {
        try {
            console.log('LoginModal: Checking if user has data...');
            
            // Check for files, accounts, and transactions
            const [filesResponse, accountsResponse, transactionsResponse] = await Promise.allSettled([
                getFiles(),
                getAccounts(),
                getTransactions()
            ]);
            
            // User has data if any of these endpoints return data
            const hasFiles = filesResponse.status === 'fulfilled' && filesResponse.value?.data?.length > 0;
            const hasAccounts = accountsResponse.status === 'fulfilled' && accountsResponse.value?.data?.length > 0;
            const hasTransactions = transactionsResponse.status === 'fulfilled' && transactionsResponse.value?.data?.length > 0;
            
            const hasData = hasFiles || hasAccounts || hasTransactions;
            
            console.log('LoginModal: Data check results:', { hasFiles, hasAccounts, hasTransactions, hasData });
            
            // Store the data status in localStorage for future reference
            localStorage.setItem('userHasData', JSON.stringify(hasData));
            
            return hasData;
        } catch (error) {
            console.error('LoginModal: Error checking user data:', error);
            // Default to false if there's an error
            localStorage.setItem('userHasData', 'false');
            return false;
        }
    };

    // -------------------------------------------------------- Handle Google Sign In.
    const handleGoogleSuccess = async (response) => {
        try {
            setIsLoading(true);
            
            // For Auth-Code Flow, We Send The Authorization Code To The Backend.
            // The Backend Will Exchange It For Tokens And User Info.
            const authData = {
                code: response.code,
                redirect_uri: window.location.origin
            };
            
            // Send Authorization Code To Backend For Authentication/Registration.
            const authResponse = await googleAuthCode(authData);
            const authResult = authResponse.data;
            
            // Store User Data In Local Storage. (Cookies Handle The Token Automatically)
            localStorage.setItem('user', JSON.stringify(authResult.user));
            
            // Check if user has data before redirecting
            const hasData = await checkUserHasData();
            
            // Call OnLoginSuccess Callback with data status
            onLoginSuccess(hasData);
            
        } catch (error) {
            // Log Google Authentication Failure.
            console.error('Google authentication failed:', error);

            // If There Are Errors, Set Errors.
            if (error.response?.status === 409) {
                // Account Already Exists With Password - Show Specific Message.
                setErrors({ 
                    general: 'This email is already registered with a password. Please sign in with your password instead.' 
                });
            } else if (error.response?.status === 401) {
                // Unauthorized - Could Be Verification Error Or Other Auth Issues.
                setErrors({ 
                    general: error.response.data.detail || 'Authentication failed. Please check your credentials and try again.'
                });
            } else if (error.response?.status === 500) {
                // Server Error - Likely Account Conflict.
                setErrors({ 
                    general: 'This email is already registered. Please sign in with your password instead.'
                });
            } else if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error.message && error.message.includes('Failed to process Google authentication')) {
                setErrors({ 
                    general: 'This email is already registered with a password. Please sign in with your password instead.'
                });
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
            // Log Google Sign In Failure.
            console.error('Google Sign In Failed');

            // Set Errors.
            setErrors({ general: 'Google sign in failed. Please try again.' });
        },
        flow: 'auth-code',
        scope: 'openid email profile',
        ux_mode: 'popup',
    });

    // -------------------------------------------------------- Custom Google Login With Centered Popup.
    const handleCustomGoogleLogin = () => {
        // Add A Visual Indicator That Popup Is Opening.
        const button = document.querySelector('.google-login-button');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Use The Google Login Function.
        googleLogin();
    };

    // -------------------------------------------------------- Google One Tap Login.
    useGoogleOneTapLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            // Log Google One Tap Login Failure.
            console.error('Google One Tap Login Failed');
        },
        disabled: false, // Enable One Tap.
        auto_select: false, // Don't Auto-Select, Let User Choose.
        cancel_on_tap_outside: true, // Close When Clicking Outside.
        prompt_parent_id: 'google-one-tap-container' // Optional: Specify Container.
    });

    return (
        <>
            {/* Google One Tap Container. */}
            <div id="google-one-tap-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }} />
            
            <ModalContainer>
            <FormContainer>
                {/* Logo. */}
                <LogoContainer>
                    <Logo src={colorScheme} alt="Centi Logo" />
                </LogoContainer>
                
                {/* Title. */}
                <FormTitle>Welcome Back</FormTitle>

                {/* Subtitle. */}
                <FormSubtitle>Sign in to continue managing your finances</FormSubtitle>
                
                {/* Form. */}
                <StyledForm onSubmit={handleSubmit}>
                    {/* Form Group. */}
                    <FormGroup>
                        {/* Label, "Email Address *" */}
                        <Label htmlFor="email">Email Address <span>*</span></Label>
                        <InputWrapper $hasError={!!errors.email} $isSuccess={!!successStates.email}>
                            {/* Input. */}
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                $hasError={!!errors.email}
                            />

                            {/* Success Checkmark. */}
                            {successStates.email && <SuccessCheckmark />}
                        </InputWrapper>

                        {/* Error Message. */}
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </FormGroup>
                    
                    {/* Form Group. */}
                    <FormGroup>
                        {/* Label, "Password *" */}
                        <Label htmlFor="password">Password <span>*</span></Label>
                        <InputWrapper $hasError={!!errors.password} $isSuccess={!!successStates.password}>
                            {/* Input. */}
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                $hasError={!!errors.password}
                                autoComplete="current-password"
                            />

                            {/* Password Toggle. */}
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                $hasSuccess={!!successStates.password}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </PasswordToggle>

                            {/* Success Checkmark. */}
                            {successStates.password && <SuccessCheckmark />}
                        </InputWrapper>

                        {/* Error Message. */}
                        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

                        {/* Forgot Password Link. */}
                        <ForgotPasswordLink onClick={onShowForgotPassword}>
                            Forgot Password?
                        </ForgotPasswordLink>
                    </FormGroup>
                    
                    {/* General Error Message. */}
                    {errors.general && (
                        <GeneralErrorMessage $hasPulse={errors.showLoginLink}>
                            {errors.general}
                            {errors.showLoginLink && (
                                <LoginLinkInError onClick={onShowSignUp}>
                                    Switch to Sign Up
                                </LoginLinkInError>
                            )}
                        </GeneralErrorMessage>
                    )}
                    
                    {/* Sign In Button. */}
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
                
                {/* Divider. */}
                <Divider>
                    <DividerText>or</DividerText>
                </Divider>
                
                {/* Custom Google Button. */}
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

                {/* Google Info Text. */}
                <GoogleInfoText>
                    New Users Only • Existing Accounts Should Use Password Login
                </GoogleInfoText>
                <Divider />

                {/* Login Prompt. */}
                <LoginPrompt>
                    Don't have an account? <LoginLink onClick={onShowSignUp}>Sign up</LoginLink>
                </LoginPrompt>
            </FormContainer>
            </ModalContainer>
        </>
    );
};

// -------------------------------------------------------- Entire Modal Container (Outer Container).
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

// -------------------------------------------------------- Form Container (Inner Container).
const FormContainer = styled.div`
    width: 100%;
`;

// -------------------------------------------------------- Logo Container.
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

// -------------------------------------------------------- Form Title ("Welcome Back").
const FormTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    text-align: center;
`;

// -------------------------------------------------------- Form Subtitle ("Sign in to ...").
const FormSubtitle = styled.p`
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
`;

// -------------------------------------------------------- Styled Input Form ("Email Address", "Password").
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Form Group (Label & Input Form).
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.325rem;
`;

// -------------------------------------------------------- Label (Small Font Above Input Form).
const Label = styled.label`
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;

    span {
        color: var(--amount-negative);
        font-weight: 600;
    }
`;

// -------------------------------------------------------- Input Form.
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

// -------------------------------------------------------- Success Checkmark. (If Email/Password Is Valid)
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
    animation: ${props => props.$hasPulse ? 'pulse 2s infinite' : 'none'};
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
`;

// -------------------------------------------------------- Sign In Button.
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
    margin: 1rem 0;
    
    &::before,
    &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
`;

// -------------------------------------------------------- Divider Text.
const DividerText = styled.span`
    padding: 0 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

// -------------------------------------------------------- Custom Google Button.
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

// -------------------------------------------------------- Google Logo.
const GoogleLogo = styled.img`
    width: 20px;
    height: 20px;
`;

// -------------------------------------------------------- Login Prompt.
const LoginPrompt = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    padding: 0 0 0.25rem 0;
    margin: 1rem 0 0 0;
`;

// -------------------------------------------------------- Login Link.
const LoginLink = styled.span`
    color: var(--button-primary);
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
        text-decoration: underline;
    }
`;

// -------------------------------------------------------- Google Info Text.
const GoogleInfoText = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.8;
`;

// -------------------------------------------------------- Login Link In Error.
const LoginLinkInError = styled.button`
    background: none;
    border: none;
    color: var(--button-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 123, 255, 0.1);
        text-decoration: none;
    }
`;

// -------------------------------------------------------- Forgot Password Link.
const ForgotPasswordLink = styled.div`
    font: inherit;
    font-decoration: none;
    background: none;
    border: none;
    color: var(--button-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-align: right;
    width: max-content;
    justify-self: flex-end;
    align-self: flex-end;
    
    &:hover {
        text-decoration: underline;
        scale: 1.05;
    }
`;

// -------------------------------------------------------- Export LoginModal Component.
export default LoginModal;