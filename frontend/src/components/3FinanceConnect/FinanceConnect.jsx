// FinanceConnect.jsx

// This is the main component that handles the finance connect process, it will show the user the different ways
// they can connect their finances, and then handle the different methods of connecting. Three options are the 
// Plaid API, CSV Upload, and Manual Entry, we encourage the user to use the Plaid API, but we also want to give
// them the option to upload a CSV file, and manually enter transactions. They can also skip the setup process
// and just explore the site without any data.

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
    faShieldAlt,
    faClock
} from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../styles/colors.css';
import PlaidModal from './Ways2Connect/PlaidConnect/PlaidModal';
import FileUploadModal from './Ways2Connect/UploadConnect/FileUploadModal';
import ManualTxModal from './Ways2Connect/ManualConnect/ManualTxModal';
import { uploadCSV } from '../../services/api';

// ------------------------------------------------------------------------------------------------ Animations.

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
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

// ------------------------------------------------------------------------------------------------ FinanceConnect Component.
const FinanceConnect = ({ onBack, onComplete, user }) => {


    // Modal States.
    const [hasData, setHasData] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    
    // Progress Tracking.
    const [plaidSuccess, setPlaidSuccess] = useState(false);
    const [manualSuccess, setManualSuccess] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Interactive States.
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredMethod, setHoveredMethod] = useState(null);
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
            onComplete(true); // User Actually Has Data.
        }, 2000);
    };

    // -------------------------------------------------------- Handle Plaid Success.
    const handlePlaidSuccess = () => {
        setPlaidSuccess(true);
        setHasData(true);
        setTimeout(() => {
            onComplete(true); // User Actually Has Data.
        }, 2000);
    };

    // -------------------------------------------------------- Handle Manual Transaction Success.
    const handleManualSuccess = () => {
        setManualSuccess(true);
        setHasData(true);
        setTimeout(() => {
            onComplete(true); // User Actually Has Data.
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
        // Don't Set Any LocalStorage Flags When Skipping - Let The User Explore Without Data.
        // This Way They Can Refresh To Get Back To FinanceConnect.
        onComplete(false); // User Skipped, No Actual Data.
    };

    // -------------------------------------------------------- Return The Component.
    return (
        <>
            <ConnectContainer>
                {/* Header */}
                <Header>
                    <BackButton onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back
                    </BackButton>
                    
                    <Hero>
                        <SmallGreeting>
                            Welcome, <UserName><span>{user?.first_name ?? 'friend'}</span></UserName>
                            <WavingHand>👋</WavingHand>
                        </SmallGreeting>
                        
                        <HeroTitle>Ready to connect your finances?</HeroTitle>
                        <HeroSubtitle>Select the connection style that suits you best.</HeroSubtitle>
                    </Hero>
                </Header>

                {/* Main Content */}
                <MainContent>
                    {/* Method Selection */}
                    <MethodSection>
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
                                    Securely link your bank accounts with Plaid. Get real-time transactions 
                                    and automatic categorization.
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
                            <SkipText>Want to explore <Centi>Centi.</Centi> first?</SkipText>
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

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Connect Container.
const ConnectContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    flex-direction: column;
`;

// -------------------------------------------------------- Header Container.
const Header = styled.header`
    padding: 4rem 2.5rem 1rem 2.5rem;
    text-align: center;
    color: #fff;
    position: relative;
    width: 100%;
    
    @media (max-width: 768px) {
        padding: 1.5rem 2rem;
    }
`;

// -------------------------------------------------------- Back Button. (Back To Welcome Page)
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

    
    &:hover {
        transform: translateX(-5px);
        color: rgb(219, 219, 219);
        background: rgba(255, 255, 255, 0.2);
    }
`;

// -------------------------------------------------------- Hero Container.
const Hero = styled.div`
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

// -------------------------------------------------------- Small Greeting. (Hello, [User Name])
const SmallGreeting = styled.div`
    font-size: 2.25rem;
    font-weight: 500;
    opacity: .9;
    animation: ${fadeIn} .8s ease-out;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
`;

// -------------------------------------------------------- User Name. (User's Name)
const UserName = styled.span`
    font-size: 1.25em;
  font-weight: 800;
  background: linear-gradient(135deg, #b6e0fe 20%, #a7ffeb 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
`;

// -------------------------------------------------------- Waving Hand. (👋)
const WavingHand = styled.span`
    display: inline-block;
    animation: wave 2.5s infinite;
    transform-origin: 70% 70%;
    font-size: 2.5rem;
    line-height: 1;
    vertical-align: baseline;
    
    @keyframes wave {
        0% { transform: rotate(0deg); }
        10% { transform: rotate(14deg); }
        20% { transform: rotate(-8deg); }
        30% { transform: rotate(14deg); }
        40% { transform: rotate(-4deg); }
        50% { transform: rotate(10deg); }
        60% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
    }
`;

// -------------------------------------------------------- Hero Title. (Welcome To Centi!)
const HeroTitle = styled.h1`
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.15;
    color: white;
`;

// -------------------------------------------------------- Hero Subtitle. (Select The Connection Style That Suits You Best.)
const HeroSubtitle = styled.h2`
    font-size: 1.7rem;
    font-weight: 500;
    opacity: 0.8;
    animation: ${fadeIn} .8s ease-out;
`;


// -------------------------------------------------------- Main Content Container.
const MainContent = styled.div`
    flex: 1;
    padding: 2rem 4rem 4rem 4rem;
    position: relative;
    
    @media (max-width: 768px) {
        padding: 2rem;
    }
`;

// -------------------------------------------------------- Method Section Container.
const MethodSection = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

// -------------------------------------------------------- Method Grid Container.
const MethodGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
`;

// -------------------------------------------------------- Method Card Container.
const MethodCard = styled.div`
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.07),
        0 10px 15px rgba(0, 0, 0, 0.1),
        0 20px 25px rgba(0, 0, 0, 0.05);
    border: 3px solid ${props => props.$recommended ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 400px;
    backdrop-filter: blur(10px);
    
    &:hover {
        transform: translateY(-8px);
        box-shadow: 
            0 8px 12px rgba(0, 0, 0, 0.12),
            0 20px 30px rgba(0, 0, 0, 0.15),
            0 40px 50px rgba(0, 0, 0, 0.08);
        border-color: rgba(255, 255, 255, 0.9);
    }
    
    ${props => props.$hovered && css`
        transform: translateY(-8px);
        box-shadow: 
            0 8px 12px rgba(0, 0, 0, 0.12),
            0 20px 30px rgba(0, 0, 0, 0.15),
            0 40px 50px rgba(0, 0, 0, 0.08);
        border-color: ${props.$recommended ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'};
    `}
`;

// -------------------------------------------------------- Method Header Container.
const MethodHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
`;

// -------------------------------------------------------- Method Icon Container.
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
`;

// -------------------------------------------------------- Recommended Badge Container (Plaid API).
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
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 4s infinite;
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;

// -------------------------------------------------------- Card Title.
const CardTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
`;

// -------------------------------------------------------- Method Description.
const MethodDescription = styled.p`
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    text-align: justify;
    font-size: 1rem;
`;

// -------------------------------------------------------- Method Features.
const MethodFeatures = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
`;

// -------------------------------------------------------- Feature Item.
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

// -------------------------------------------------------- Method Button.
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
    margin-top: auto;
    
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

// -------------------------------------------------------- Skip Section.
const SkipSection = styled.div`
    text-align: center;
    padding: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 2rem;
`;

// -------------------------------------------------------- Skip Text.
const SkipText = styled.p`
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
`;

// -------------------------------------------------------- Centi.
const Centi = styled.span`
    font-weight: 800;
    font-size: 1.1em;
    background: linear-gradient(135deg, #b6e0fe 20%, #a7ffeb 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
`;

// -------------------------------------------------------- Skip Button.
const SkipButton = styled.button`
    font: inherit;
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

// -------------------------------------------------------- Success Overlay.
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

// -------------------------------------------------------- Success Content.
const SuccessContent = styled.div`
    background: white;
    border-radius: 24px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    animation: ${slideUp} 0.4s ease-out;
`;

// -------------------------------------------------------- Success Icon.
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

// -------------------------------------------------------- Success Title.
const SuccessTitle = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
`;

// -------------------------------------------------------- Success Message.
const SuccessMessage = styled.p`
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 1rem 0;
    line-height: 1.6;
`;

// -------------------------------------------------------- Success Subtitle.
const SuccessSubtitle = styled.p`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
`;

// -------------------------------------------------------- Export FinanceConnect Component.
export default FinanceConnect;
