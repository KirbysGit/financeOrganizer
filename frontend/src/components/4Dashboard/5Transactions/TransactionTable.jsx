// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faPlus, faTrash, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import TableHeader from './TableHeader';
import ManualTxModal from '../../3FinanceConnect/Ways2Connect/ManualConnect/ManualTxModal';

// ------------------------------------------------------------------------------------------------ TransactionTable Component.
const TransactionTable = ({ transactions, onDelete, onRefresh, id, existingAccounts = [], onUpload }) => {
    // States.
    const [currentPage, setCurrentPage] = useState(1);                          // Use State 4 Setting Pages. Default Page #1.
    const [entriesPerPage, setEntriesPerPage] = useState(10);                   // Use State 4 Amount Of Entries Per Page. Default Page #10.
    const [selectedIds, setSelectedIds] = useState(new Set());                  // Use State 4 Storing All Transactions That Are Selected.
    const [txDetails, setTxDetails] = useState(null);                           // Use State 4 Storing Which Transaction Has Details Expanded.
    const [showAddMenu, setShowAddMenu] = useState(false);                      // State 4 Whether Add Menu Is Open.
    const [manualTxModal, setManualTxModal] = useState(false);                  // State 4 Whether Manual Transaction Modal Is Open.
    const [refreshLoading, setRefreshLoading] = useState(false);                // State 4 Whether Refresh Is Loading.
    
    // Search and Sorting States.
    const [searchTerm, setSearchTerm] = useState('');                           // State 4 Search Functionality.
    const [sortField, setSortField] = useState('date');                         // State 4 Current Sort Field.
    const [sortDirection, setSortDirection] = useState('desc');                 // State 4 Sort Direction (asc/desc).
    const [isSearchFocused, setIsSearchFocused] = useState(false);              // State 4 Search Input Focus.
    
    // State for ResultsInfo Width Calculation.
    const [resultsInfoWidth, setResultsInfoWidth] = useState(0);

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

    // -------------------------------------------------------- Handle Manual Transaction Success.
    const handleManualTxSuccess = () => {
        setManualTxModal(false);
        window.location.reload(); // Simple Refresh For Now.
    };

    // -------------------------------------------------------- Handle Refresh Transactions.
    const handleRefresh = async () => {
        if (!onRefresh || refreshLoading) return;
        
        setRefreshLoading(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Failed to refresh transactions:', error);
        } finally {
            setRefreshLoading(false);
        }
    };

    // -------------------------------------------------------- Handle Request To Change Page.
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // -------------------------------------------------------- Handle Formatting Of Amount Field.
    const formatAmount = (amount) => {
        const absAmount = Math.abs(amount);
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(absAmount);

        return amount < 0 ? `-${formatted}` : formatted;
    }

    // -------------------------------------------------------- Handle Selection Of Transactions.
    const toggleSelection = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        })
    }

    // -------------------------------------------------------- Handle Text Truncation With Tooltip.
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // -------------------------------------------------------- Format Date For Better Display.
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // -------------------------------------------------------- Search & Filter Logic.
    const filteredTransactions = transactions.filter(tx => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            tx.vendor?.toLowerCase().includes(searchLower) ||
            tx.description?.toLowerCase().includes(searchLower) ||
            tx.category_primary?.toLowerCase().includes(searchLower) ||
            tx.account_details?.name?.toLowerCase().includes(searchLower) ||
            formatAmount(tx.amount).includes(searchTerm) ||
            formatDate(tx.date).toLowerCase().includes(searchLower)
        );
    });

    // -------------------------------------------------------- Sorting Logic.
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortField) {
            case 'date':
                aValue = new Date(a.date);
                bValue = new Date(b.date);
                break;
            case 'vendor':
                aValue = a.vendor?.toLowerCase() || '';
                bValue = b.vendor?.toLowerCase() || '';
                break;
            case 'description':
                aValue = a.description?.toLowerCase() || '';
                bValue = b.description?.toLowerCase() || '';
                break;
            case 'amount':
                aValue = Math.abs(a.amount);
                bValue = Math.abs(b.amount);
                break;
            case 'category':
                aValue = a.category_primary?.toLowerCase() || '';
                bValue = b.category_primary?.toLowerCase() || '';
                break;
            case 'account':
                aValue = a.account_details?.name?.toLowerCase() || '';
                bValue = b.account_details?.name?.toLowerCase() || '';
                break;
            default:
                aValue = a[sortField] || '';
                bValue = b[sortField] || '';
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // -------------------------------------------------------- Handle Sort Change.
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    // -------------------------------------------------------- Get Sort Icon.
    const getSortIcon = (field) => {
        if (sortField !== field) return faSort;
        return sortDirection === 'asc' ? faSortUp : faSortDown;
    };

    // -------------------------------------------------------- Update Pagination To Use Sorted & Filtered Transactions.
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentTransactions = sortedTransactions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(sortedTransactions.length / entriesPerPage);

    // -------------------------------------------------------- Calculate Maximum Width For ResultsInfo.
    const calculateMaxResultsInfoWidth = () => {
        // Calculate The Maximum Possible Values For The Three Numbers.
        // Use Original Transactions.length, Not Filtered Length, To Keep Width Consistent.
        const maxStart = Math.max(1, transactions.length);
        const maxEnd = Math.max(1, transactions.length);
        const maxTotal = Math.max(1, transactions.length);
        
        // Create The Text With Maximum Values To Measure.
        const maxText = `Showing ${maxStart.toLocaleString()} to ${maxEnd.toLocaleString()} of ${maxTotal.toLocaleString()} transactions`;
        
        // Create A Temporary Element To Measure The Width.
        const tempElement = document.createElement('div');
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontSize = '0.9rem';
        tempElement.style.fontWeight = '500';
        tempElement.style.fontFamily = 'inherit';
        tempElement.textContent = maxText;
        
        // Append The Temporary Element To The Body.
        document.body.appendChild(tempElement);
        const maxWidth = tempElement.offsetWidth;
        document.body.removeChild(tempElement);
        
        // Add Padding And Border Width.
        return maxWidth + 60; // 30px Padding On Each Side + Some Buffer.
    };

    // -------------------------------------------------------- Update ResultsInfo Width When Data Changes.
    useEffect(() => {
        const newWidth = calculateMaxResultsInfoWidth();
        if (newWidth !== resultsInfoWidth) {
            setResultsInfoWidth(newWidth);
        }
    }, [transactions.length, entriesPerPage]);

    // -------------------------------------------------------- Empty State Card.
    if (transactions.length === 0) {
        return (
            <TransactionsWrapper id={id}>
                <EmptyStateCard>
                    <EmptyIcon>📊</EmptyIcon>
                    <EmptyTitle>No Transactions Yet...</EmptyTitle>
                    <EmptyDescription>Start by uploading a CSV file or adding transactions manually.</EmptyDescription>
                    <EmptyStateAddButton 
                        onClick={() => setManualTxModal(true)}
                        aria-label="Add Manual Transaction"
                        title="Add Manual Transaction"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </EmptyStateAddButton>
                </EmptyStateCard>
            </TransactionsWrapper>
        )
    }

    return (
        <TransactionsWrapper id={id} $entriesPerPage={entriesPerPage}>
            <TableHeader
                title="Transaction History"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setCurrentPage={setCurrentPage}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                entriesPerPage={entriesPerPage}
                setEntriesPerPage={setEntriesPerPage}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                getSortIcon={getSortIcon}
                indexOfFirst={indexOfFirst}
                indexOfLast={indexOfLast}
                sortedTransactionsLength={sortedTransactions.length}
                resultsInfoWidth={resultsInfoWidth}
                refreshLoading={refreshLoading}
                handleRefresh={handleRefresh}
                showAddMenu={showAddMenu}
                setShowAddMenu={setShowAddMenu}
                setManualTxModal={setManualTxModal}
                onRefresh={onRefresh}
                onUpload={onUpload}
                existingAccounts={existingAccounts}
            />

            <TableContainer $entriesPerPage={entriesPerPage}>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <SortableHeader 
                                $isActive={sortField === 'date'}
                                onClick={() => handleSort('date')}
                            >
                                Date
                                <SortIcon>
                                    <FontAwesomeIcon icon={getSortIcon('date')} />
                                </SortIcon>
                            </SortableHeader>
                            <SortableHeader 
                                $isActive={sortField === 'vendor'}
                                onClick={() => handleSort('vendor')}
                            >
                                Vendor
                                <SortIcon>
                                    <FontAwesomeIcon icon={getSortIcon('vendor')} />
                                </SortIcon>
                            </SortableHeader>
                            <SortableHeader 
                                $isActive={sortField === 'description'}
                                onClick={() => handleSort('description')}
                            >
                                Description
                                <SortIcon>
                                    <FontAwesomeIcon icon={getSortIcon('description')} />
                                </SortIcon>
                            </SortableHeader>
                            <SortableHeader 
                                $isActive={sortField === 'amount'}
                                onClick={() => handleSort('amount')}
                            >
                                Amount
                                <SortIcon>
                                    <FontAwesomeIcon icon={getSortIcon('amount')} />
                                </SortIcon>
                            </SortableHeader>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTransactions.map((tx, index) => (
                            <React.Fragment key={tx.id}>
                                <ExpandableRow $isSelected={selectedIds.has(tx.id)} $isExpanded={txDetails === tx.id} $rowIndex={index}>
                                    <td className="checkBox">
                                        <CustomCheckbox 
                                            $isChecked={selectedIds.has(tx.id)}
                                            onClick={() => toggleSelection(tx.id)}
                                        >
                                            <CheckboxInput
                                                type="checkbox"
                                                checked={selectedIds.has(tx.id)}
                                                onChange={() => toggleSelection(tx.id)}
                                            />
                                            <CheckboxIndicator $isChecked={selectedIds.has(tx.id)}>
                                                {selectedIds.has(tx.id) && <CheckMark>✓</CheckMark>}
                                            </CheckboxIndicator>
                                        </CustomCheckbox>
                                    </td>
                                    <td className="date" title={tx.date}>
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="vendor" title={tx.vendor}>
                                        {truncateText(tx.vendor, 30)}
                                    </td>
                                    <td className="description" title={tx.description}>
                                        {truncateText(tx.description, 50)}
                                    </td>
                                    <AmountCell $isPos={tx.amount >= 0}>
                                        {formatAmount(tx.amount)}
                                    </AmountCell>
                                    <ActionsCell>
                                        <ActionButton 
                                            onClick={() => setTxDetails(txDetails === tx.id ? null : tx.id)}
                                            $isExpanded={txDetails === tx.id}
                                        >
                                            <FontAwesomeIcon icon={txDetails === tx.id ? faChevronUp : faChevronDown} />
                                        </ActionButton>
                                        <DeleteButton onClick={() => onDelete(tx.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </DeleteButton>
                                    </ActionsCell>
                                </ExpandableRow>
                                {txDetails === tx.id && (
                                    <DetailsRow $rowIndex={index}>
                                        <ExpandedSelect>
                                        </ExpandedSelect>
                                        <ExpandedDetails colSpan="5">
                                            <DetailsContainer>
                                                <DetailsList>
                                                    <DetailItem>
                                                        <DetailLabel>Type</DetailLabel>
                                                        <DetailValue>{tx.category_primary || 'N/A'}</DetailValue>
                                                    </DetailItem>
                                                    <DetailItem>
                                                        <DetailLabel>File</DetailLabel>
                                                        <DetailValue>{tx.file || 'Manual entry'}</DetailValue>
                                                    </DetailItem>
                                                    {tx.account_details && (
                                                        <>
                                                            <DetailItem>
                                                                <DetailLabel>Account</DetailLabel>
                                                                <DetailValue>
                                                                    {tx.account_details.name || 'Unknown Account'}
                                                                    {tx.account_details.mask && ` (****${tx.account_details.mask})`}
                                                                </DetailValue>
                                                            </DetailItem>
                                                            <DetailItem>
                                                                <DetailLabel>Account Type</DetailLabel>
                                                                <DetailValue>
                                                                    {tx.account_details.subtype ? 
                                                                        `${tx.account_details.subtype} (${tx.account_details.type})` : 
                                                                        tx.account_details.type || 'N/A'
                                                                    }
                                                                </DetailValue>
                                                            </DetailItem>
                                                        </>
                                                    )}
                                                    {tx.institution_details && (
                                                        <DetailItem>
                                                            <DetailLabel>Institution</DetailLabel>
                                                            <DetailValue>{tx.institution_details.name || 'Unknown Institution'}</DetailValue>
                                                        </DetailItem>
                                                    )}
                                                </DetailsList>
                                                <TagsSection>
                                                    <TagsHeader>Transaction Tags</TagsHeader>
                                                    <TagsPlaceholder>No tags assigned yet</TagsPlaceholder>
                                                </TagsSection>
                                            </DetailsContainer>
                                        </ExpandedDetails>
                                    </DetailsRow>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </StyledTable>
            </TableContainer>

            <PaginationContainer>
                <Pagination>
                    <PageButton onClick={() => changePage(1)} disabled={currentPage === 1}>
                        First
                    </PageButton>
                    <PageButton onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                        ← Prev
                    </PageButton>
                    <PageInfo>
                        Page {currentPage} of {totalPages}
                    </PageInfo>
                    <PageButton onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next →
                    </PageButton>
                    <PageButton onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>
                        Last
                    </PageButton>
                </Pagination>
            </PaginationContainer>

            {/* Manual Transaction Modal */}
            {manualTxModal && (
                <ManualTxModal
                    isOpen={manualTxModal}
                    onClose={() => setManualTxModal(false)}
                    onSuccess={handleManualTxSuccess}
                    existingAccounts={existingAccounts}
                />
            )}
        </TransactionsWrapper>
    );
};

// -------------------------------------------------------- Entire Transaction Table Container.
const TransactionsWrapper = styled.div.attrs(props => ({
    id: props.id
}))`
    width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    border: 3px solid transparent;
    padding: 0 0 1.5rem 0; /* Remove top padding since TableHeader has it */
    position: relative;
    overflow: visible;
    min-height: ${props => {
        // Calculate minimum height for the entire container
        // Header: ~200px, Controls: ~150px, Table area: calculated, Pagination: ~80px
        const headerHeight = 200;
        const controlsHeight = 150;
        const paginationHeight = 80;
        const rowHeight = 60;
        const tableHeaderHeight = 80;
        const buffer = 40;
        const tableAreaHeight = (props.$entriesPerPage * rowHeight) + tableHeaderHeight + buffer;
        return `${headerHeight + controlsHeight + tableAreaHeight + paginationHeight}px`;
    }};
`
// -------------------------------------------------------- Table Container.
const TableContainer = styled.div`
    overflow: visible;
    position: relative;
    padding: 0 1.5rem 0.5rem 1.5rem;
    flex: 1;
    min-height: ${props => {
        // Calculate Minimum Height Based On Entries Per Page.
        // Each Row Is Approximately 60px (Including Padding And Borders).
        // Header Is Approximately 80px.
        // Add Some Buffer For Expanded Rows.
        const rowHeight = 60;
        const headerHeight = 80;
        const buffer = 40;
        return `${(props.$entriesPerPage * rowHeight) + headerHeight + buffer}px`;
    }};
    display: flex;
    flex-direction: column;
`
// -------------------------------------------------------- Empty State Card.
const EmptyStateCard = styled.div`
    width: 100%;
    padding: 4rem 2rem;
    margin: 2rem auto;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.4);
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border: 3px solid transparent;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border-radius: 16px;
        pointer-events: none;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
`
const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
`
const EmptyTitle = styled.h3`
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`
const EmptyDescription = styled.p`
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`
const EmptyStateAddButton = styled.button`
    cursor: pointer;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    border: none;
    margin: 0 auto;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    position: relative;
    overflow: hidden;
    z-index: 1;

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

// -------------------------------------------------------- Table Wrapper.
const StyledTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.95rem;
    line-height: 1.5;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;

    /* Column widths for better spacing */
    th:nth-child(1), td:nth-child(1) { width: 120px; }      /* Select */
    th:nth-child(2), td:nth-child(2) { width: 120px; }     /* Date */
    th:nth-child(3), td:nth-child(3) { width: auto; }      /* Vendor */
    th:nth-child(4), td:nth-child(4) { width: 250px; }     /* Description */
    th:nth-child(5), td:nth-child(5) { width: 180px; }     /* Amount */
    th:nth-child(6), td:nth-child(6) { width: 200px; }     /* Actions */


    &:last-child {
            border-bottom-right-radius: 16px;
            border-bottom-left-radius: 16px;
    }

    thead {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        position: relative;
    }

    th {
        &:nth-child(1) {
            border-top-left-radius: 16px;
        }
        &:nth-child(6) {
            border-top-right-radius: 16px;
        }
        font-weight: 600;
        text-align: center;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: white;
        padding: 1.25rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
        z-index: 1;
    }

    td {
        font-weight: 400;
        padding: 1rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        position: relative;
        z-index: 1;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    tbody tr:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .checkBox {
        border-right: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        text-align: center;
        padding: 1rem 0.5rem;
    }

    .date {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .vendor {
        font-weight: 500;
        color: var(--text-primary);
        text-align: left;
        padding-left: 1.5rem;
    }

    .description {
        font-weight: 400;
        color: var(--text-secondary);
        text-align: left;
        padding-left: 1.5rem;
        font-size: 0.9rem;
    }
`
// -------------------------------------------------------- Amount Cell.
const AmountCell = styled.td`
    text-align: right;
    font-weight: 600;
    font-size: 1rem;
    color: ${(props) => (props.$isPos ? 'var(--amount-positive)' : 'var(--amount-negative)')};
    padding-right: 1.5rem;
`
// -------------------------------------------------------- Actions Cell. (Details, Delete)
const ActionsCell = styled.td`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0.75rem !important;
`
// -------------------------------------------------------- Action Button. (Expand Row)
const ActionButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-secondary);
    
    &:hover {
        background: var(--button-primary);
        border-color: var(--button-primary);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`
// -------------------------------------------------------- Delete Button. (Delete Transaction)
const DeleteButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-secondary);
    
    &:hover {
        background: var(--amount-negative);
        border-color: var(--amount-negative);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`

// -------------------------------------------------------- Details Row Components.
const ExpandableRow = styled.tr`
    background: ${(props) => {
        if (props.$isSelected) return 'rgba(0, 123, 255, 0.1)';
        if (props.$isExpanded) return 'rgba(255, 255, 255, 0.05)';
        return props.$rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
    }};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: ${(props) => props.$isSelected ? '4px solid var(--button-primary)' : '4px solid transparent'};
    position: relative;
    z-index: 1;

    &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`
// -------------------------------------------------------- Expanded Details. (Details Container)
const ExpandedDetails = styled.td`
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    position: relative;
    z-index: 1;
    
    /* Create the expanding effect */
    animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 300px;
        }
    }
`
// -------------------------------------------------------- Details Container. (DetailsItem, DetailLabel, DetailValue)
const DetailsContainer = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin: 0.75rem;
    padding: 1.5rem;
    transform: translateY(0);
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 100%;
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`
const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`
const DetailLabel = styled.span`
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
`
const DetailValue = styled.span`
    font-weight: 400;
    font-size: 0.95rem;
    color: var(--text-primary);
    word-wrap: break-word;
    line-height: 1.5;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
`
const DetailsRow = styled.tr`
    background: rgba(255, 255, 255, 0.02);
    transition: background-color 0.3s ease;
    position: relative;
    z-index: 1;
`
const DetailsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`
// -------------------------------------------------------- Tags Section. (TagsHeader, TagsPlaceholder)
const TagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`
const TagsHeader = styled.h3`
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
`
const TagsPlaceholder = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-style: italic;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.3);
`

// -------------------------------------------------------- Pagination Components.
const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 1.5rem;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.34);
    border-radius: 16px;
    border: 3px solid transparent;
    position: relative;
    overflow: hidden;
    width: max-content;
    margin: 0 auto;
    margin-top: auto;
`
const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
`
const PageButton = styled.button`
    background: rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-primary);
    font: inherit;
    
    &:disabled {
        background: rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.05);
        color: var(--text-secondary);
        cursor: not-allowed;
        opacity: 0.5;
    }

    &:not(:disabled):hover {
        background: var(--button-primary);
        border-color: var(--button-primary);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    &:not(:disabled):active {
        transform: translateY(0);
    }
`
const PageInfo = styled.span`
    padding: 0.75rem 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
`

// -------------------------------------------------------- Custom Checkbox Components.
const CustomCheckbox = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        transform: scale(1.05);
    }
`
const CheckboxInput = styled.input`
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    cursor: pointer;
`
const CheckboxIndicator = styled.div`
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 6px;
    background: ${props => props.$isChecked ? 'var(--button-primary)' : 'rgba(255, 255, 255, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }
    
    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        
        &::before {
            width: 100%;
            height: 100%;
        }
    }
    
    ${props => props.$isChecked && `
        animation: checkboxPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
        @keyframes checkboxPop {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
    `}
`
const CheckMark = styled.span`
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
    animation: checkmarkSlide 0.3s ease-out;
    
    @keyframes checkmarkSlide {
        0% {
            opacity: 0;
            transform: translateY(-3px) scale(0.8);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`

// -------------------------------------------------------- Expanded Select. (Spacing For Select Column For Expanded Row)
const ExpandedSelect = styled.td`
    border-right: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    text-align: center;
    padding: 1rem 0.5rem;
    position: relative;
    z-index: 1;
`
// -------------------------------------------------------- Sortable Table Header. (Date, Vendor, Amount)
const SortableHeader = styled.th`
    cursor: pointer;
    transition: all 0.3s ease;
    color: ${props => props.$isActive ? 'white' : 'white'};
    font-weight: ${props => props.$isActive ? '700' : '600'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 1.25rem 1rem;
    border-bottom: ${props => props.$isActive ? '2px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'};
    position: relative;
    z-index: 1;

    &:hover {
        color: white;
        font-weight: 700;
    }
`;
const SortIcon = styled.span`
    font-size: 0.9rem;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    margin-left: 0.5rem;

    ${SortableHeader}:hover & {
        opacity: 1;
    }
`;

export default TransactionTable;