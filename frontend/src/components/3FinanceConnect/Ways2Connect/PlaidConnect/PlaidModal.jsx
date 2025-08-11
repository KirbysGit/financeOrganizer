// PlaidModal.jsx
//
// This is the component that is used to create the Plaid Modal for the Plaid API.
//
// After being prompt to connect an account, the user will see this modal, it really just provides a background
// of information about the Plaid API and the benefits of connecting an account, and then a button to connect
// the account.

// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import PlaidLink from './PlaidLink';

// ------------------------------------------------------------------------------------------------ PlaidModal Component.
const PlaidModal = ({ isOpen, onClose, onSuccess }) => {
    
    // -------------------------------------------------------- State Declarations.

    const [plaidError, setPlaidError] = useState('');       // State 4 Plaid Error.
    const [plaidSuccess, setPlaidSuccess] = useState('');   // State 4 Plaid Success.

    // -------------------------------------------------------- Handle Plaid Success & Clear Error State.
    const handlePlaidSuccess = (data) => {
        if (data.isProcessing) {
            // Bank Connected But Data Still Processing.
            setPlaidSuccess(`✅ ${data.institution.name} connected successfully! Your account data is still being processed and will be available shortly.`);
        } else {
            // Normal Success With Account Data.
            const attemptText = data.attempts > 1 ? ` (took ${data.attempts} attempts)` : '';
            const accountText = data.accounts?.length > 1 ? `${data.accounts.length} accounts` : 'account';
            setPlaidSuccess(`✅ Successfully connected ${data.institution.name} and imported ${accountText}!${attemptText}`);
        }
        
        // Set Plaid Error State To Empty String.
        setPlaidError('');
        
        // Set Timeout To Call OnSuccess Callback & Close Modal.
        setTimeout(() => {
            // Call OnSuccess Callback.
            onSuccess();
            // Close The Modal.
            onClose();
        }, 3000); // Give User Time To Read The Message.
    };

    // -------------------------------------------------------- Handle Plaid Error & Clear Success State.
    const handlePlaidError = (error) => {
        // Set Plaid Error State To Error Message.
        setPlaidError(error);
        // Set Plaid Success State To Empty String.
        setPlaidSuccess('');
    };

    // -------------------------------------------------------- Handle Close Modal.
    const handleClose = () => {
        setPlaidSuccess('');
        setPlaidError('');
        onClose();
    };

    // -------------------------------------------------------- Render.

    // If Modal Is Not Open, Return Null.
    if (!isOpen) return null;

    // -------------------------------------------------------- Return JSX.
    return createPortal(
        // Modal Container.
        <Modal onClick={handleClose}>
            {/* Plaid Modal Content. */}
            <PlaidModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </CloseButton>

                {/* Plaid Modal Header. */}
                <PlaidModalHeader>
                    <PlaidHeaderContent>
                        <PlaidIcon>
                            <FontAwesomeIcon icon={faBank} />
                        </PlaidIcon>
                        <PlaidModalTitle>Connect Your Bank Account</PlaidModalTitle>
                        <PlaidModalSubtitle>
                            Securely link your account to automatically import transactions
                        </PlaidModalSubtitle>
                    </PlaidHeaderContent>
                </PlaidModalHeader>
                
                {/* Plaid Modal Body. */}
                <PlaidModalBody>
                    {plaidSuccess && (
                        <SuccessMessage>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {plaidSuccess}
                        </SuccessMessage>
                    )}
                    
                    {/* Error Message. */}
                    {plaidError && (
                        <ErrorMessage>
                            {plaidError}
                        </ErrorMessage>
                    )}

                    {/* Success Message. */}
                    {!plaidSuccess && !plaidError && (
                        <>
                            {/* Security Section. */}
                            <SecuritySection>
                                <SecurityTitle>🔒 Your Security is Our Priority</SecurityTitle>
                                <SecurityFeatures>
                                    <SecurityFeature>
                                        <SecurityIcon>✓</SecurityIcon>
                                        <SecurityText>Bank-level 256-bit encryption</SecurityText>
                                    </SecurityFeature>
                                    <SecurityFeature>
                                        <SecurityIcon>✓</SecurityIcon>
                                        <SecurityText>Read-only access to your accounts</SecurityText>
                                    </SecurityFeature>
                                    <SecurityFeature>
                                        <SecurityIcon>✓</SecurityIcon>
                                        <SecurityText>Powered by Plaid - trusted by millions</SecurityText>
                                    </SecurityFeature>
                                </SecurityFeatures>
                            </SecuritySection>

                            {/* Benefits Section. */}
                            <BenefitsSection>
                                <BenefitsTitle>What You'll Get:</BenefitsTitle>
                                <BenefitsList>
                                    <BenefitItem>📊 Automatic transaction categorization</BenefitItem>
                                    <BenefitItem>⚡ Real-time balance updates</BenefitItem>
                                    <BenefitItem>📈 Detailed spending insights</BenefitItem>
                                    <BenefitItem>⏰ Save hours of manual entry</BenefitItem>
                                </BenefitsList>
                            </BenefitsSection>

                            {/* Plaid Button Section. */}
                            <PlaidButtonSection>
                                <PlaidLink 
                                    onSuccess={handlePlaidSuccess}
                                    onError={handlePlaidError}
                                />

                                {/* Disclaimer Text. */}
                                <DisclaimerText>
                                    By connecting your account, you agree to our secure data handling practices. 
                                    You can disconnect at any time.
                                </DisclaimerText>
                            </PlaidButtonSection>
                        </>
                    )}
                </PlaidModalBody>
            </PlaidModalContent>
        </Modal>,
        document.body
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Modal Container.
const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
`;
// -------------------------------------------------------- Plaid Modal Content.
const PlaidModalContent = styled.div`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
    border-radius: 24px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(65, 173, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    animation: modalSlideIn 0.3s ease-out;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    position: relative;
    border: 1px solid rgba(65, 173, 255, 0.1);
    backdrop-filter: blur(10px);

    &::-webkit-scrollbar {
        display: none;  /* Chrome, Safari, Opera */
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;
// -------------------------------------------------------- Plaid Modal Header.
const PlaidModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2.5rem 2.5rem 1.5rem 2.5rem;
    border-bottom: 2px solid rgba(65, 173, 255, 0.2);
    background: linear-gradient(135deg, rgba(65, 173, 255, 0.05), rgba(40, 167, 69, 0.05));
    position: relative;
`;
// -------------------------------------------------------- Plaid Header Content.
const PlaidHeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    text-align: center;
`;
// -------------------------------------------------------- Plaid Icon.
const PlaidIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: white;
    font-size: 2rem;
    box-shadow: 0 8px 24px rgba(65, 173, 255, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(65, 173, 255, 0.4);
    }
`;
// -------------------------------------------------------- Plaid Modal Title.
const PlaidModalTitle = styled.h2`
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
`;
// -------------------------------------------------------- Plaid Modal Subtitle.
const PlaidModalSubtitle = styled.p`
    margin: 0;
    font-size: 1.1rem;
    color: #7f8c8d;
    font-weight: 400;
    line-height: 1.4;
    max-width: 400px;
`;
// -------------------------------------------------------- Plaid Modal Body.
const PlaidModalBody = styled.div`
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    overflow-y: auto;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */

    &::-webkit-scrollbar {
        display: none;  /* Chrome, Safari, Opera */
    }
`;
// -------------------------------------------------------- Close Button.
const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;
    z-index: 1000;

    &:hover {
        opacity: 0.8;
    }
`;
// -------------------------------------------------------- Success Message.
const SuccessMessage = styled.div`
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05));
    border: 2px solid rgba(40, 167, 69, 0.3);
    color: #0f5132;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    text-align: center;
    margin: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    svg {
        color: var(--amount-positive);
    }
`;
// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
    border: 2px solid rgba(220, 53, 69, 0.3);
    color: #721c24;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    text-align: center;
`;
// -------------------------------------------------------- Security Section.
const SecuritySection = styled.div`
    background: linear-gradient(135deg, rgba(65, 173, 255, 0.03), rgba(255, 255, 255, 0.8));
    border: 2px solid rgba(65, 173, 255, 0.15);
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow: hidden;
`;
const SecurityTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;
const SecurityFeatures = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;
const SecurityFeature = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;
const SecurityIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(65, 173, 255, 0.3);
`;
const SecurityText = styled.p`
    margin: 0;
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
`;
// -------------------------------------------------------- Benefits Section.
const BenefitsSection = styled.div`
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.03), rgba(255, 255, 255, 0.8));
    border: 2px solid rgba(40, 167, 69, 0.15);
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow: hidden;
`;
const BenefitsTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: #2c3e50;
`;
const BenefitsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;
const BenefitItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
`;
// -------------------------------------------------------- Plaid Button Section.
const PlaidButtonSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(65, 173, 255, 0.05), rgba(255, 255, 255, 0.9));
    border-radius: 16px;
    border: 2px solid rgba(65, 173, 255, 0.2);
    overflow: hidden;
`;
const DisclaimerText = styled.p`
    text-align: center;
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 400;
    margin: 0;
    line-height: 1.4;
    max-width: 400px;
`;

// -------------------------------------------------------- Export PlaidModal Component.
export default PlaidModal;
