// TableHeader.jsx

// This is the major sub-component for the Table, it serves to shorten the main TransactionTable file just becasue it
// was getting too long, and when I started implementing the filters too the logic was too complex all in one file. So,
// I modularized it a bunch, but this serves to have the title, refresh button, add menu with the add manual tx and 
// upload file options, as well as t he search bar, an active count display, entries per page dropdown, and then all of
// the filter dropdowns. I think it looks great, and I really like the way its set up, pretty simple and communicates
// the filters well.

// Imports.
import React, { useRef, useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faTags, faSearch, faFilter, faXmark, faPlus, faRotateRight, faCreditCard, faUpload, faCalendar, faChevronLeft, faChevronRight, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';

// Local Imports.
import '../../../styles/colors.css';
import FileUploadModal from '../../3FinanceConnect/Ways2Connect/UploadConnect/FileUploadModal';
import UploadResultModal from '../../3FinanceConnect/Ways2Connect/UploadConnect/UploadResultModal';
import DateFilter from './DateFilter';
import AmountFilter from './AmountFilter';
import AccountFilter from './AccountFilter';
import TypeFilter from './TypeFilter';
import TagFilter from './TagFilter';

// -------------------------------------------------------- AnimatedNumber Component.
const AnimatedNumber = ({ value, duration = 1.5 }) => {
    // Remember The Last Shown Number.
    const prev = useRef(value);

    return (
        <CountUp
            start={prev.current} // ← Animate *From* The Last Value.
            end={value}
            duration={duration}
            useEasing={true}
            separator=","
            onEnd={() => (prev.current = value)} // Keep The New Value For Next Time.
            preserveValue // Keeps The DOM Text Until Next Run.
        />
    );
};



// ------------------------------------------------------------------------------------------------ TableHeader Component.
const TableHeader = ({ 
    title,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    isSearchFocused,
    setIsSearchFocused,
    entriesPerPage,
    setEntriesPerPage,
    sortField,
    sortDirection,
    handleSort,
    getSortIcon,
    indexOfFirst,
    indexOfLast,
    sortedTransactionsLength,
    resultsInfoWidth,
    refreshLoading,
    handleRefresh,
    showAddMenu,
    setShowAddMenu,
    setManualTxModal,
    onRefresh,
    onUpload,
    existingAccounts,
    dateFilter,
    onDateFilterChange,
    amountFilter,
    onAmountFilterChange,
    accountFilter,
    onAccountFilterChange,
    typeFilter,
    onTypeFilterChange,
    tagFilter,
    onTagFilterChange
}) => {
    // Upload States.
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // Date Filter States.
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Amount Filter States.
    const [showAmountFilter, setShowAmountFilter] = useState(false);

    // Account Filter States.
    const [showAccountFilter, setShowAccountFilter] = useState(false);

    // Type Filter States.
    const [showTypeFilter, setShowTypeFilter] = useState(false);

    // Tag Filter States.
    const [showTagFilter, setShowTagFilter] = useState(false);

    // -------------------------------------------------------- Handle Click Outside Dropdown.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAddMenu && !event.target.closest('.add-menu-wrapper')) {
                setShowAddMenu(false);
            }
            if (showDateFilter && !event.target.closest('.date-filter-wrapper') && !event.target.closest('.date-filter-dropdown')) {
                setShowDateFilter(false);
            }
            if (showAmountFilter && !event.target.closest('.amount-filter-wrapper') && !event.target.closest('.amount-filter-dropdown')) {
                setShowAmountFilter(false);
            }
            if (showAccountFilter && !event.target.closest('.account-filter-wrapper') && !event.target.closest('.account-filter-dropdown')) {
                setShowAccountFilter(false);
            }
            if (showTypeFilter && !event.target.closest('.type-filter-wrapper') && !event.target.closest('.type-filter-dropdown')) {
                setShowTypeFilter(false);
            }
            if (showTagFilter && !event.target.closest('.tag-filter-wrapper') && !event.target.closest('.tag-filter-dropdown')) {
                setShowTagFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddMenu, showDateFilter, showAmountFilter, showAccountFilter, showTypeFilter, showTagFilter]);

    // -------------------------------------------------------- Handle Uploading Of CSV.
    const handleUpload = async (formData) => {
        try {
            const result = await onUpload(formData);
            return result.data; // Return The Data, Not The Full Result.
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    };

    // -------------------------------------------------------- Handle Upload Success.
    const handleUploadSuccess = (result) => {
        setUploadResult(result);
        setUploadModal(false);
        // Show Results Modal Instead Of Closing Immediately.
    };

    // -------------------------------------------------------- Handle Closing Upload Modal.
    const closeUploadModal = () => {
        setUploadModal(false);
    };

    // -------------------------------------------------------- Handle Results Close.
    const handleResultsClose = () => {
        setUploadResult(null);
        // Optionally Refresh Data Or Show Success Message.
    };

    // -------------------------------------------------------- Handle Date Filter Apply.
    const handleDateFilterApply = (filterData) => {
        onDateFilterChange(filterData);
    };

    // -------------------------------------------------------- Handle Amount Filter Apply.
    const handleAmountFilterApply = (filterData) => {
        onAmountFilterChange(filterData);
    };

    // -------------------------------------------------------- Handle Account Filter Apply.
    const handleAccountFilterApply = (filterData) => {
        onAccountFilterChange(filterData);
    };

    // -------------------------------------------------------- Handle Type Filter Apply.
    const handleTypeFilterApply = (filterData) => {
        onTypeFilterChange(filterData);
    };

    // -------------------------------------------------------- Handle Tag Filter Apply.
    const handleTagFilterApply = (filterData) => {
        onTagFilterChange(filterData);
    };

    // -------------------------------------------------------- Handle Clear All Filters.
    const handleClearAllFilters = () => {
        // Clear All Filter States.
        setShowDateFilter(false);
        setShowAmountFilter(false);
        setShowAccountFilter(false);
        setShowTypeFilter(false);
        setShowTagFilter(false);
        
        // Clear All Filter Data.
        onDateFilterChange(null);
        onAmountFilterChange(null);
        onAccountFilterChange(null);
        onTypeFilterChange(null);
        onTagFilterChange(null);
        
        // Reset Search Term.
        setSearchTerm('');
    };

    // -------------------------------------------------------- Get Date Filter Display Text.
    const getDateFilterText = () => {
        if (!dateFilter) return 'Date';
        
        if (dateFilter.mode === 'single') {
            return dateFilter.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        } else if (dateFilter.mode === 'range') {
            return `${dateFilter.startDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            })} - ${dateFilter.endDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            })}`;
        } else if (dateFilter.mode === 'month') {
            const month = new Date(2024, dateFilter.month, 1);
            return month.toLocaleDateString('en-US', { month: 'long' });
        }
        
        return 'Date';
    };

    // -------------------------------------------------------- Get Amount Filter Display Text.
    const getAmountFilterText = () => {
        if (!amountFilter) return 'Amount';
        
        const { minAmount, maxAmount } = amountFilter;
        
        if (minAmount && maxAmount) {
            return `$${minAmount} - $${maxAmount}`;
        } else if (minAmount) {
            return `$${minAmount}+`;
        } else if (maxAmount) {
            return `$${maxAmount}-`;
        }
        
        return 'Amount';
    };

    // -------------------------------------------------------- Get Account Filter Display Text.
    const getAccountFilterText = () => {
        if (!accountFilter || accountFilter.length === 0) return 'Account';
        
        if (accountFilter.length === 1) {
            const account = existingAccounts.find(acc => acc.id === accountFilter[0]);
            return account ? account.name : 'Account';
        }
        
        return `${accountFilter.length} Accounts`;
    };

    // -------------------------------------------------------- Get Type Filter Display Text.
    const getTypeFilterText = () => {
        if (!typeFilter) return 'Type';
        
        if (typeFilter.positiveOnly) return 'Positive Only';
        if (typeFilter.negativeOnly) return 'Negative Only';
        if (typeFilter.types && typeFilter.types.length > 0) {
            if (typeFilter.types.length === 1) {
                return typeFilter.types[0];
            }
            return `${typeFilter.types.length} Types`;
        }
        
        return 'Type';
    };

    // -------------------------------------------------------- Get Tag Filter Display Text.
    const getTagFilterText = () => {
        if (!tagFilter || !tagFilter.tagIds || tagFilter.tagIds.length === 0) return 'Tags';
        
        if (tagFilter.tagIds.length === 1) {
            return '1 Tag';
        }
        
        return `${tagFilter.tagIds.length} Tags`;
    };

    return (
        <>
            <TableHeaderContainer>
                <HeaderTitle>{title}</HeaderTitle>
                {/* Add Menu - Moved Outside TableContainer. */}
                <AddMenuWrapper className="add-menu-wrapper">
                    <RefreshButton 
                        onClick={handleRefresh} 
                        disabled={refreshLoading}
                        aria-label="Refresh Transactions"
                        title="Refresh Transactions"
                    >
                        <FontAwesomeIcon 
                            icon={faRotateRight} 
                            spin={refreshLoading}
                        />
                    </RefreshButton>
                    <AddButton 
                        onClick={() => setShowAddMenu(prev => !prev)} 
                        aria-label="Add New Transaction"
                        title="Add New Transaction"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </AddButton>
                    {showAddMenu && (
                        <DropDownMenu onClick={(e) => e.stopPropagation()}>
                            <DropDownItem onClick={() => {
                                setManualTxModal(true);
                                setShowAddMenu(false);
                            }}>
                                <DropDownIcon>
                                    <FontAwesomeIcon icon={faPlus} />
                                </DropDownIcon>
                                Add Manual Transaction
                            </DropDownItem>
                            <DropDownItem onClick={() => {
                                setUploadModal(true);
                                setShowAddMenu(false);
                            }}>
                                <DropDownIcon>
                                    <FontAwesomeIcon icon={faUpload} />
                                </DropDownIcon>
                                Upload File
                            </DropDownItem>
                        </DropDownMenu>
                    )}
                </AddMenuWrapper>
            </TableHeaderContainer>

            <HeaderControls>
                {/* Search Row. */}
                <SearchRow>
                    <ResultsInfo $maxWidth={resultsInfoWidth}>
                        Showing <b><AnimatedNumber value={indexOfFirst + 1} /></b> to <b><AnimatedNumber value={Math.min(indexOfLast, sortedTransactionsLength)} /></b> of <b><AnimatedNumber value={sortedTransactionsLength} /></b> transactions
                    </ResultsInfo>
                    <SearchContainer>
                        <SearchIcon $isFocused={isSearchFocused}>
                            <FontAwesomeIcon icon={faSearch} />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page when searching
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </SearchContainer>
                </SearchRow>

                {/* Controls Row. */}
                <ControlsRow>
                    <EntriesSelector>
                        <span>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </EntriesSelector>
                    
                    {/* Sorting Pills. */}
                    <SortingPills>
                        <PillWrapper className="date-filter-wrapper">
                            <FilterPill 
                                $isActive={!!dateFilter}
                                onClick={() => setShowDateFilter(prev => !prev)}
                            >
                                <span>{getDateFilterText()}</span>
                                <FontAwesomeIcon icon={dateFilter ? faCalendar : faFilter} />
                            </FilterPill>
                            {showDateFilter && (
                                <DateFilterWrapper>
                                    <DateFilter
                                        isOpen={showDateFilter}
                                        onClose={() => setShowDateFilter(false)}
                                        onApplyFilter={handleDateFilterApply}
                                        currentFilter={dateFilter}
                                    />
                                </DateFilterWrapper>
                            )}
                        </PillWrapper>
                        <PillWrapper className="amount-filter-wrapper">
                            <FilterPill 
                                $isActive={!!amountFilter}
                                onClick={() => setShowAmountFilter(prev => !prev)}
                            >
                                <span>{amountFilter ? getAmountFilterText() : 'Amount'}</span>
                                <FontAwesomeIcon icon={amountFilter ? faDollarSign : faFilter} />
                            </FilterPill>
                            {showAmountFilter && (
                                <AmountFilterWrapper>
                                    <AmountFilter
                                        isOpen={showAmountFilter}
                                        onClose={() => setShowAmountFilter(false)}
                                        onApplyFilter={handleAmountFilterApply}
                                        currentFilter={amountFilter}
                                    />
                                </AmountFilterWrapper>
                            )}
                        </PillWrapper>
                        <PillWrapper className="account-filter-wrapper">
                            <FilterPill 
                                $isActive={!!accountFilter}
                                onClick={() => setShowAccountFilter(prev => !prev)}
                            >
                                <span>{accountFilter ? getAccountFilterText() : 'Account'}</span>
                                <FontAwesomeIcon icon={accountFilter ? faCreditCard : faFilter} />
                            </FilterPill>
                            {showAccountFilter && (
                                <AccountFilterWrapper>
                                    <AccountFilter
                                        isOpen={showAccountFilter}
                                        onClose={() => setShowAccountFilter(false)}
                                        onApplyFilter={handleAccountFilterApply}
                                        currentFilter={accountFilter}
                                        existingAccounts={existingAccounts}
                                    />
                                </AccountFilterWrapper>
                            )}
                        </PillWrapper>
                        <PillWrapper className="type-filter-wrapper">
                            <FilterPill 
                                $isActive={!!typeFilter}
                                onClick={() => setShowTypeFilter(prev => !prev)}
                            >
                                <span>{typeFilter ? getTypeFilterText() : 'Type'}</span>
                                <FontAwesomeIcon icon={typeFilter ? faFilter : faFilter} />
                            </FilterPill>
                            {showTypeFilter && (
                                <TypeFilterWrapper>
                                    <TypeFilter
                                        isOpen={showTypeFilter}
                                        onClose={() => setShowTypeFilter(false)}
                                        onApplyFilter={handleTypeFilterApply}
                                        currentFilter={typeFilter}
                                    />
                                </TypeFilterWrapper>
                            )}
                        </PillWrapper>
                        <PillWrapper className="tag-filter-wrapper">
                            <FilterPill 
                                $isActive={!!tagFilter}
                                onClick={() => setShowTagFilter(prev => !prev)}
                            >
                                <span>{tagFilter ? getTagFilterText() : 'Tags'}</span>
                                <FontAwesomeIcon icon={tagFilter ? faTags : faFilter} />
                            </FilterPill>
                            {showTagFilter && (
                                <TagFilterWrapper>
                                    <TagFilter
                                        isOpen={showTagFilter}
                                        onClose={() => setShowTagFilter(false)}
                                        onApplyFilter={handleTagFilterApply}
                                        currentFilter={tagFilter}
                                    />
                                </TagFilterWrapper>
                            )}
                        </PillWrapper>
                        <FilterPill 
                            onClick={handleClearAllFilters}
                            $isActive={!!dateFilter || !!amountFilter || !!accountFilter || !!typeFilter || !!tagFilter || searchTerm}
                        >
                            <span>Clear All Filters</span>
                            <FontAwesomeIcon icon={faXmark} />
                        </FilterPill>
                    </SortingPills>
                </ControlsRow>
            </HeaderControls>

            {/* Upload Modal. */}
            { uploadModal && (
                <FileUploadModal
                    isOpen={uploadModal}
                    onClose={closeUploadModal}
                    onUpload={handleUpload}
                    onSuccess={handleUploadSuccess}
                    existingAccounts={existingAccounts}
                />
            )}

            {/* Upload Results Modal. */}
            { uploadResult && (
                <UploadResultModal
                    isOpen={!!uploadResult}
                    onClose={handleResultsClose}
                    uploadResult={uploadResult}
                />
            )}
        </>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Table Header Container.
const TableHeaderContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: visible;
    padding: 2rem 2rem 0 2rem; /* Match AccountList padding */
`;
// -------------------------------------------------------- Header Title. ("Transaction History").
const HeaderTitle = styled.h2`
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-secondary);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    position: relative;
    z-index: 1;
`;
// -------------------------------------------------------- Header Controls (Search Row & Controls Row).
const HeaderControls = styled.div`
    width: 100%;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    z-index: 1;
    margin-right: 4rem; /* Make room for the AddMenuWrapper */
`;
// -------------------------------------------------------- Search Row. (ResultsInfo & SearchContainer).
const SearchRow = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
`;
// -------------------------------------------------------- ResultsInfo. (Showing #1 to #10 of #100 transactions).
const ResultsInfo = styled.div`
    padding: 0.75rem 1.5rem;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    border-radius: 24px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    transition: all 0.4s ease;
    width: ${props => props.$maxWidth || 300}px;
    min-width: ${props => props.$maxWidth || 300}px;
    white-space: nowrap;
    text-align: center;
    
    b {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        font-weight: 700;
    }

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
    }
`;
// -------------------------------------------------------- SearchContainer. (SearchIcon & SearchInput).
const SearchContainer = styled.div`
    position: relative;
    display: flex;
    justify-self: flex-end;
    align-items: center;
    padding: 0.75rem 2rem 0.75rem 1.5rem;
    border-radius: 24px;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    width: 97%;
    transition: all 0.4s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
    }
`;
// -------------------------------------------------------- SearchIcon. (FontAwesomeIcon).
const SearchIcon = styled.div`
    font-size: 1rem;
    color: var(--text-secondary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 2;
`;
// -------------------------------------------------------- SearchInput. (FontAwesomeIcon).
const SearchInput = styled.input`
    font: inherit;
    width: 100%;
    margin-left: 0.75rem;
    border: none;
    background: transparent;
    color: rgba(0, 0, 0, 1);
    font-size: 0.95rem;
    transition: all 0.3s ease;
    
    &::placeholder {
        color: #999;
        opacity: 0.8;
    }

    &:focus {
        outline: none;
        border: none;
    }
`;
// -------------------------------------------------------- ControlsRow. (EntriesSelector & SortingPills).
const ControlsRow = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
    margin-bottom: 0.75rem
`;
// -------------------------------------------------------- EntriesSelector. (Show # entries)
const EntriesSelector = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
    border-radius: 24px;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    transition: all 0.3s ease;
    
    padding: 0.4rem 1.5rem;
    
    span {
        font-weight: 500;
    }
    
    select {
        font: inherit;
        padding: 0.15rem 0.75rem;
        border-radius: 8px;
        border: 2px solid #e0e0e0;
        background: white;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.4s ease;
        
        &:hover {
            border-color: #ccc;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        &:focus {
            outline: none;
            border: 2px solid transparent;
            background: linear-gradient(white, white) padding-box,
                        linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
    }

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
    }
`;
// -------------------------------------------------------- SortingPills. (Date, Vendor, Amount, Category, Account, Clear All Filters)
const SortingPills = styled.div`
    margin-left: 4.7rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1000;
    transition: all 0.4s ease;
    flex-wrap: wrap;
    max-width: calc(100% - 4.7rem)
`;
// -------------------------------------------------------- FilterPill. (Date, Vendor, Amount, Category, Account, Clear All Filters)
const FilterPill = styled.button`
    background: ${props => props.$isActive 
        ? 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' 
        : 'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box'
    };
    border: 2px solid transparent;
    border-radius: 24px;
    padding: 0.75rem 1.5rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.4s ease-in-out;
    color: ${props => props.$isActive ? 'white' : 'var(--text-primary)'};
    position: relative;
    overflow: hidden;

    span {
        padding-right: 0.5rem;
    }
    
    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
    }
    
    &:active {
        transform: translateY(0);
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
// -------------------------------------------------------- AddMenuWrapper. (RefreshButton, AddButton, DropDownMenu)
const AddMenuWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`;
// -------------------------------------------------------- Refresh Button.
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
// -------------------------------------------------------- Add Button. (Add New Transaction)
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
// -------------------------------------------------------- DropDownMenu. (Add Manual Transaction)
const DropDownMenu = styled.div`
    z-index: 9999;
    min-width: 220px;
    margin-top: 8px;
    position: absolute;
    top: 100%;
    right: 2.5%;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(182, 182, 182, 0.3);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
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
// -------------------------------------------------------- DropDownItem. (Add Manual Transaction)
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
// -------------------------------------------------------- DropDownIcon.
const DropDownIcon = styled.span`
    font-size: 1.1rem;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    
    ${DropDownItem}:hover & {
        opacity: 1;
    }
`;
// -------------------------------------------------------- DateFilterWrapper.
const PillWrapper = styled.div`
    position: relative;
    display: inline-block;
`;
// -------------------------------------------------------- DateFilterWrapper.
const DateFilterWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: -100%;
    z-index: 1000;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

// -------------------------------------------------------- AmountFilterWrapper.
const AmountFilterWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: -60%;
    z-index: 1000;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

// -------------------------------------------------------- AccountFilterWrapper.
const AccountFilterWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: -60%;
    z-index: 1000;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

// -------------------------------------------------------- TypeFilterWrapper.
const TypeFilterWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: -100%;
    z-index: 1000;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

// -------------------------------------------------------- TagFilterWrapper.
const TagFilterWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: -100%;
    z-index: 1000;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;
// -------------------------------------------------------- Export TableHeader Component.
export default TableHeader;
