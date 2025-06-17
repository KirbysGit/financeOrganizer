// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faFileUpload, faPlus, faTimes, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../styles/colors.css';
import PlaidLink from './PlaidLink';
import centiLogo from '../images/icon.png';
import { uploadCSV, createTransaction } from '../services/api';

// -------------------------------------------------------- WelcomeScreen Component.
const WelcomeScreen = ({ onSuccess }) => {
    // Modal States.
    const [activeModal, setActiveModal] = useState(null); // 'plaid', 'csv', 'transaction'.
    
    // CSV Upload States.
    const [file, setFile] = useState(null);                 // State 4 File.
    const [notes, setNotes] = useState('');                 // State 4 Notes.
    const [uploading, setUploading] = useState(false);      // State 4 Uploading State.
    const [uploadError, setUploadError] = useState('');     // State 4 Upload Error.
    
    // Transaction States.
    const [transactionData, setTransactionData] = useState({
        date: '',
        vendor: '',
        description: '',
        amount: '',
        type: ''
    });
    const [submitting, setSubmitting] = useState(false);   // State 4 Submitting State.
    
    // Plaid States.
    const [plaidSuccess, setPlaidSuccess] = useState(''); // State 4 Plaid Success.
    const [plaidError, setPlaidError] = useState('');     // State 4 Plaid Error.

    // -------------------------------------------------------- Handle CSV Upload.
    const handleCSVUpload = async () => {
        if (!file) return;
        
        // Create New FormData Obj & Append File & Notes.
        const formData = new FormData(); 
        formData.append('file', file); 
        formData.append('notes', notes); 

        try {
            // Set Uploading State To True.
            setUploading(true);
            // Set Upload Error State To Empty String.
            setUploadError('');
            // Upload The CSV File.
            await uploadCSV(formData);
            // Call OnSuccess Callback.
            onSuccess();
            // Close The Modal.
            closeModal();
        } catch (err) {
            // Set Upload Error State To Error Message.
            const errorMessage = err.response?.data?.detail || 'Upload failed. Please try again.';
            setUploadError(errorMessage);
            // Set Uploading State To False.
        } finally {
            // Set Uploading State To False.
            setUploading(false);
        }
    };

    // -------------------------------------------------------- Handle Manual Transaction Submission.
    const handleTransactionSubmit = async () => {
        // Destructure The Transaction Data.
        const { date, vendor, amount, type } = transactionData;
        
        // Check If All Required Fields Are Filled.
        if (!date || !vendor || !amount || !type) {
            alert("Please fill in all required fields.");
            return;
        }

        // Create New Transaction Object.
        const newTransaction = {
            ...transactionData,
            amount: parseFloat(amount),
            file: "manual"
        };

        try {
            // Set Submitting State To True.
            setSubmitting(true);
            // Create New Transaction.
            await createTransaction(newTransaction);
            // Call OnSuccess Callback.
            onSuccess();
            // Close The Modal.
            closeModal();
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Failed to create transaction. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
            closeModal();
        }, 3000); // Give user time to read the message
    };

    // -------------------------------------------------------- Handle Plaid Error & Clear Success State.
    const handlePlaidError = (error) => {
        // Set Plaid Error State To Error Message.
        setPlaidError(error);
        // Set Plaid Success State To Empty String.
        setPlaidSuccess('');
    };

    // -------------------------------------------------------- Close Modal & Clear States.
    const closeModal = () => {
        // Set Active Modal State To Null.
        setActiveModal(null);
        // Set File State To Null.
        setFile(null);
        // Set Notes State To Empty String.
        setNotes('');
        // Set Upload Error State To Empty String.
        setUploadError('');
        // Set Transaction Data To Empty Object.
        setTransactionData({
            date: '',
            vendor: '',
            description: '',
            amount: '',
            type: ''
        });
        setPlaidSuccess('');
        setPlaidError('');
    };

    // -------------------------------------------------------- Update Transaction Data
    const updateTransactionData = (field, value) => {
        setTransactionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // -------------------------------------------------------- Transaction Type Options.
    const TRANSACTION_TYPE_OPTIONS = {
        sale: "Purchase",
        payment: "Credit Card Payment",
        refund: "Refund / Reimbursement",
        fee: "Service / Late Fee",
        interest: "Interest Charge",
        adjustment: "Account Adjustment",
        transfer: "Transfer",
        other: "Other"
    };

    return (
        <WelcomeContainer>
            <WelcomeHeader>
                <CentiLogo src={centiLogo} alt="Centi Logo" />
                <WelcomeTitle>Welcome to Centi.</WelcomeTitle>
                <WelcomeSubtitle>Take control of your finances in minutes.</WelcomeSubtitle>
                <WelcomeCallToAction>Choose how you'd like to get started:</WelcomeCallToAction>
            </WelcomeHeader>

            <OptionsGrid>
                <OptionCard onClick={() => setActiveModal('plaid')}>
                    <OptionIcon $color="#00d4aa">
                        <FontAwesomeIcon icon={faBank} />
                    </OptionIcon>
                    <OptionTitle>Connect Your Bank</OptionTitle>
                    <OptionDescription>
                        Securely link your accounts and import transactions automatically. Most popular choice!
                    </OptionDescription>
                    <OptionBadge>Recommended</OptionBadge>
                </OptionCard>

                <OptionCard onClick={() => setActiveModal('csv')}>
                    <OptionIcon $color="#007bff">
                        <FontAwesomeIcon icon={faFileUpload} />
                    </OptionIcon>
                    <OptionTitle>Upload Bank Statement</OptionTitle>
                    <OptionDescription>
                        Have a CSV file from your bank? Upload it and we'll organize everything for you.
                    </OptionDescription>
                </OptionCard>

                <OptionCard onClick={() => setActiveModal('transaction')}>
                    <OptionIcon $color="#28a745">
                        <FontAwesomeIcon icon={faPlus} />
                    </OptionIcon>
                    <OptionTitle>Start From Scratch</OptionTitle>
                    <OptionDescription>
                        Prefer to add transactions manually? Perfect for tracking specific expenses.
                    </OptionDescription>
                </OptionCard>
            </OptionsGrid>

            {/* Plaid Modal */}
            {activeModal === 'plaid' && (
                <Modal onClick={closeModal}>
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
                            <CloseButton onClick={closeModal}>
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
            )}

            {/* CSV Upload Modal */}
            {activeModal === 'csv' && (
                <Modal onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Upload CSV File</ModalTitle>
                            <CloseButton onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </CloseButton>
                        </ModalHeader>

                        <UploadSection>
                            <FileDropZone $hasFile={!!file}>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload">
                                    <FontAwesomeIcon icon={faFileUpload} />
                                    {file ? file.name : 'Choose CSV File'}
                                </label>
                            </FileDropZone>

                            <NotesInput
                                placeholder="Optional notes about this upload..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />

                            {uploadError && (
                                <ErrorMessage>{uploadError}</ErrorMessage>
                            )}

                            <ActionButton 
                                onClick={handleCSVUpload} 
                                disabled={!file || uploading}
                                $primary
                            >
                                {uploading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload & Parse'
                                )}
                            </ActionButton>
                        </UploadSection>
                    </ModalContent>
                </Modal>
            )}

            {/* Manual Transaction Modal */}
            {activeModal === 'transaction' && (
                <Modal onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Add New Transaction</ModalTitle>
                            <CloseButton onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </CloseButton>
                        </ModalHeader>

                        <TransactionForm>
                            <FormGroup>
                                <FormLabel>Date</FormLabel>
                                <FormInput
                                    type="date"
                                    value={transactionData.date}
                                    onChange={(e) => updateTransactionData('date', e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>Vendor</FormLabel>
                                <FormInput
                                    type="text"
                                    placeholder="e.g., Starbucks, Amazon, etc."
                                    value={transactionData.vendor}
                                    onChange={(e) => updateTransactionData('vendor', e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormInput
                                    type="text"
                                    placeholder="Additional details..."
                                    value={transactionData.description}
                                    onChange={(e) => updateTransactionData('description', e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>Amount</FormLabel>
                                <FormInput
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={transactionData.amount}
                                    onChange={(e) => updateTransactionData('amount', e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>Type</FormLabel>
                                <FormSelect 
                                    value={transactionData.type} 
                                    onChange={(e) => updateTransactionData('type', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    {Object.entries(TRANSACTION_TYPE_OPTIONS).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>

                            <ActionButton 
                                onClick={handleTransactionSubmit}
                                disabled={submitting}
                                $primary
                            >
                                {submitting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Transaction'
                                )}
                            </ActionButton>
                        </TransactionForm>
                    </ModalContent>
                </Modal>
            )}
        </WelcomeContainer>
    );
};

// -------------------------------------------------------- Welcome Screen Container.
const WelcomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
    min-height: 70vh;
    border-radius: 24px;
    margin: 2rem 0;
    color: black;
`;
const WelcomeHeader = styled.div`
    text-align: center;
    margin-bottom: 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
// -------------------------------------------------------- Centi Logo Img.
const CentiLogo = styled.img`
    width: 100px;
    height: 100px;
    margin-bottom: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
`;
// -------------------------------------------------------- Welcome Section.
const WelcomeTitle = styled.h1`
    font-size: 3.2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
`;
const WelcomeSubtitle = styled.p`
    font-size: 1.4rem;
    opacity: 0.8;
    margin: 0 0 1.5rem 0;
    font-weight: 400;
    color: var(--text-secondary);
    max-width: 500px;
`;
const WelcomeCallToAction = styled.p`
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 500;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 2px;
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        border-radius: 1px;
    }
`;

// -------------------------------------------------------- Options Grid : Plaid, CSV, Manual.
const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    width: 85%;
`;
const OptionCard = styled.div`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2.5rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.18);
    position: relative;
    color: #333;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(42, 85, 177, 0.2);
        background: rgba(255, 255, 255, 1);
        border: 2px solid var(--button-primary);
    }

    &:active {
        transform: translateY(-4px);
    }
`;
const OptionIcon = styled.div`
    width: 85px;
    height: 85px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.8rem auto;
    color: white;
    font-size: 2.1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    ${OptionCard}:hover & {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
`;
const OptionTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin: 0 0 1.2rem 0;
    color: #333;
    transition: color 0.3s ease;

    ${OptionCard}:hover & {
        color: var(--button-primary);
    }
`;
const OptionDescription = styled.p`
    font-size: 1.05rem;
    color: #666;
    line-height: 1.6;
    margin: 0;
    transition: color 0.3s ease;

    ${OptionCard}:hover & {
        color: var(--text-secondary);
    }
`;
const OptionBadge = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(72, 142, 163, 0.3);
`;
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
const ModalContent = styled.div`
    background: white;
    border-radius: 24px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;

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
const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid #eee;
`;
const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
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
// -------------------------------------------------------- Upload Section.
const UploadSection = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;
// -------------------------------------------------------- File Drop Zone.
const FileDropZone = styled.div`
    border: 2px dashed ${props => props.$hasFile ? '#28a745' : '#ddd'};
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    background: ${props => props.$hasFile ? '#f8fff9' : '#fafafa'};
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: #007bff;
        background: #f0f8ff;
    }

    label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        font-weight: 500;
        color: ${props => props.$hasFile ? '#28a745' : '#666'};

        svg {
            font-size: 2rem;
            color: ${props => props.$hasFile ? '#28a745' : '#007bff'};
        }
    }
`;
// -------------------------------------------------------- Notes Input.
const NotesInput = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
// -------------------------------------------------------- Transaction Form.
const TransactionForm = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
const FormLabel = styled.label`
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
`;
const FormInput = styled.input`
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
const FormSelect = styled.select`
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    box-sizing: border-box;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
// -------------------------------------------------------- Action Button.
const ActionButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    ${props => props.$primary ? `
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }
    ` : `
        background: #f8f9fa;
        color: #333;
        border: 2px solid #eee;

        &:hover:not(:disabled) {
            background: #e9ecef;
        }
    `}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
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
const PlaidModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2.5rem 2.5rem 1.5rem 2.5rem;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #f8fbff, #ffffff);
`;
const PlaidHeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    text-align: center;
`;
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
const PlaidModalTitle = styled.h2`
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.2;
`;
const PlaidModalSubtitle = styled.p`
    margin: 0;
    font-size: 1.1rem;
    color: #7f8c8d;
    font-weight: 400;
    line-height: 1.4;
    max-width: 400px;
`;
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
// -------------------------------------------------------- Security Section.
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

// -------------------------------------------------------- Export WelcomeScreen Component.
export default WelcomeScreen; 