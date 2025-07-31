// Imports.
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faXmark, faFilter } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';

// -------------------------------------------------------- AmountFilter Component.
const AmountFilter = ({ isOpen, onClose, onApplyFilter, currentFilter }) => {
    const [minAmount, setMinAmount] = useState(currentFilter?.minAmount || '');
    const [maxAmount, setMaxAmount] = useState(currentFilter?.maxAmount || '');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // -------------------------------------------------------- Calculate Dropdown Position.
    useEffect(() => {
        if (isOpen) {
            const button = document.querySelector('.amount-filter-wrapper button');
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                });
            }
        }
    }, [isOpen]);

    // -------------------------------------------------------- Format Amount Input.
    const formatAmountInput = (value) => {
        // Remove all non-digit characters except decimal point
        let cleaned = value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        return cleaned;
    };

    // -------------------------------------------------------- Handle Amount Input Change.
    const handleAmountChange = (value, setter) => {
        const formatted = formatAmountInput(value);
        setter(formatted);
    };

    // -------------------------------------------------------- Apply Filter.
    const handleApplyFilter = () => {
        let filterData = null;
        
        if (minAmount || maxAmount) {
            filterData = {
                minAmount: minAmount ? parseFloat(minAmount) : null,
                maxAmount: maxAmount ? parseFloat(maxAmount) : null
            };
        }
        
        onApplyFilter(filterData);
        onClose();
    };

    // -------------------------------------------------------- Clear Filter.
    const handleClearFilter = () => {
        setMinAmount('');
        setMaxAmount('');
        onApplyFilter(null);
        onClose();
    };

    // -------------------------------------------------------- Get Filter Display Text.
    const getFilterText = () => {
        if (!currentFilter) return 'Amount';
        
        const { minAmount, maxAmount } = currentFilter;
        
        if (minAmount && maxAmount) {
            return `$${minAmount} - $${maxAmount}`;
        } else if (minAmount) {
            return `$${minAmount}+`;
        } else if (maxAmount) {
            return `$${maxAmount}-`;
        }
        
        return 'Amount';
    };

    if (!isOpen) return null;

    return (
        <AmountFilterDropdown 
            className="amount-filter-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
            }}
        >
            <FilterControls />

            <FilterContent>
                <AmountInputGroup>
                    <AmountLabel>Minimum Amount</AmountLabel>
                    <AmountInputContainer>
                        <AmountInputIcon>
                            <FontAwesomeIcon icon={faDollarSign} />
                        </AmountInputIcon>
                        <AmountInput
                            type="text"
                            placeholder="0.00"
                            value={minAmount}
                            onChange={(e) => handleAmountChange(e.target.value, setMinAmount)}
                        />
                    </AmountInputContainer>
                </AmountInputGroup>

                <AmountInputGroup>
                    <AmountLabel>Maximum Amount</AmountLabel>
                    <AmountInputContainer>
                        <AmountInputIcon>
                            <FontAwesomeIcon icon={faDollarSign} />
                        </AmountInputIcon>
                        <AmountInput
                            type="text"
                            placeholder="0.00"
                            value={maxAmount}
                            onChange={(e) => handleAmountChange(e.target.value, setMaxAmount)}
                        />
                    </AmountInputContainer>
                </AmountInputGroup>

                <FilterStatus>
                    {minAmount || maxAmount ? (
                        <StatusText>
                            {minAmount && maxAmount ? (
                                `Filter: $${minAmount} - $${maxAmount}`
                            ) : minAmount ? (
                                `Filter: $${minAmount} and above`
                            ) : (
                                `Filter: $${maxAmount} and below`
                            )}
                        </StatusText>
                    ) : (
                        <StatusText>Enter amount range</StatusText>
                    )}
                </FilterStatus>
            </FilterContent>

            <AmountFilterActions>
                <ClearButton onClick={handleClearFilter}>
                    Clear
                </ClearButton>
                <ApplyButton onClick={handleApplyFilter}>
                    Apply
                </ApplyButton>
            </AmountFilterActions>
        </AmountFilterDropdown>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- AmountFilterDropdown.
const AmountFilterDropdown = styled.div`
    min-width: 280px;
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
`;

// -------------------------------------------------------- AmountInputGroup.
const AmountInputGroup = styled.div`
    margin-bottom: 1rem;
`;

// -------------------------------------------------------- AmountLabel.
const AmountLabel = styled.label`
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

// -------------------------------------------------------- AmountInputContainer.
const AmountInputContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    background: white;
    transition: all 0.3s ease;

    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:focus-within {
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- AmountInputIcon.
const AmountInputIcon = styled.div`
    padding: 0.75rem 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

// -------------------------------------------------------- AmountInput.
const AmountInput = styled.input`
    font: inherit;
    flex: 1;
    border: none;
    outline: none;
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    background: transparent;

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
    }
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

// -------------------------------------------------------- AmountFilterActions.
const AmountFilterActions = styled.div`
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

export default AmountFilter;
