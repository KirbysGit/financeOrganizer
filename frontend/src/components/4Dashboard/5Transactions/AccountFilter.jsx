// AccountFilter.jsx

// This just a sub-component for the filter for the Account Field, it's just a dropdown that allows the user
// to select the accounts they want to filter by, it provides a select all option, and tells you the amount
// of accounts you have selected within the filter.

// Imports.
import { styled } from 'styled-components';
import React, { useState, useEffect } from 'react';

// Local Imports.
import '../../../styles/colors.css';

// -------------------------------------------------------- AccountFilter Component.
const AccountFilter = ({ isOpen, onClose, onApplyFilter, currentFilter, existingAccounts }) => {
    const [selectedAccounts, setSelectedAccounts] = useState(currentFilter || []);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // -------------------------------------------------------- Calculate Dropdown Position.
    useEffect(() => {
        if (isOpen) {
            const button = document.querySelector('.account-filter-wrapper button');
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                });
            }
        }
    }, [isOpen]);

    // -------------------------------------------------------- Handle Account Selection.
    const handleAccountToggle = (accountId) => {
        setSelectedAccounts(prev => {
            if (prev.includes(accountId)) {
                return prev.filter(id => id !== accountId);
            } else {
                return [...prev, accountId];
            }
        });
    };

    // -------------------------------------------------------- Handle Select All.
    const handleSelectAll = () => {
        if (selectedAccounts.length === existingAccounts.length) {
            setSelectedAccounts([]);
        } else {
            setSelectedAccounts(existingAccounts.map(account => account.id));
        }
    };

    // -------------------------------------------------------- Apply Filter.
    const handleApplyFilter = () => {
        onApplyFilter(selectedAccounts.length > 0 ? selectedAccounts : null);
        onClose();
    };

    // -------------------------------------------------------- Clear Filter.
    const handleClearFilter = () => {
        setSelectedAccounts([]);
        onApplyFilter(null);
        onClose();
    };

    // -------------------------------------------------------- Get Filter Display Text.
    const getFilterText = () => {
        if (!currentFilter || currentFilter.length === 0) return 'Account';
        
        if (currentFilter.length === 1) {
            const account = existingAccounts.find(acc => acc.id === currentFilter[0]);
            return account ? account.name : 'Account';
        }
        
        return `${currentFilter.length} Accounts`;
    };

    // -------------------------------------------------------- Render.

    if (!isOpen) return null;

    return (
        <AccountFilterDropdown 
            className="account-filter-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
            }}
        >
            <FilterControls />

            {/* Filter Content. */}
            <FilterContent>
                <SelectAllSection>
                    <SelectAllButton 
                        onClick={handleSelectAll}
                        $isAllSelected={selectedAccounts.length === existingAccounts.length}
                    >
                        <SelectAllCheckbox $isChecked={selectedAccounts.length === existingAccounts.length}>
                            {selectedAccounts.length === existingAccounts.length && <CheckMark>✓</CheckMark>}
                        </SelectAllCheckbox>
                        <SelectAllText>
                            {selectedAccounts.length === existingAccounts.length ? 'Deselect All' : 'Select All'}
                        </SelectAllText>
                    </SelectAllButton>
                </SelectAllSection>

                <AccountsList>
                    {existingAccounts.map(account => (
                        <AccountItem key={account.id}>
                            <AccountCheckbox 
                                onClick={() => handleAccountToggle(account.id)}
                            >
                                <CheckboxInput
                                    type="checkbox"
                                    checked={selectedAccounts.includes(account.id)}
                                    onChange={() => handleAccountToggle(account.id)}
                                />
                                <CheckboxIndicator $isChecked={selectedAccounts.includes(account.id)}>
                                    {selectedAccounts.includes(account.id) && <CheckMark>✓</CheckMark>}
                                </CheckboxIndicator>
                            </AccountCheckbox>
                            <AccountInfo>
                                <AccountName>{account.name}</AccountName>
                                {account.mask && (
                                    <AccountMask>****{account.mask}</AccountMask>
                                )}
                            </AccountInfo>
                            <AccountType $isCash={account.type === 'cash'}>
                                {account.type}
                            </AccountType>
                        </AccountItem>
                    ))}
                </AccountsList>

                {/* Filter Status. */}
                <FilterStatus>
                    {selectedAccounts.length > 0 ? (
                        <StatusText>
                            {selectedAccounts.length === 1 ? (
                                `Filter: ${existingAccounts.find(acc => acc.id === selectedAccounts[0])?.name}`
                            ) : (
                                `Filter: ${selectedAccounts.length} accounts selected`
                            )}
                        </StatusText>
                    ) : (
                        <StatusText>Select accounts to filter</StatusText>
                    )}
                </FilterStatus>
            </FilterContent>

            {/* Account Filter Actions. */}
            <AccountFilterActions>
                <ClearButton onClick={handleClearFilter}>
                    Clear
                </ClearButton>
                <ApplyButton onClick={handleApplyFilter}>
                    Apply
                </ApplyButton>
            </AccountFilterActions>
        </AccountFilterDropdown>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- AccountFilterDropdown.
const AccountFilterDropdown = styled.div`
    min-width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s ease-out;
    overflow: hidden;
    max-height: 500px;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

// -------------------------------------------------------- FilterControls.
const FilterControls = styled.div`
    height: 10px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 16px 16px 0 0;
`;

// -------------------------------------------------------- FilterContent.
const FilterContent = styled.div`
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
`;

// -------------------------------------------------------- SelectAllSection.
const SelectAllSection = styled.div`
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
`;

// -------------------------------------------------------- SelectAllButton.
const SelectAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: none;
    border: 2px solid #e0e0e0;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s ease;
    font: inherit;

    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: rgba(0, 123, 255, 0.05);
    }

    &:focus {
        outline: none;
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- SelectAllCheckbox.
const SelectAllCheckbox = styled.div`
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 4px;
    background: ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(255, 255, 255, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
`;

// -------------------------------------------------------- SelectAllText.
const SelectAllText = styled.span`
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
`;

// -------------------------------------------------------- AccountsList.
const AccountsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

// -------------------------------------------------------- AccountItem.
const AccountItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 2px solid transparent;
    border-radius: 10px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: rgba(0, 123, 255, 0.05);
    }
`;

// -------------------------------------------------------- AccountCheckbox.
const AccountCheckbox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
    }
`;

// -------------------------------------------------------- CheckboxInput.
const CheckboxInput = styled.input`
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    cursor: pointer;
`;

// -------------------------------------------------------- CheckboxIndicator.
const CheckboxIndicator = styled.div`
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 4px;
    background: ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(255, 255, 255, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- CheckMark.
const CheckMark = styled.span`
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    animation: checkmarkSlide 0.3s ease-out;
    
    @keyframes checkmarkSlide {
        0% {
            opacity: 0;
            transform: translateY(-2px) scale(0.8);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

// -------------------------------------------------------- AccountInfo.
const AccountInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

// -------------------------------------------------------- AccountName.
const AccountName = styled.span`
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
`;

// -------------------------------------------------------- AccountMask.
const AccountMask = styled.span`
    font-size: 0.75rem;
    color: var(--text-secondary);
`;

// -------------------------------------------------------- AccountType.
const AccountType = styled.span`
    font-size: 0.7rem;
    font-weight: 500;
    color: ${props => props.$isCash ? 'rgb(40, 167, 69)' : 'var(--text-secondary)'};
    text-transform: capitalize;
    padding: 0.25rem 0.5rem;
    background: ${props => props.$isCash ? 'rgba(40, 167, 69, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border-radius: 4px;
`;

// -------------------------------------------------------- FilterStatus.
const FilterStatus = styled.div`
    padding: 0.5rem;
    margin-top: 0.5rem;
    background: rgba(0, 123, 255, 0.2);
    border: 1px solid rgba(0, 123, 255, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
`;

// -------------------------------------------------------- StatusText.
const StatusText = styled.div`
    font-size: 0.8rem;
    color: var(--text-primary);
`;

// -------------------------------------------------------- AccountFilterActions.
const AccountFilterActions = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-top: 1px solid #eee;
    background: #f9f9f9;
    gap: 0.25rem;
`;

// -------------------------------------------------------- ClearButton.
const ClearButton = styled.button`
    font: inherit;
    flex: 1;
    background: none;
    border: 1px solid #ddd;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
        background: rgb(0, 0, 0, 0.1);
        border-color: #ccc;
    }
`;

// -------------------------------------------------------- ApplyButton.
const ApplyButton = styled.button`
    font: inherit;
    flex: 1;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(0);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- Export The AccountFilter Component.
export default AccountFilter;
