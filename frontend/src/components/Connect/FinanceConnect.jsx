// Imports.
import React, { useState, useEffect } from 'react';
import { styled, keyframes, css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faCheckCircle, 
    faRocket, 
    faBank, 
    faFileUpload, 
    faEdit,
    faMagic,
    faArrowRight,
    faStar,
    faGem,
    faHandshake,
    faShieldAlt,
    faClock
} from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../styles/colors.css';
import PlaidModal from '../PlaidConnect/PlaidModal';
import FileUploadModal from '../UploadData/FileUploadModal';
import ManualTxModal from '../UploadData/ManualTxModal';
import { uploadCSV } from '../../services/api';

// -------------------------------------------------------- Animations.
const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const bounce = keyframes`
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

// -------------------------------------------------------- FinanceConnect Component.
const FinanceConnect = ({ onBack, onComplete, user }) => {
    // Modal States.
    const [activeModal, setActiveModal] = useState(null);
    const [hasData, setHasData] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState(null);
    
    // Progress tracking
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [plaidSuccess, setPlaidSuccess] = useState(false);
    const [manualSuccess, setManualSuccess] = useState(false);

    // Interactive states
    const [hoveredMethod, setHoveredMethod] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

    // -------------------------------------------------------- Welcome Animation Effect.
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcomeAnimation(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // -------------------------------------------------------- Handle CSV Upload.
    const handleCSVUpload = async (formData) => {
        setIsLoading(true);
        try {
            const response = await uploadCSV(formData);
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Upload Success.
    const handleUploadSuccess = (result) => {
        console.log('Upload successful:', result);
        setUploadSuccess(true);
        setHasData(true);
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    // -------------------------------------------------------- Handle Plaid Success.
    const handlePlaidSuccess = () => {
        setPlaidSuccess(true);
        setHasData(true);
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    // -------------------------------------------------------- Handle Manual Transaction Success.
    const handleManualSuccess = () => {
        setManualSuccess(true);
        setHasData(true);
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    // -------------------------------------------------------- Close Modal & Clear States.
    const closeModal = () => {
        setActiveModal(null);
    };

    // -------------------------------------------------------- Handle Method Selection.
    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setActiveModal(method);
    };

    // -------------------------------------------------------- Skip Setup.
    const handleSkip = () => {
        onComplete();
    };

    // -------------------------------------------------------- Handle Back Navigation.
    const handleBack = () => {
        onBack();
    };

    return (
        <>
            <ConnectContainer>
                {/* Header */}
                <Header>
                    <BackButton onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Home
                    </BackButton>
                    <HeaderContent>
                        <WelcomeMessage $animated={showWelcomeAnimation}>
                            Welcome, {user?.first_name || 'there'}! 🎉
                            {showWelcomeAnimation && <SparkleIcon icon={faGem} />}
                        </WelcomeMessage>
                        <HeaderTitle>Let's Connect Your Finances</HeaderTitle>
                        <HeaderSubtitle>
                            Choose how you'd like to get started with Centi.
                        </HeaderSubtitle>
                        
                        {/* Interactive Progress Indicator */}
                        <ProgressIndicator>
                            <ProgressStep $active={true}>
                                <ProgressDot $completed={true}>
                                    <FontAwesomeIcon icon={faHandshake} />
                                </ProgressDot>
                                <ProgressLabel>Welcome</ProgressLabel>
                            </ProgressStep>
                            <ProgressLine />
                            <ProgressStep $active={false}>
                                <ProgressDot $completed={false}>
                                    <FontAwesomeIcon icon={faBank} />
                                </ProgressDot>
                                <ProgressLabel>Connect</ProgressLabel>
                            </ProgressStep>
                            <ProgressLine />
                            <ProgressStep $active={false}>
                                <ProgressDot $completed={false}>
                                    <FontAwesomeIcon icon={faRocket} />
                                </ProgressDot>
                                <ProgressLabel>Launch</ProgressLabel>
                            </ProgressStep>
                        </ProgressIndicator>
                    </HeaderContent>
                </Header>

                {/* Main Content */}
                <MainContent>
                    {/* Method Selection */}
                    <MethodSection>
                        <SectionTitle>
                            Choose Your Connection Method
                            <SectionSubtitle>Pick the option that works best for you</SectionSubtitle>
                        </SectionTitle>
                        <MethodGrid>
                            {/* Plaid Connect - Recommended */}
                            <MethodCard 
                                $recommended={true}
                                $hovered={hoveredMethod === 'plaid'}
                                onClick={() => handleMethodSelect('plaid')}
                                onMouseEnter={() => setHoveredMethod('plaid')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            >
                                <MethodHeader>
                                    <MethodIcon $color="#00d4aa" $animated={hoveredMethod === 'plaid'}>
                                        <FontAwesomeIcon icon={faBank} />
                                    </MethodIcon>
                                    <RecommendedBadge>
                                        <FontAwesomeIcon icon={faStar} />
                                        Recommended
                                    </RecommendedBadge>
                                </MethodHeader>
                                <CardTitle>Connect Bank Account</CardTitle>
                                <MethodDescription>
                                    Securely link your bank accounts with Plaid. Get real-time transactions, 
                                    automatic categorization, and instant balance updates.
                                </MethodDescription>
                                <MethodFeatures>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Real-time sync</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faShieldAlt} />
                                        <span>Bank-level security</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faMagic} />
                                        <span>Auto categorization</span>
                                    </FeatureItem>
                                </MethodFeatures>
                                <MethodButton $hovered={hoveredMethod === 'plaid'}>
                                    Connect Bank
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </MethodButton>
                            </MethodCard>

                            {/* File Upload */}
                            <MethodCard 
                                $hovered={hoveredMethod === 'upload'}
                                onClick={() => handleMethodSelect('upload')}
                                onMouseEnter={() => setHoveredMethod('upload')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            >
                                <MethodHeader>
                                    <MethodIcon $color="#007bff" $animated={hoveredMethod === 'upload'}>
                                        <FontAwesomeIcon icon={faFileUpload} />
                                    </MethodIcon>
                                </MethodHeader>
                                <CardTitle>Upload CSV File</CardTitle>
                                <MethodDescription>
                                    Import your transaction history from CSV files. Perfect for historical data 
                                    or if you prefer manual control over your data.
                                </MethodDescription>
                                <MethodFeatures>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Bulk import</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>Historical data</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faEdit} />
                                        <span>Full control</span>
                                    </FeatureItem>
                                </MethodFeatures>
                                <MethodButton $hovered={hoveredMethod === 'upload'}>
                                    Upload File
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </MethodButton>
                            </MethodCard>

                            {/* Manual Entry */}
                            <MethodCard 
                                $hovered={hoveredMethod === 'manual'}
                                onClick={() => handleMethodSelect('manual')}
                                onMouseEnter={() => setHoveredMethod('manual')}
                                onMouseLeave={() => setHoveredMethod(null)}
                            >
                                <MethodHeader>
                                    <MethodIcon $color="#28a745" $animated={hoveredMethod === 'manual'}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </MethodIcon>
                                </MethodHeader>
                                <CardTitle>Manual Entry</CardTitle>
                                <MethodDescription>
                                    Add transactions manually. Great for getting started quickly or 
                                    tracking cash expenses and receipts.
                                </MethodDescription>
                                <MethodFeatures>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faRocket} />
                                        <span>Quick setup</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faEdit} />
                                        <span>Cash tracking</span>
                                    </FeatureItem>
                                    <FeatureItem>
                                        <FontAwesomeIcon icon={faFileUpload} />
                                        <span>Receipt management</span>
                                    </FeatureItem>
                                </MethodFeatures>
                                <MethodButton $hovered={hoveredMethod === 'manual'}>
                                    Start Manual
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </MethodButton>
                            </MethodCard>
                        </MethodGrid>

                        {/* Skip Option */}
                        <SkipSection>
                            <SkipText>Want to explore first?</SkipText>
                            <SkipButton onClick={handleSkip}>
                                Skip for now
                            </SkipButton>
                        </SkipSection>
                    </MethodSection>

                    {/* Success State */}
                    {(uploadSuccess || plaidSuccess || manualSuccess) && (
                        <SuccessOverlay>
                            <SuccessContent>
                                <SuccessIcon>
                                    <FontAwesomeIcon icon={faMagic} />
                                </SuccessIcon>
                                <SuccessTitle>Excellent! 🎉</SuccessTitle>
                                <SuccessMessage>
                                    {uploadSuccess && "Your file has been uploaded successfully!"}
                                    {plaidSuccess && "Your bank account has been connected successfully!"}
                                    {manualSuccess && "Your transaction has been added successfully!"}
                                </SuccessMessage>
                                <SuccessSubtitle>
                                    Redirecting you to your dashboard...
                                </SuccessSubtitle>
                            </SuccessContent>
                        </SuccessOverlay>
                    )}
                </MainContent>
            </ConnectContainer>

            {/* Modals */}
            {activeModal === 'plaid' && (
                <PlaidModal
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={handlePlaidSuccess}
                />
            )}

            {activeModal === 'upload' && (
                <FileUploadModal
                    isOpen={true}
                    onClose={closeModal}
                    onUpload={handleCSVUpload}
                    onSuccess={handleUploadSuccess}
                    existingAccounts={[]}
                />
            )}

            {activeModal === 'manual' && (
                <ManualTxModal
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={handleManualSuccess}
                    existingAccounts={[]}
                />
            )}
        </>
    );
};

// -------------------------------------------------------- Styled Components.

const ConnectContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    color: white;
    padding: 4rem 1rem 0rem 1rem;
    position: relative;
    
    @media (max-width: 768px) {
        padding: 1.5rem 2rem;
    }
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
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);

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
        background: rgba(255, 255, 255, 0.2);
    }
`;

const HeaderContent = styled.div`
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
`;

const WelcomeMessage = styled.div`
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    opacity: 0.9;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    ${props => props.$animated && css`
        animation: ${bounce} 1s ease-in-out;
    `}
`;

const SparkleIcon = styled(FontAwesomeIcon)`
    color: #ffd700;
    animation: ${pulse} 2s infinite;
`;

const HeaderTitle = styled.h1`
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    line-height: 1.2;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const HeaderSubtitle = styled.p`
    font-size: 1.2rem;
    opacity: 0.9;
    line-height: 1.6;
    margin: 0 0 2rem 0;
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const ProgressIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
`;

const ProgressStep = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: ${props => props.$active ? 1 : 0.6};
    transition: all 0.3s ease;
`;

const ProgressDot = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => props.$completed ? 'var(--amount-positive)' : 'rgba(255, 255, 255, 0.3)'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
        transform: scale(1.1);
    }
`;

const ProgressLabel = styled.span`
    font-size: 0.9rem;
    font-weight: 500;
    color: white;
`;

const ProgressLine = styled.div`
    width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
`;

const MainContent = styled.div`
    flex: 1;
    padding: 2rem 4rem 4rem 4rem;
    position: relative;
    
    @media (max-width: 768px) {
        padding: 2rem;
    }
`;

const MethodSection = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const SectionTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 0.5rem 0;
    color: white;
`;

const SectionSubtitle = styled.div`
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 3rem;
`;

const MethodGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
`;

const MethodCard = styled.div`
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 2px solid ${props => props.$recommended ? 'var(--amount-positive)' : 'transparent'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    }
    
    ${props => props.$hovered && css`
        transform: translateY(-8px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        border-color: ${props.$recommended ? 'var(--amount-positive)' : 'var(--button-primary)'};
    `}
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;

const MethodHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
`;

const MethodIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    ${props => props.$animated && css`
        animation: ${float} 2s ease-in-out infinite;
    `}
`;

const RecommendedBadge = styled.div`
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    position: relative;
    top: -20px;
    left: 20px;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    animation: ${pulse} 2s infinite;
`;

const CardTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
`;

const MethodDescription = styled.p`
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
`;

const MethodFeatures = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    
    &:hover {
        color: var(--amount-positive);
        transform: translateX(5px);
    }
    
    svg {
        color: var(--amount-positive);
        font-size: 0.8rem;
    }
`;

const MethodButton = styled.div`
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    ${props => props.$hovered && css`
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
    `}
    
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
`;

const SkipSection = styled.div`
    text-align: center;
    padding: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 2rem;
`;

const SkipText = styled.p`
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 1rem 0;
    font-size: 1rem;
`;

const SkipButton = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;

const SuccessOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SuccessContent = styled.div`
    background: white;
    border-radius: 24px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    animation: ${slideUp} 0.4s ease-out;
`;

const SuccessIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--amount-positive), #00b894);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
    color: white;
    font-size: 2rem;
    animation: ${pulse} 2s infinite;
`;

const SuccessTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
`;

const SuccessMessage = styled.p`
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 1rem 0;
    line-height: 1.6;
`;

const SuccessSubtitle = styled.p`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
`;

export default FinanceConnect;
