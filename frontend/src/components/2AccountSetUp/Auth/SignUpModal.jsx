// SignUpModal.jsx
//
// This is the modal that the user will see when they click the "Sign Up" button in the WelcomeScreen.
// 
// The user will see a modal with a form to enter their first name, last name, email address, password, and confirm 
// password. The form will validate their inputs, and if they are valid allow them to sign up, If the user's infor-
// mation is correct, they will be redirected to the dashboard. If the user's information is incorrect, they will 
// see an error message. There is an option to sign up / in with Google as well, and at the very bottom there is an
// option to sign in which will redirect them to the LoginModal. 

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faX } from '@fortawesome/free-solid-svg-icons';


// Local Imports.
import '../../../styles/colors.css';
import colorScheme from '../../../images/colorSchemeIcon.png';
import googleLogo from '../../../images/googleLogo.png';
import { registerUser, googleAuthCode } from '../../../services/api';

// -------------------------------------------------------- SignUpModal Component.
const SignUpModal = ({ onSignUpSuccess, onShowLogin }) => {

    // -------------------------------------------------------- State Declarations.
    
    const [errors, setErrors] = useState({});                                   // State 4 Errors.
    const [isLoading, setIsLoading] = useState(false);                          // State 4 Loading.
    const [successStates, setSuccessStates] = useState({});                     // State 4 Success States.
    const [showPassword, setShowPassword] = useState(false);                    // State 4 Whether Password Is Being Shown.
    const [passwordFocused, setPasswordFocused] = useState(false);              // State 4 Whether Password Is Focused.
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);      // State 4 Whether Confirm Password Is Being Shown.
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false); // State 4 Whether Confirm Password Is Focused.
    const [passwordRequirementsShown, setPasswordRequirementsShown] = useState(false); // State 4 Whether Password Requirements Are Shown.
    const [confirmPasswordRequirementsShown, setConfirmPasswordRequirementsShown] = useState(false); // State 4 Whether Confirm Password Requirements Are Shown.
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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
    const validateFirstName = (value) => {
        if (!value.trim()) return 'First name is required';
        return '';
    };
    const validateLastName = (value) => {
        if (!value.trim()) return 'Last name is required';
        return '';
    };
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
        if (value.length < 10) return 'Password must be at least 10 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character (@$!%*?&)';
        return '';
    };
    const validateConfirmPassword = (value, password = formData.password) => {
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
    };

    // -------------------------------------------------------- Handle Input Changes with Validation.
    const handleInputChange = (e) => {
        // Get Name & Value From Input.
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-Time Validation.
        let errorMessage = '';
        switch (name) {
            case 'firstName':
                errorMessage = validateFirstName(value);
                break;
            case 'lastName':
                errorMessage = validateLastName(value);
                break;
            case 'email':
                errorMessage = validateEmail(value);
                break;
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
        // Prevent Default Form Submission.
        e.preventDefault();
        setIsLoading(true);
        
        // Comprehensive Validation (First Name, Last Name, Email, Password, Confirm Password).
        const newErrors = {};
        newErrors.firstName = validateFirstName(formData.firstName);
        newErrors.lastName = validateLastName(formData.lastName);
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);
        newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);

        // Remove Empty Error Messages (If There Are Any).
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );

        // If There Are Any Errors, Set Errors And Return.
        if (Object.keys(filteredErrors).length > 0) {
            setErrors(filteredErrors);
            setIsLoading(false);
            return;
        }

        // Call Registration API (Create User Data Object).
        try {
            console.log('SignUpModal: Form submitted successfully, calling registration API...');
            
            const userData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password
            };
            
            const response = await registerUser(userData);
            console.log('SignUpModal: Registration successful:', response.data);
            
            // Store User Data In Local Storage (Cookies Handle The Token Automatically).
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Call onSignUpSuccess Callback With Email.
            onSignUpSuccess(formData.email);
        } catch (error) {
            console.error('Sign Up Failed:', error);
            if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else {
                setErrors({ general: 'Sign up failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Google Sign In (Google Auth Code Flow).
    const handleGoogleSuccess = async (response) => {
        try {
            setIsLoading(true);
            console.log('Google Sign In Success:', response);
            
            // For Auth-Code Flow, We Send The Authorization Code To The Backend.
            // The Backend Will Exchange It For Tokens And User Info.
            const authData = {
                code: response.code,
                redirect_uri: window.location.origin
            };
            
            console.log('Sending Authorization Code To Backend:', authData);
            
            // Send Authorization Code To Backend For Authentication/Registration.
            const authResponse = await googleAuthCode(authData);
            const authResult = authResponse.data;
            console.log('Backend Google auth response:', authResult);
            
            // Store User Data In Local Storage (Cookies Handle The Token Automatically).
            localStorage.setItem('user', JSON.stringify(authResult.user));
            
            // Call onSignUpSuccess Callback.
            onSignUpSuccess();
            
        } catch (error) {
            console.error('Google authentication failed:', error);
            if (error.response?.status === 409) {
                // Account Already Exists With Password - Show Specific Message.
                setErrors({ 
                    general: 'This email is already registered with a password. Please sign in with your password instead.',
                    showLoginLink: true
                });
            } else if (error.response?.status === 401) {
                // Unauthorized - Could Be Verification Error Or Other Auth Issues.
                setErrors({ 
                    general: error.response.data.detail || 'Authentication failed. Please check your credentials and try again.',
                    showLoginLink: true
                });
            } else if (error.response?.status === 500) {
                // Server Error - Likely Account Conflict.
                setErrors({ 
                    general: 'This email is already registered. Please sign in with your password instead.',
                    showLoginLink: true
                });
            } else if (error.response?.data?.detail) {
                setErrors({ general: error.response.data.detail });
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error.message && error.message.includes('Failed To Process Google Authentication')) {
                setErrors({ 
                    general: 'This email is already registered with a password. Please sign in with your password instead.',
                    showLoginLink: true
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

    // -------------------------------------------------------- Google Login Hook (Google Auth Code Flow).
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            console.error('Google Sign In Failed');
            setErrors({ general: 'Google sign in failed. Please try again.' });
        },
        flow: 'auth-code',
        scope: 'openid email profile',
        ux_mode: 'popup',
        redirect_uri: window.location.origin
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
            console.error('Google One Tap Login Failed');
            // Don't Show Error For One Tap As It's Optional.
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
                <FormTitle>Create Your Account</FormTitle>

                {/* Subtitle. */}
                <FormSubtitle>Join thousands of users taking control of their finances</FormSubtitle>
                
                {/* Form. */}
                <StyledForm onSubmit={handleSubmit}>
                    {/* Form Row. */}
                    <FormRow>
                        {/* First Name Form Group. */}
                        <FormGroup>
                            {/* Label, "First Name *" */}
                            <Label htmlFor="firstName">First Name <span>*</span></Label>
                            <InputWrapper $hasError={!!errors.firstName} $isSuccess={!!successStates.firstName}> 
                                {/* Input. */}
                                <Input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your first name"
                                    $hasError={!!errors.firstName}
                                />

                                {/* Success Checkmark. */}
                                {successStates.firstName && <SuccessCheckmark />}
                            </InputWrapper>

                            {/* Error Message. */}
                            {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                        </FormGroup>
                        
                        {/* Last Name Form Group. */}
                        <FormGroup>
                            {/* Label, "Last Name *" */}
                            <Label htmlFor="lastName">Last Name <span>*</span></Label>
                            <InputWrapper $hasError={!!errors.lastName} $isSuccess={!!successStates.lastName}> 
                                {/* Input. */}
                                <Input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your last name"
                                    $hasError={!!errors.lastName}
                                />

                                {/* Success Checkmark. */}
                                {successStates.lastName && <SuccessCheckmark />}
                            </InputWrapper>

                            {/* Error Message. */}
                            {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                        </FormGroup>
                    </FormRow>
                    
                    {/* Email Form Group. */}
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
                            {successStates.email && <SuccessCheckmark />}
                        </InputWrapper>
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </FormGroup>
                    
                    {/* Password Form Group. */}
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
                                onFocus={() => {
                                    setPasswordFocused(true);
                                    setPasswordRequirementsShown(true);
                                }}
                                placeholder="Create a password"
                                $hasError={!!errors.password}
                                autoComplete="new-password"
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
                        
                        {/* Password Requirements (If Password Is Focused). */}
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
                    
                    {/* Confirm Password Form Group. */}
                    <FormGroup>
                        {/* Label, "Confirm Password *" */}
                        <Label htmlFor="confirmPassword">Confirm Password <span>*</span></Label>
                        <InputWrapper $hasError={!!errors.confirmPassword} $isSuccess={!!successStates.confirmPassword}>
                            {/* Input. */}
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
                                placeholder="Confirm your password"
                                $hasError={!!errors.confirmPassword}
                                autoComplete="new-password"
                            />

                            {/* Confirm Password Toggle. */}
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                $hasSuccess={!!successStates.confirmPassword}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </PasswordToggle>

                            {/* Success Checkmark. */}
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
                        <GeneralErrorMessage $hasPulse={errors.showLoginLink}>
                            {errors.general}
                        </GeneralErrorMessage>
                    )}
                    
                    {/* Sign Up Button. */}
                    <SignUpButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </SignUpButton>
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
                    Already have an account? <LoginLink onClick={onShowLogin}>Sign in</LoginLink>
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

// -------------------------------------------------------- Form Container.
const FormContainer = styled.div`
    width: 100%;
`;

// -------------------------------------------------------- Logo Container.
const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

// -------------------------------------------------------- Logo.
const Logo = styled.img`
    height: 80px;
    width: auto;
    border-radius: 8px;
`;

// -------------------------------------------------------- Form Title.
const FormTitle = styled.h2`
    font-size: 2rem;
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
`;

// -------------------------------------------------------- Styled Form.
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Form Row.
const FormRow = styled.div`
    display: grid;
    max-width: 100%;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
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
    width: 100%;
    flex: 1;
    
    &:focus {
        outline: none;
    }
    
    &::placeholder {
        color: var(--text-secondary);
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

// -------------------------------------------------------- Sign Up Button.
const SignUpButton = styled.button`
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
    margin: 1rem 0 0 0;
    padding: 0 0 0.25rem 0;
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

export default SignUpModal;
