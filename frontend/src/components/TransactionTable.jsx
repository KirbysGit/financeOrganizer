// Imports.
import React from 'react';
import { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../styles/colors.css';

// ------------------------------------------------------------------------------------------------ TransactionTable Component.
const TransactionTable = ({ transactions, onDelete, id }) => {
    // States.
    const [currentPage, setCurrentPage] = useState(1);                          // Use State 4 Setting Pages. Default Page #1.
    const [entriesPerPage, setEntriesPerPage] = useState(10);                   // Use State 4 Amount Of Entries Per Page. Default Page #10.
    const [selectedIds, setSelectedIds] = useState(new Set());                  // Use State 4 Storing All Transactions That Are Selected.
    const [txDetails, setTxDetails] = useState(null);                           // Use State 4 Storing Which Transaction Has Details Expanded.

    const indexOfLast = currentPage * entriesPerPage;                           // Get Index Of Last Item On Page.
    const indexOfFirst = indexOfLast - entriesPerPage;                          // Get Index Of First Item On Page.
    const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);  // Get Current Transactions On Page.
    const totalPages = Math.ceil(transactions.length / entriesPerPage);         // Get Total Pages.

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

    if (transactions.length === 0) {
        return (
            <TransactionsWrapper id={id}>
                <EmptyStateCard>
                    <EmptyIcon>📊</EmptyIcon>
                    <EmptyTitle>No Transactions Yet...</EmptyTitle>
                    <EmptyDescription>Start by uploading a CSV file or adding transactions manually.</EmptyDescription>
                </EmptyStateCard>
            </TransactionsWrapper>
        )
    }

    return (
        <TransactionsWrapper id={id}>
            <TableHeader>
                <HeaderTitle>Transaction History</HeaderTitle>
                <HeaderControls>
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
                    <ResultsInfo>
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, transactions.length)} of {transactions.length} transactions
                    </ResultsInfo>
                </HeaderControls>
            </TableHeader>

            <TableContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Date</th>
                            <th>Vendor</th>
                            <th>Amount</th>
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
                                        <ExpandedSelect></ExpandedSelect>
                                        <ExpandedDetails colSpan="4">
                                            <DetailsContainer>
                                                <DetailsList>
                                                    <DetailItem>
                                                        <DetailLabel>Description</DetailLabel>
                                                        <DetailValue>{tx.description || 'No description available'}</DetailValue>
                                                    </DetailItem>
                                                    <DetailItem>
                                                        <DetailLabel>Type</DetailLabel>
                                                        <DetailValue>{tx.type || 'N/A'}</DetailValue>
                                                    </DetailItem>
                                                    <DetailItem>
                                                        <DetailLabel>File</DetailLabel>
                                                        <DetailValue>{tx.file || 'Manual entry'}</DetailValue>
                                                    </DetailItem>
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
    padding-bottom: 1.5rem;
`
// -------------------------------------------------------- Table Header.
const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 2rem 1.5rem;
    position: relative;
    overflow: hidden;
`

const HeaderTitle = styled.h2`
    font-size: 2.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-secondary);
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    position: relative;
    z-index: 1;
`

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    position: relative;
    z-index: 1;
`

const EntriesSelector = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    
    span {
        font-weight: 500;
    }
    
    select {
        font: inherit;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            border-color: var(--button-primary);
            background: rgba(255, 255, 255, 0.3);
        }
        
        &:focus {
            outline: none;
            border-color: var(--button-primary);
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
    }
`

const ResultsInfo = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`

const TableContainer = styled.div`
    overflow: hidden;
    position: relative;
    padding: 0 1.5rem 0.5rem 1.5rem;

`

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
    position: relative;
    z-index: 1;
`

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
    th:nth-child(4), td:nth-child(4) { width: 180px; }     /* Amount */
    th:nth-child(5), td:nth-child(5) { width: 200px; }     /* Actions */


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
        &:nth-child(5) {
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
`

const AmountCell = styled.td`
    text-align: right;
    font-weight: 600;
    font-size: 1rem;
    color: ${(props) => (props.$isPos ? 'var(--amount-positive)' : 'var(--amount-negative)')};
    padding-right: 1.5rem;
`

const ActionsCell = styled.td`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0.75rem !important;
`

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
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;


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

const ExpandedSelect = styled.td`
    border-right: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    text-align: center;
    padding: 1rem 0.5rem;
    position: relative;
    z-index: 1;
`

export default TransactionTable;
