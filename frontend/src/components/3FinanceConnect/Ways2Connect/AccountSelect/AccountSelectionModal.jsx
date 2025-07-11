// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faCreditCard, faMoneyBillWave, faHandshake, faUserFriends, faStar } from '@fortawesome/free-solid-svg-icons';

// -------------------------------------------------------- AccountSelectionModal Component.
const AccountSelectionModal = ({ isOpen, onClose, onAccountSelect, existingAccounts = [] }) => {
    const [selectedOption, setSelectedOption] = useState(existingAccounts.length > 0 ? 'existing' : 'new');
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
        setSelectedOption(existingAccounts.length > 0 ? 'existing' : 'new');
        setSelectedAccount('');
        setNewAccountData({ name: '', type: 'depository', subtype: 'checking' });
        onClose();
    };

    // -------------------------------------------------------- Handle Option Selection.
    const handleOptionSelect = (option) => {
        if (option === 'existing' && existingAccounts.length === 0) {
            return; // Don't allow selection if no accounts
        }
        setSelectedOption(option);
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
                    <HeaderContent>
                        <WelcomeIcon>
                            <FontAwesomeIcon icon={faHandshake} />
                        </WelcomeIcon>
                        <HeaderText>
                            <ModalTitle>Organize Your Transactions</ModalTitle>
                            <ModalSubtitle>Choose how to categorize your transactions</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </ModalHeader>

                <SelectionSection>
                    {/* Existing Accounts Option */}
                    <OptionCard 
                        $selected={selectedOption === 'existing'}
                        $disabled={existingAccounts.length === 0}
                        onClick={() => handleOptionSelect('existing')}
                    >
                        <OptionIcon $color="#007bff" $disabled={existingAccounts.length === 0}>
                            <FontAwesomeIcon icon={faCreditCard} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle $disabled={existingAccounts.length === 0}>Use Existing Account</OptionTitle>
                            <OptionDescription $disabled={existingAccounts.length === 0}>
                                {existingAccounts.length === 0 
                                    ? 'No connected accounts available' 
                                    : 'Connect this transaction to one of your connected bank accounts'
                                }
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* New Account Option */}
                    <OptionCard 
                        $selected={selectedOption === 'new'}
                        onClick={() => handleOptionSelect('new')}
                    >
                        <OptionIcon $color="#ffc107">
                            <FontAwesomeIcon icon={faPlus} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>Create New Account</OptionTitle>
                            <OptionDescription>
                                Set up a new manual account for this transaction
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* Cash Option */}
                    <OptionCard 
                        $selected={selectedOption === 'cash'}
                        onClick={() => handleOptionSelect('cash')}
                    >
                        <OptionIcon $color="#28a745">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>Cash Transaction</OptionTitle>
                            <OptionDescription>
                                For cash payments, receipts, or physical money exchanges
                            </OptionDescription>
                        </OptionContent>
                    </OptionCard>

                    {/* Selection Details */}
                    {selectedOption === 'existing' && (
                        <SelectionDetails>
                            <DetailHeader>
                                <FontAwesomeIcon icon={faUserFriends} />
                                <span>Select Your Account</span>
                            </DetailHeader>
                            <FormLabel>Choose from your connected accounts</FormLabel>
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
                            <DetailHeader>
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Create New Account</span>
                            </DetailHeader>
                            <FormGroup>
                                <FormLabel>Account Name</FormLabel>
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
                                <FormLabel>Account Type</FormLabel>
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
                                <FormLabel>Account Subtype</FormLabel>
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
                            <DetailHeader>
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                <span>Cash Transaction</span>
                            </DetailHeader>
                            <CashInfo>
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                <span>This transaction will be marked as a cash transaction and won't be associated with any bank account. Perfect for tracking cash flow!</span>
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
                        <FontAwesomeIcon icon={faStar} />
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
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
    border-radius: 20px;
    max-width: 550px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 123, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

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
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1.5rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9));
    border-radius: 20px 20px 0 0;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const WelcomeIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--button-primary);
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
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
    z-index: 1000;

    &:hover {
        opacity: 0.8;
    }
`;

const SelectionSection = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const OptionCard = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border: 2px solid ${props => {
        if (props.$disabled) return 'rgba(0, 0, 0, 0.05)';
        return props.$selected ? 'var(--button-primary)' : 'rgba(0, 0, 0, 0.08)';
    }};
    border-radius: 12px;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${props => {
        if (props.$disabled) return 'linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05))';
        return props.$selected 
            ? 'linear-gradient(135deg, rgba(0, 123, 255, 0.05), rgba(34, 197, 94, 0.05))' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9))';
    }};
    box-shadow: ${props => {
        if (props.$disabled) return '0 2px 8px rgba(0, 0, 0, 0.02)';
        return props.$selected 
            ? '0 8px 25px rgba(0, 123, 255, 0.05), 0 4px 12px rgba(34, 197, 94, 0.05)' 
            : '0 2px 8px rgba(0, 0, 0, 0.3)';
    }};
    opacity: ${props => props.$disabled ? 0.5 : 1};

    &:hover {
        ${props => !props.$disabled && `
            border-color: var(--button-primary);
            background: linear-gradient(135deg, rgba(0, 123, 255, 0.08), rgba(34, 197, 94, 0.08));
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
        `}
    }
`;

const OptionIcon = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${props => props.$color}, ${props => props.$color}dd);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};
    
    ${OptionCard}:hover & {
        ${props => !props.$disabled && `
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        `}
    }
`;

const OptionContent = styled.div`
    flex: 1;
`;

const OptionTitle = styled.h4`
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$disabled ? 'var(--text-secondary)' : 'var(--text-primary)'};
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: ${props => props.$disabled ? 'var(--text-secondary)' : 'var(--text-secondary)'};
    line-height: 1.4;
`;

const OptionBenefit = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    color: var(--amount-positive);
    font-size: 0.8rem;
    font-weight: 500;

    svg {
        font-size: 0.9rem;
        animation: sparkle 2s ease-in-out infinite;
    }
    
    @keyframes sparkle {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
`;

const SelectionDetails = styled.div`
    background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(255, 255, 255, 0.9));
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 0.5rem;
    border: 1px solid rgba(0, 123, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const DetailHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive), var(--button-primary));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--button-primary);

    svg {
        font-size: 1.1rem;
    }
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
    color: var(--text-primary);
    font-size: 0.9rem;
`;

const FormInput = styled.input`
    padding: 0.75rem;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);

    &:focus {
        outline: none;
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        background: white;
    }
`;

const FormSelect = styled.select`
    max-width: 100%;
    overflow: hidden;
    padding: 0.75rem;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        background: white;
    }
`;

const CashInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--amount-positive);
    font-size: 0.9rem;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
    border-radius: 8px;
    border: 1px solid rgba(34, 197, 94, 0.2);

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
            box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
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

        &:hover::before {
            animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes shimmer {
            from{ left:-60%; }
            to{ left:120%; }
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