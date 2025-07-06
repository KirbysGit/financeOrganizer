// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faCreditCard, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

// -------------------------------------------------------- AccountSelectionModal Component.
const AccountSelectionModal = ({ isOpen, onClose, onAccountSelect, existingAccounts = [] }) => {
    const [selectedOption, setSelectedOption] = useState('existing');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [newAccountData, setNewAccountData] = useState({
        name: '',
        type: 'depository',
        subtype: 'checking'
    });

    // -------------------------------------------------------- Handle Account Selection.
    const handleAccountSelect = () => {
        if (selectedOption === 'cash') {
            onAccountSelect({ type: 'cash', name: 'Cash Transaction' });
        } else if (selectedOption === 'existing' && selectedAccount) {
            const account = existingAccounts.find(acc => acc.account_id === selectedAccount);
            onAccountSelect(account);
        } else if (selectedOption === 'new' && newAccountData.name) {
            onAccountSelect({
                ...newAccountData,
                account_id: `manual_${Date.now()}`,
                is_new: true
            });
        }
        onClose();
    };

    // -------------------------------------------------------- Handle Close Modal.
    const handleClose = () => {
        setSelectedOption('existing');
        setSelectedAccount('');
        setNewAccountData({ name: '', type: 'depository', subtype: 'checking' });
        onClose();
    };

    // -------------------------------------------------------- Account Type Options.
    const ACCOUNT_TYPES = {
        depository: "Bank Account",
        credit: "Credit Card",
        loan: "Loan",
        investment: "Investment"
    };

    const ACCOUNT_SUBTYPES = {
        depository: {
            checking: "Checking",
            savings: "Savings",
            money_market: "Money Market",
            cd: "Certificate of Deposit"
        },
        credit: {
            credit_card: "Credit Card"
        },
        loan: {
            auto: "Auto Loan",
            home: "Home Loan",
            student: "Student Loan",
            personal: "Personal Loan"
        },
        investment: {
            ira: "IRA",
            "401k": "401(k)",
            brokerage: "Brokerage Account"
        }
    };

    if (!isOpen) return null;

    return (
        <Modal onClick={handleClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Select Account</ModalTitle>
                    <CloseButton onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </ModalHeader>

                <SelectionSection>
                    <SectionTitle>Choose how to categorize this transaction:</SectionTitle>
                    
                    {/* Existing Accounts Option */}
                    <OptionCard 
                        $selected={selectedOption === 'existing'}
                        onClick={() => setSelectedOption('existing')}
                    >
                        <OptionIcon $color="#007bff">
                            <FontAwesomeIcon icon={faCreditCard} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>Existing Account</OptionTitle>
                            <OptionDescription>
                                Use one of your connected bank accounts
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* Cash Option */}
                    <OptionCard 
                        $selected={selectedOption === 'cash'}
                        onClick={() => setSelectedOption('cash')}
                    >
                        <OptionIcon $color="#28a745">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>Cash Transaction</OptionTitle>
                            <OptionDescription>
                                For cash payments or receipts
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* New Account Option */}
                    <OptionCard 
                        $selected={selectedOption === 'new'}
                        onClick={() => setSelectedOption('new')}
                    >
                        <OptionIcon $color="#ffc107">
                            <FontAwesomeIcon icon={faPlus} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>New Account</OptionTitle>
                            <OptionDescription>
                                Create a new manual account
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* Selection Details */}
                    {selectedOption === 'existing' && (
                        <SelectionDetails>
                            <FormLabel>Select Account:</FormLabel>
                            <FormSelect 
                                value={selectedAccount} 
                                onChange={(e) => setSelectedAccount(e.target.value)}
                            >
                                <option value="">Choose an account...</option>
                                {existingAccounts.map(account => (
                                    <option key={account.account_id} value={account.account_id}>
                                        {account.name} - {account.official_name || account.type}
                                    </option>
                                ))}
                            </FormSelect>
                        </SelectionDetails>
                    )}

                    {selectedOption === 'new' && (
                        <SelectionDetails>
                            <FormGroup>
                                <FormLabel>Account Name:</FormLabel>
                                <FormInput
                                    type="text"
                                    placeholder="e.g., Savings Account, Investment Portfolio"
                                    value={newAccountData.name}
                                    onChange={(e) => setNewAccountData(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                />
                            </FormGroup>
                            
                            <FormGroup>
                                <FormLabel>Account Type:</FormLabel>
                                <FormSelect 
                                    value={newAccountData.type}
                                    onChange={(e) => setNewAccountData(prev => ({
                                        ...prev,
                                        type: e.target.value,
                                        subtype: Object.keys(ACCOUNT_SUBTYPES[e.target.value])[0]
                                    }))}
                                >
                                    {Object.entries(ACCOUNT_TYPES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </FormSelect>
                            </FormGroup>
                            
                            <FormGroup>
                                <FormLabel>Account Subtype:</FormLabel>
                                <FormSelect 
                                    value={newAccountData.subtype}
                                    onChange={(e) => setNewAccountData(prev => ({
                                        ...prev,
                                        subtype: e.target.value
                                    }))}
                                >
                                    {ACCOUNT_SUBTYPES[newAccountData.type] && 
                                        Object.entries(ACCOUNT_SUBTYPES[newAccountData.type]).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))
                                    }
                                </FormSelect>
                            </FormGroup>
                        </SelectionDetails>
                    )}

                    {selectedOption === 'cash' && (
                        <SelectionDetails>
                            <CashInfo>
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                <span>This transaction will be marked as a cash transaction and won't be associated with any bank account.</span>
                            </CashInfo>
                        </SelectionDetails>
                    )}

                    <ActionButton 
                        onClick={handleAccountSelect}
                        disabled={
                            (selectedOption === 'existing' && !selectedAccount) ||
                            (selectedOption === 'new' && !newAccountData.name)
                        }
                        $primary
                    >
                        Continue
                    </ActionButton>
                </SelectionSection>
            </ModalContent>
        </Modal>
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
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 24px;
    max-width: 600px;
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

const SelectionSection = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionTitle = styled.h3`
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
`;

const OptionCard = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border: 2px solid ${props => props.$selected ? '#007bff' : '#eee'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${props => props.$selected ? '#f8f9ff' : 'white'};

    &:hover {
        border-color: #007bff;
        background: #f8f9ff;
        transform: translateY(-2px);
    }
`;

const OptionIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
`;

const OptionContent = styled.div`
    flex: 1;
`;

const OptionTitle = styled.h4`
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 0.9rem;
    color: #666;
`;

const SelectionDetails = styled.div`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const FormLabel = styled.label`
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
`;

const FormInput = styled.input`
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const FormSelect = styled.select`
    max-width: 100%;
    overflow: hidden;
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const CashInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #28a745;
    font-size: 0.9rem;

    svg {
        font-size: 1.2rem;
    }
`;

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

export default AccountSelectionModal; 