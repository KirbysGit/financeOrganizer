// Imports.
import React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLink, faRotateRight } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import AccountCard from './AccountCard';
import PlaidModal from '../../3FinanceConnect/Ways2Connect/PlaidConnect/PlaidModal';

// ------------------------------------------------------------------------------------------------ Helper Functions.

// Gets Account Type Label Based On The Type Of Account.
const getAccountTypeLabel = (type) => {
    const labels = {
        depository: 'Bank Account',
        credit: 'Credit Card',
        loan: 'Loan',
        investment: 'Investment'
    };
    return labels[type] || 'Account';
};

// Account List Component.
const AccountList = ({ myStats, myAccounts, onUpload, onRefresh, id }) => {
    // Account States.
    const [stats, setStats] = useState(null);
    const [accounts, setAccounts] = useState([]);                   // State 4 Account Data.
    const [expandedAccount, setExpandedAccount] = useState(null);   // State 4 If Account Is Expanded.
    const [selectedType, setSelectedType] = useState('all');         // State 4 Selected Account Type.

    // Loading & Error States.
    const [loading, setLoading] = useState(true);                    // State 4 Loading State.
    const [error, setError] = useState(null);                        // State 4 Error State.

    // Add Menu States.
    const [showAddMenu, setShowAddMenu] = useState(false);              // State 4 Whether Add Menu Is Open.
    const [plaidModal, setPlaidModal] = useState(false);                // State 4 Whether Plaid Modal Is Open.
    const [refreshLoading, setRefreshLoading] = useState(false);        // State 4 Whether Refresh Is Loading.

    // -------------------------------------------------------- Handle Data Import
    const importData = async () => {
        try {
            // Set Loading State To True.
            setLoading(true);

            // Set Accounts & Stats.
            setAccounts(myAccounts);
            setStats(myStats);

            // Set Error To Null.
            setError(null);
        } catch (err) {
            // Set Error To Error Message.
            setError("Failed to load account data");

            // Set Loading State To False.
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------- Use Effect To Import Data.
    useEffect(() => {
        importData();
    }, []);

    // -------------------------------------------------------- Handle Click Outside Dropdown.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAddMenu && !event.target.closest('.add-menu-wrapper')) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddMenu]);

    // -------------------------------------------------------- Handle Refresh Accounts.
    const handleRefresh = async () => {
        if (!onRefresh || refreshLoading) return;
        
        setRefreshLoading(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Failed to refresh accounts:', error);
        } finally {
            setRefreshLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Account Toggle.
    const handleAccountToggle = (accountId) => {
        setExpandedAccount(expandedAccount === accountId ? null : accountId);
    };

    // Get Unique Account Types.
    const uniqueTypes = [...new Set(accounts.map(acc => acc.type).filter(type => type && type !== ''))];

    // If Loading, Return Loading Message.
    if (loading) {
        return <LoadingMessage>Loading your financial data...</LoadingMessage>;
    }

    // If Error, Return Error Message.
    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <AccountListWrapper id={id}>
            {/* Section Header */}
            <SectionHeader>
                <HeaderGrid>
                    <TitleRow>
                        <SectionTitle>Your Accounts</SectionTitle>
                        <AddMenuWrapper className="add-menu-wrapper">
                        <RefreshButton 
                            onClick={handleRefresh} 
                            disabled={refreshLoading}
                            aria-label="Refresh Accounts"
                            title="Refresh Accounts"
                        >
                            <FontAwesomeIcon 
                                icon={faRotateRight} 
                                spin={refreshLoading}
                            />
                        </RefreshButton>
                        <AddButton 
                            onClick={() => setShowAddMenu(prev => !prev)} 
                            aria-label="Add New Content."
                            title="Add New File Or Connect Bank."    
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </AddButton>
                        {showAddMenu && (
                            <DropDownMenu onClick={(e) => e.stopPropagation()}>
                                <DropDownItem onClick={() => {
                                    setPlaidModal(true);
                                    setShowAddMenu(false);
                                }}>
                                        <DropDownIcon>
                                            <FontAwesomeIcon icon={faLink} />
                                        </DropDownIcon>
                                    Connect Bank
                                </DropDownItem>
                            </DropDownMenu>
                        )}
                    </AddMenuWrapper>
                    </TitleRow>
                    <SectionSubtitle>Here's what we found across your financial institutions</SectionSubtitle>
                </HeaderGrid>
            </SectionHeader>

            {/* Type Filters */}
                <TypeFilters>
                    <TypeFilter 
                        $active={selectedType === 'all'} 
                        onClick={() => setSelectedType('all')}
                    >
                    All Accounts ({accounts.length})
                    </TypeFilter>
                    {uniqueTypes.map(type => (
                        <TypeFilter 
                            key={type}
                            $active={selectedType === type}
                            onClick={() => setSelectedType(type)}
                        >
                        {getAccountTypeLabel(type)} ({accounts.filter(acc => acc.type === type).length})
                        </TypeFilter>
                    ))}
                </TypeFilters>

            {/* Account List */}
            <AccountListContainer>
                {accounts
                    .filter(acc => selectedType === 'all' || acc.type === selectedType)
                    .map((acc) => (
                        <AccountCard 
                            key={acc.id}
                            account={acc}
                            isExpanded={expandedAccount === acc.id}
                            onToggle={handleAccountToggle}
                        />
            ))}
            </AccountListContainer>

            {/* Plaid Modal */}
            { plaidModal && (
                <PlaidModal 
                    isOpen={plaidModal}
                    onClose={() => setPlaidModal(false)}
                    onSuccess={() => {
                        setPlaidModal(false);
                        // Optionally refresh data or show success message
                    }}
                />
            )}
        </AccountListWrapper>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Entire Account List Wrapper.
const AccountListWrapper = styled.div.attrs(props => ({
    id: props.id
}))`
    width: 90%;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
    border: 3px solid transparent;
`;

// -------------------------------------------------------- Section Header.
const SectionHeader = styled.div`
    margin-bottom: 2rem;
`;
const HeaderGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;
const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
`;
const SectionTitle = styled.h2`
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
`;
const SectionSubtitle = styled.p`
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
`;
// -------------------------------------------------------- Add Menu.
const AddMenuWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const RefreshButton = styled.button`
    cursor: pointer;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border-radius: 50%;
    width: 65px;
    height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    border: none;
    margin-right: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    overflow: hidden;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
    }

    &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    &:not(:disabled):active {
        transform: translateY(0);
        transition: all 0.1s ease;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 4px 6px rgba(0, 0, 0, 0.34);
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
    
    &:not(:disabled):hover::before {
        left: 100%;
    }
`;
const AddButton = styled.button`
    cursor: pointer;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border-radius: 50%;
    width: 65px;
    height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    border: none;
    margin-right: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
        transform: translateY(0);
        transition: all 0.1s ease;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 4px 6px rgba(0, 0, 0, 0.34);
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
`;
const DropDownMenu = styled.div`
    min-width: 220px;
    margin-top: 8px;
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(182, 182, 182, 0.3);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    z-index: 100;
    backdrop-filter: blur(15px);
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

    &::before {
        content: '';
        position: absolute;
        top: -8px;
        right: 20px;
        width: 16px;
        height: 16px;
        background: rgba(255, 255, 255, 0.95);
        border-left: 1px solid rgba(182, 182, 182, 0.3);
        border-top: 1px solid rgba(182, 182, 182, 0.3);
        transform: rotate(45deg);
        z-index: -1;
    }
`;
const DropDownItem = styled.button`
    box-sizing: border-box;
    padding: 1rem 1.25rem;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    border: none;
    background: transparent;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;

    &:hover {
        background: rgba(100, 100, 100, 0.08);
        color: var(--button-primary);
    }

    &:active {
        background: rgba(100, 100, 100, 0.12);
        transform: scale(0.98);
    }

    &:focus {
        outline: none;
        background: rgba(100, 100, 100, 0.08);
    }
    
    &:first-child {
        border-radius: 16px 16px 0 0;
    }
    
    &:last-child {
        border-radius: 0 0 16px 16px;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.3s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;
const DropDownIcon = styled.span`
    font-size: 1.1rem;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    
    ${DropDownItem}:hover & {
        opacity: 1;
    }
`;
// -------------------------------------------------------- Type Filters.
const TypeFilters = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
`;
const TypeFilter = styled.button`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 25px;
    font: inherit;
    font-weight: 600;
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' 
        : 'rgba(255, 255, 255, 0.4)'};
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
        transform: translateY(0);
        transition: all 0.1s ease;
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
`;
// -------------------------------------------------------- Account List Container.
const AccountListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    width: 100%;
`;

// -------------------------------------------------------- Loading Message.
const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
`;

// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: rgb(220, 53, 69);
    background: rgba(255, 255, 255, 0.4);
    padding: 1rem;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
`;

export default AccountList;