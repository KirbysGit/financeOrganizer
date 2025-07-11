// Imports.
import React, { useRef, useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faSearch, faFilter, faXmark, faPlus, faRotateRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';

// Local Imports.
import '../../../styles/colors.css';
import FileUploadModal from '../../3FinanceConnect/Ways2Connect/UploadConnect/FileUploadModal';
import UploadResultModal from '../../3FinanceConnect/Ways2Connect/UploadConnect/UploadResultModal';

// -------------------------------------------------------- AnimatedNumber Component.
const AnimatedNumber = ({ value, duration = 1.5 }) => {
    const prev = useRef(value); // remember the last shown number

    return (
        <CountUp
            start={prev.current} // ← animate *from* the last value
            end={value}
            duration={duration}
            useEasing={true}
            separator=","
            onEnd={() => (prev.current = value)} // keep the new value for next time
            preserveValue // keeps the DOM text until next run
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
    existingAccounts
}) => {
    // Upload States
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // -------------------------------------------------------- Handle Uploading Of CSV.
    const handleUpload = async (formData) => {
        try {
            const result = await onUpload(formData);
            return result.data; // Return the data, not the full result
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    };

    // -------------------------------------------------------- Handle Upload Success.
    const handleUploadSuccess = (result) => {
        setUploadResult(result);
        setUploadModal(false);
        // Show results modal instead of closing immediately
    };

    // -------------------------------------------------------- Handle Closing Upload Modal.
    const closeUploadModal = () => {
        setUploadModal(false);
    };

    // -------------------------------------------------------- Handle Results Close.
    const handleResultsClose = () => {
        setUploadResult(null);
        // Optionally refresh data or show success message
    };

    return (
        <>
            <TableHeaderContainer>
                <HeaderTitle>{title}</HeaderTitle>
                {/* Add Menu - Moved outside TableContainer */}
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
                {/* Search Row */}
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

                {/* Controls Row */}
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
                    
                    <SortingPills>
                        <FilterPill>
                            <span>Date</span>
                            <FontAwesomeIcon icon={faFilter} />
                        </FilterPill>
                        <FilterPill>
                            <span>Vendor</span>
                            <FontAwesomeIcon icon={faFilter} />
                        </FilterPill>
                        <FilterPill>
                            <span>Amount</span>
                            <FontAwesomeIcon icon={faFilter} />
                        </FilterPill>
                        <FilterPill>
                            <span>Category</span>
                            <FontAwesomeIcon icon={faFilter} />
                        </FilterPill>
                        <FilterPill>
                            <span>Account</span> 
                            <FontAwesomeIcon icon={faFilter} />
                        </FilterPill>
                        <FilterPill>
                            <span>Clear All Filters</span>
                            <FontAwesomeIcon icon={faXmark} />
                        </FilterPill>
                    </SortingPills>
                </ControlsRow>
            </HeaderControls>

            {/* Upload Modal */}
            { uploadModal && (
                <FileUploadModal
                    isOpen={uploadModal}
                    onClose={closeUploadModal}
                    onUpload={handleUpload}
                    onSuccess={handleUploadSuccess}
                    existingAccounts={existingAccounts}
                />
            )}

            {/* Upload Results Modal */}
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

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Table Header.
const TableHeaderContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: visible;
    padding: 2rem 2rem 0 2rem; /* Match AccountList padding */
`;
// -------------------------------------------------------- Header Title. ("Transaction History")
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
// -------------------------------------------------------- Header Controls (Search Row & Controls Row)
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
// -------------------------------------------------------- Search Row. (ResultsInfo & SearchContainer)
const SearchRow = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
`;
// -------------------------------------------------------- ResultsInfo. (Showing #1 to #10 of #100 transactions)
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
// -------------------------------------------------------- SearchContainer. (SearchIcon & SearchInput)
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
// -------------------------------------------------------- SearchIcon. (FontAwesomeIcon)
const SearchIcon = styled.div`
    font-size: 1rem;
    color: var(--text-secondary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 2;
`;
// -------------------------------------------------------- SearchInput. (FontAwesomeIcon)
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
// -------------------------------------------------------- ControlsRow. (EntriesSelector & SortingPills)
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
    z-index: 1;
    transition: all 0.4s ease;
    flex-wrap: wrap;
    max-width: calc(100% - 4.7rem)
`;
// -------------------------------------------------------- FilterPill. (Date, Vendor, Amount, Category, Account, Clear All Filters)
const FilterPill = styled.button`
    background: linear-gradient(white, white) padding-box, 
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
    border: 2px solid transparent;
    border-radius: 24px;
    padding: 0.75rem 1.5rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.4s ease-in-out;
    color: var(--text-primary);
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
// -------------------------------------------------------- Export TableHeader Component.
export default TableHeader;
