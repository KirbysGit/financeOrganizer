import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faFilter, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

// Transaction type labels and categories
const TRANSACTION_TYPE_LABELS = {
    "sale": "Purchase",
    "payment": "Credit Card Payment", 
    "refund": "Refund / Reimbursement",
    "fee": "Service / Late Fee",
    "interest": "Interest Charge",
    "adjustment": "Account Adjustment",
    "transfer": "Transfer",
    "other": "Other",
};

const NEGATIVE_TYPES = ["sale", "fee", "interest", "adjustment"];
const POSITIVE_TYPES = ["refund", "payment", "transfer"];

const TypeFilter = ({ 
    isOpen, 
    onClose, 
    onApplyFilter, 
    currentFilter = null 
}) => {
    const [selectedTypes, setSelectedTypes] = useState(
        currentFilter?.types || []
    );
    const [positiveOnly, setPositiveOnly] = useState(
        currentFilter?.positiveOnly || false
    );
    const [negativeOnly, setNegativeOnly] = useState(
        currentFilter?.negativeOnly || false
    );

    // Reset when currentFilter changes
    useEffect(() => {
        if (currentFilter) {
            setSelectedTypes(currentFilter.types || []);
            setPositiveOnly(currentFilter.positiveOnly || false);
            setNegativeOnly(currentFilter.negativeOnly || false);
        } else {
            setSelectedTypes([]);
            setPositiveOnly(false);
            setNegativeOnly(false);
        }
    }, [currentFilter]);

    const handleTypeToggle = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleSelectAll = () => {
        setSelectedTypes(Object.keys(TRANSACTION_TYPE_LABELS));
    };

    const handleDeselectAll = () => {
        setSelectedTypes([]);
    };

    const handlePositiveOnly = () => {
        setPositiveOnly(true);
        setNegativeOnly(false);
        setSelectedTypes(POSITIVE_TYPES);
    };

    const handleNegativeOnly = () => {
        setNegativeOnly(true);
        setPositiveOnly(false);
        setSelectedTypes(NEGATIVE_TYPES);
    };

    const handleClearMaster = () => {
        setPositiveOnly(false);
        setNegativeOnly(false);
        setSelectedTypes([]);
    };

    const handleApply = () => {
        const filterData = {
            types: selectedTypes,
            positiveOnly,
            negativeOnly,
            hasFilter: selectedTypes.length > 0 || positiveOnly || negativeOnly
        };
        onApplyFilter(filterData);
        onClose();
    };

    const handleClear = () => {
        setSelectedTypes([]);
        setPositiveOnly(false);
        setNegativeOnly(false);
        onApplyFilter(null);
        onClose();
    };

    const getStatusText = () => {
        if (positiveOnly) return "Positive Only";
        if (negativeOnly) return "Negative Only";
        if (selectedTypes.length === 0) return "All Types";
        if (selectedTypes.length === 1) {
            return TRANSACTION_TYPE_LABELS[selectedTypes[0]];
        }
        return `${selectedTypes.length} Types`;
    };

    if (!isOpen) return null;

    return (
        <FilterContainer>
            <FilterControls />

            {/* Master Switch Section */}
            <MasterSwitchSection>
                <MasterSwitchTitle>Master Switch</MasterSwitchTitle>
                
                <MasterSwitchButtons>
                    <MasterSwitchButton 
                        $isActive={positiveOnly}
                        onClick={handlePositiveOnly}
                        title="Show only income/positive transactions"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Positive Only</span>
                        <span className="description">Income, refunds, payments</span>
                    </MasterSwitchButton>
                    
                    <MasterSwitchButton 
                        $isActive={negativeOnly}
                        onClick={handleNegativeOnly}
                        title="Show only expenses/negative transactions"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                        <span>Negative Only</span>
                        <span className="description">Purchases, fees, charges</span>
                    </MasterSwitchButton>
                    
                    <MasterSwitchButton 
                        $isActive={!positiveOnly && !negativeOnly}
                        onClick={handleClearMaster}
                        title="Show all transaction types"
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        <span>All Types</span>
                        <span className="description">No master filter</span>
                    </MasterSwitchButton>
                </MasterSwitchButtons>
            </MasterSwitchSection>

            {/* Individual Type Selection */}
            <TypeSelectionSection>
                <TypeSelectionHeader>
                    <TypeSelectionTitle>Individual Types</TypeSelectionTitle>
                    <TypeSelectionActions>
                        <ActionButton onClick={handleSelectAll}>
                            Select All
                        </ActionButton>
                        <ActionButton onClick={handleDeselectAll}>
                            Clear All
                        </ActionButton>
                    </TypeSelectionActions>
                </TypeSelectionHeader>

                <TypeGrid>
                    {Object.entries(TRANSACTION_TYPE_LABELS).map(([type, label]) => (
                        <TypeCheckbox 
                            key={type}
                            $isSelected={selectedTypes.includes(type)}
                            $isPositive={POSITIVE_TYPES.includes(type)}
                            onClick={() => handleTypeToggle(type)}
                        >
                            <CheckboxIcon>
                                {selectedTypes.includes(type) && (
                                    <FontAwesomeIcon icon={faCheck} />
                                )}
                            </CheckboxIcon>
                            <TypeLabel>
                                <span className="label">{label}</span>
                                <span className="type">{type}</span>
                            </TypeLabel>
                        </TypeCheckbox>
                    ))}
                </TypeGrid>
            </TypeSelectionSection>

            {/* Status Display */}
            <StatusDisplay>
                <StatusLabel>Current Selection</StatusLabel>
                <StatusValue>{getStatusText()}</StatusValue>
            </StatusDisplay>

            {/* Action Buttons */}
            <ActionButtons>
                <ClearButton onClick={handleClear}>
                    Clear Filter
                </ClearButton>
                <ApplyButton onClick={handleApply}>
                    Apply Filter
                </ApplyButton>
            </ActionButtons>
        </FilterContainer>
    );
};

// Styled Components
const FilterContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: 0;
    min-width: 350px;
    max-width: 450px;
    animation: slideIn 0.2s ease-out;
    overflow: hidden;

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

const FilterHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
`;

const FilterTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const FilterControls = styled.div`
    height: 10px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.1rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        color: var(--text-primary);
    }
`;

const MasterSwitchSection = styled.div`
    margin-bottom: 1rem;
    padding: 1.25rem 1.25rem 1rem 1.25rem;
    border-bottom: 1px solid #e0e0e0;
`;

const MasterSwitchTitle = styled.h4`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const MasterSwitchDescription = styled.p`
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const MasterSwitchButtons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const MasterSwitchButton = styled.button`
    font: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 2px solid ${props => props.$isActive ? 'var(--button-primary)' : '#e0e0e0'};
    border-radius: 10px;
    background: ${props => props.$isActive ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' : 'white'};
    color: ${props => props.$isActive ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;

    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    span {
        font-weight: 500;   
        font-size: 0.8rem;
        
        &.description {
            font-size: 0.75rem;
            opacity: 0.8;
            font-weight: 400;
        }
    }
`;

const TypeSelectionSection = styled.div`
    margin-bottom: 1rem;
    padding: 0 1.25rem;
`;

const TypeSelectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const TypeSelectionTitle = styled.h4`
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const TypeSelectionActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    font: inherit;
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: var(--text-primary);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--button-primary);
        background: #f8f9fa;
    }
`;

const TypeGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;

const TypeCheckbox = styled.button`
    font: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid ${props => props.$isSelected ? 'var(--button-primary)' : '#e0e0e0'};
    border-radius: 8px;
    background: ${props => props.$isSelected ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' : 'white'};
    color: ${props => props.$isSelected ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;

    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

const CheckboxIcon = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    flex-shrink: 0;
`;

const TypeLabel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    .label {
        font-weight: 500;
        font-size: 0.85rem;
    }

    .type {
        font-size: 0.7rem;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

const StatusDisplay = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background:rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin: 0 1.25rem 1rem 1.25rem;
`;

const StatusLabel = styled.span`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const StatusValue = styled.span`
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 0 1.25rem 1.25rem 1.25rem;
`;

const ClearButton = styled.button`
    font: inherit;
    font-size: 0.8rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    background: white;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #ccc;
        background: #f8f9fa;
    }
`;

const ApplyButton = styled.button`
    font: inherit;
    font-size: 0.8rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
    }
`;

export default TypeFilter; 