// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import PlaidLink from './PlaidLink';

// ------------------------------------------------------------------------------------------------ PlaidModal Component.
const PlaidModal = ({ isOpen, onClose, onSuccess }) => {
    // Plaid States.
    const [plaidSuccess, setPlaidSuccess] = useState('');   // State 4 Plaid Success.
    const [plaidError, setPlaidError] = useState('');       // State 4 Plaid Error.

    // -------------------------------------------------------- Handle Plaid Success & Clear Error State.
    const handlePlaidSuccess = (data) => {
        if (data.isProcessing) {
            // Bank Connected But Transactions Still Processing.
            setPlaidSuccess(`✅ ${data.institution.name} connected successfully! 
                           Transaction data is still being processed and will be available shortly.`);
        } else {
            // Normal Success With Transaction Count.
            const attemptText = data.attempts > 1 ? ` (took ${data.attempts} attempts)` : '';
            setPlaidSuccess(`✅ Successfully connected ${data.institution.name} and imported ${data.transactionCount} transactions!${attemptText}`);
        }
        
        // Set Plaid Error State To Empty String.
        setPlaidError('');
        
        // Set Timeout To Call OnSuccess Callback & Close Modal.
        setTimeout(() => {
            // Call OnSuccess Callback.
            onSuccess();
            // Close The Modal.
            onClose();
        }, 3000); // Give user time to read the message
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

    if (!isOpen) return null;

    return (
        <Modal onClick={handleClose}>
            <PlaidModalContent onClick={e => e.stopPropagation()}>
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
                    <CloseButton onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </PlaidModalHeader>
                
                <PlaidModalBody>
                    {plaidSuccess && (
                        <SuccessMessage>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {plaidSuccess}
                        </SuccessMessage>
                    )}
                    
                    {plaidError && (
                        <ErrorMessage>
                            {plaidError}
                        </ErrorMessage>
                    )}

                    {!plaidSuccess && !plaidError && (
                        <>
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

                            <BenefitsSection>
                                <BenefitsTitle>What You'll Get:</BenefitsTitle>
                                <BenefitsList>
                                    <BenefitItem>📊 Automatic transaction categorization</BenefitItem>
                                    <BenefitItem>⚡ Real-time balance updates</BenefitItem>
                                    <BenefitItem>📈 Detailed spending insights</BenefitItem>
                                    <BenefitItem>⏰ Save hours of manual entry</BenefitItem>
                                </BenefitsList>
                            </BenefitsSection>

                            <PlaidButtonSection>
                                <PlaidLink 
                                    onSuccess={handlePlaidSuccess}
                                    onError={handlePlaidError}
                                />
                                <DisclaimerText>
                                    By connecting your account, you agree to our secure data handling practices. 
                                    You can disconnect at any time.
                                </DisclaimerText>
                            </PlaidButtonSection>
                        </>
                    )}
                </PlaidModalBody>
            </PlaidModalContent>
        </Modal>
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
    background: white;
    border-radius: 24px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */

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
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #f8fbff, #ffffff);
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
    background: linear-gradient(135deg, #00d4aa, #00b894);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: white;
    font-size: 2rem;
    box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
`;
// -------------------------------------------------------- Plaid Modal Title.
const PlaidModalTitle = styled.h2`
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
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
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        color: #333;
    }
`;
// -------------------------------------------------------- Success Message.
const SuccessMessage = styled.div`
    background: linear-gradient(135deg, #d1e7dd, #badbcc);
    border: 1px solid #badbcc;
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
        color: #198754;
    }
`;
// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    text-align: center;
`;
// -------------------------------------------------------- Security Section.
const SecuritySection = styled.div`
    background: linear-gradient(135deg, #f8fff9, #ffffff);
    border: 1px solid #e8f5e8;
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
    background: #28a745;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
`;
const SecurityText = styled.p`
    margin: 0;
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
`;
// -------------------------------------------------------- Benefits Section.
const BenefitsSection = styled.div`
    background: linear-gradient(135deg, #fff8f0, #ffffff);
    border: 1px solid #ffeaa7;
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
    background: linear-gradient(135deg, #f0f8ff, #ffffff);
    border-radius: 16px;
    border: 1px solid #e3f2fd;
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

export default PlaidModal;
