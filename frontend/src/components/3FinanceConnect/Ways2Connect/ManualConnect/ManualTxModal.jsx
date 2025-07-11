// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../../styles/colors.css';
import { createTransaction } from '../../../../services/api';
import AccountSelectionModal from '../AccountSelect/AccountSelectionModal';

// -------------------------------------------------------- ManualTxModal Component.
const ManualTxModal = ({ isOpen, onClose, onSuccess, existingAccounts = [] }) => {
    // Transaction States.
    const [transactionData, setTransactionData] = useState({
        date: '',
        vendor: '',
        description: '',
        amount: '',
        type: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showAccountSelection, setShowAccountSelection] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    
    // Form Validation States.
    const [touchedFields, setTouchedFields] = useState({});
    const [errors, setErrors] = useState({});
    
    // -------------------------------------------------------- Validation Functions.
    const validateField = (field, value) => {
        switch (field) {
            case 'date':
                return !value ? 'Date is required' : '';
            case 'vendor':
                return !value ? 'Vendor is required' : '';
            case 'amount':
                if (!value) return 'Amount is required';
                if (isNaN(value) || parseFloat(value) <= 0) return 'Amount must be a positive number';
                return '';
            case 'type':
                return !value ? 'Transaction type is required' : '';
            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(transactionData).forEach(field => {
            if (field !== 'description') { // Description is optional
                newErrors[field] = validateField(field, transactionData[field]);
            }
        });
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    // -------------------------------------------------------- Handle Field Changes.
    const handleFieldChange = (field, value) => {
        setTransactionData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // -------------------------------------------------------- Handle Field Blur.
    const handleFieldBlur = (field) => {
        setTouchedFields(prev => ({
            ...prev,
            [field]: true
        }));
        
        const error = validateField(field, transactionData[field]);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    // -------------------------------------------------------- Handle Manual Transaction Submission.
    const handleTransactionSubmit = async () => {
        if (!validateForm()) {
            // Mark all fields as touched to show errors
            setTouchedFields({
                date: true,
                vendor: true,
                amount: true,
                type: true
            });
            return;
        }

        setShowAccountSelection(true);
    };

    // -------------------------------------------------------- Handle Account Selection.
    const handleAccountSelect = async (account) => {
        setSelectedAccount(account);
        setShowAccountSelection(false);
        await performTransactionCreation(account);
    };

    // -------------------------------------------------------- Perform Actual Transaction Creation.
    const performTransactionCreation = async (account) => {
        const { date, vendor, amount, type } = transactionData;

        const newTransaction = {
            ...transactionData,
            amount: parseFloat(amount),
            file: "manual",
            account_data: account
        };

        try {
            setSubmitting(true);
            await createTransaction(newTransaction);
            
            const timestamp = new Date().toLocaleString();
            const accountName = account?.name || 'Cash';
            alert(`Transaction created successfully at ${timestamp}!\n\nVendor: ${vendor}\nAmount: $${parseFloat(amount).toFixed(2)}\nType: ${TRANSACTION_TYPE_OPTIONS[type]}\nAccount: ${accountName}`);
            
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Failed to create transaction. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------------------- Close Modal & Clear States.
    const handleClose = () => {
        setTransactionData({
            date: '',
            vendor: '',
            description: '',
            amount: '',
            type: ''
        });
        setSelectedAccount(null);
        setShowAccountSelection(false);
        setTouchedFields({});
        setErrors({});
        onClose();
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

    if (!isOpen) return null;

    return (
        <>
            <Modal onClick={handleClose}>
                <ModalContent onClick={e => e.stopPropagation()}>
                    <ModalHeader>
                        <ModalTitle>Add New Transaction</ModalTitle>
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faTimes} />
                        </CloseButton>
                    </ModalHeader>

                    <TransactionForm>
                        <FormGroup>
                            <FormLabel>
                                Date <RequiredAsterisk>*</RequiredAsterisk>
                            </FormLabel>
                            <FormInput
                                type="date"
                                value={transactionData.date}
                                onChange={(e) => handleFieldChange('date', e.target.value)}
                                onBlur={() => handleFieldBlur('date')}
                                $hasError={touchedFields.date && errors.date}
                                $isValid={touchedFields.date && !errors.date && transactionData.date}
                            />
                            {touchedFields.date && errors.date && (
                                <ErrorMessage>
                                    <FontAwesomeIcon icon={faExclamationCircle} />
                                    {errors.date}
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>
                                Vendor <RequiredAsterisk>*</RequiredAsterisk>
                            </FormLabel>
                            <FormInput
                                type="text"
                                placeholder="e.g., Starbucks, Amazon, etc."
                                value={transactionData.vendor}
                                onChange={(e) => handleFieldChange('vendor', e.target.value)}
                                onBlur={() => handleFieldBlur('vendor')}
                                $hasError={touchedFields.vendor && errors.vendor}
                                $isValid={touchedFields.vendor && !errors.vendor && transactionData.vendor}
                            />
                            {touchedFields.vendor && errors.vendor && (
                                <ErrorMessage>
                                    <FontAwesomeIcon icon={faExclamationCircle} />
                                    {errors.vendor}
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormInput
                                type="text"
                                placeholder="Additional details..."
                                value={transactionData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>
                                Amount <RequiredAsterisk>*</RequiredAsterisk>
                            </FormLabel>
                            <FormInput
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={transactionData.amount}
                                onChange={(e) => handleFieldChange('amount', e.target.value)}
                                onBlur={() => handleFieldBlur('amount')}
                                $hasError={touchedFields.amount && errors.amount}
                                $isValid={touchedFields.amount && !errors.amount && transactionData.amount}
                            />
                            {touchedFields.amount && errors.amount && (
                                <ErrorMessage>
                                    <FontAwesomeIcon icon={faExclamationCircle} />
                                    {errors.amount}
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>
                                Type <RequiredAsterisk>*</RequiredAsterisk>
                            </FormLabel>
                            <FormSelect 
                                value={transactionData.type} 
                                onChange={(e) => handleFieldChange('type', e.target.value)}
                                onBlur={() => handleFieldBlur('type')}
                                $hasError={touchedFields.type && errors.type}
                                $isValid={touchedFields.type && !errors.type && transactionData.type}
                            >
                                <option value="">Select Type</option>
                                {Object.entries(TRANSACTION_TYPE_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </FormSelect>
                            {touchedFields.type && errors.type && (
                                <ErrorMessage>
                                    <FontAwesomeIcon icon={faExclamationCircle} />
                                    {errors.type}
                                </ErrorMessage>
                            )}
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

            {/* Account Selection Modal */}
            <AccountSelectionModal
                isOpen={showAccountSelection}
                onClose={() => setShowAccountSelection(false)}
                onAccountSelect={handleAccountSelect}
                existingAccounts={existingAccounts}
            />
        </>
    );
};

// -------------------------------------------------------- Styled Components.
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
    box-sizing: border-box;
    overflow: hidden;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 24px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: scroll;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */

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
    padding: 1.5rem 2rem 1rem 2rem;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
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

    &:hover {
        opacity: 0.8;
    }
`;

const TransactionForm = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
`;

const FormLabel = styled.label`
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.3s ease;
    
    &:hover {
        color: var(--button-primary);
    }
`;

const FormInput = styled.input`
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.3s ease;
    background: white;

    &:focus {
        outline: none;
        border: 2px solid transparent;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        transform: translateY(-1px);
    }

    ${props => props.$hasError ? `
        border: 2px solid #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        animation: shake 0.5s ease-in-out;
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    ` : props.$isValid ? `
        border: 2px solid #28a745;
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
    ` : ''}
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
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
    padding-right: 2.5rem;

    &:focus {
        outline: none;
        border: 2px solid transparent;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        transform: translateY(-1px);
    }

    ${props => props.$hasError ? `
        border: 2px solid #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        animation: shake 0.5s ease-in-out;
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    ` : props.$isValid ? `
        border: 2px solid #28a745;
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
    ` : ''}
`;

const ActionButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;

    ${props => props.$primary ? `
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        }

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

    /* Add a subtle press effect */
    &:active:not(:disabled) {
        transform: scale(0.98);
    }
`;

const ErrorMessage = styled.span`
    font-size: 0.8rem;
    color: #dc3545;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    animation: fadeIn 0.3s ease-in;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const RequiredAsterisk = styled.span`
    color: #dc3545;
    font-weight: bold;
`;

export default ManualTxModal;