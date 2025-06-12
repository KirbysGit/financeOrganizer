import React from 'react';
import { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../styles/colors.css';
import {getStats } from '../services/api.js';

const TransactionTable = ({ transactions, onDelete }) => {

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
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });
    }

    if (transactions.length === 0) {
        return (
            <TransactionsWrapper>
                <EmptyStateCard>
                    <EmptyIcon>📊</EmptyIcon>
                    <EmptyTitle>No Transactions Yet...</EmptyTitle>
                    <EmptyDescription>Start By Uploading A CSV File Or Adding Transactions Manually. </EmptyDescription>
                </EmptyStateCard>
            </TransactionsWrapper>
        )
    }

    return (
        <TransactionsWrapper>
            <Controls>
                <label>
                    Showing&nbsp;
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
                    &nbsp;of&nbsp;
                    { totalPages }
                    &nbsp;entries
                </label>
            </Controls>

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
                        <>
                            <ExpandableRow key={tx.id} $isSelected={selectedIds.has(tx.id)} $isExpanded={txDetails === tx.id} $rowIndex={index}>
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
                                    <MoreInfoButton onClick={() => setTxDetails(txDetails === tx.id ? null : tx.id)}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </MoreInfoButton>
                                    <TrashButton onClick={() => onDelete(tx.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </TrashButton>
                                </ActionsCell>
                            </ExpandableRow>
                            {txDetails === tx.id && (
                                <DetailsRow $rowIndex={index}>
                                    <ExpandedSelect></ExpandedSelect>
                                    <ExpandedDetails colSpan="4">
                                        <DetailsContainer>
                                            <DetailsList>
                                                <DetailItem>
                                                    <DetailLabel>Description:</DetailLabel>
                                                    <DetailValue>{tx.description || 'No description available'}</DetailValue>
                                                </DetailItem>
                                                <DetailItem>
                                                    <DetailLabel>Type:</DetailLabel>
                                                    <DetailValue>{tx.type || 'N/A'}</DetailValue>
                                                </DetailItem>
                                                <DetailItem>
                                                    <DetailLabel>File:</DetailLabel>
                                                    <DetailValue>{tx.file || 'Manual entry'}</DetailValue>
                                                </DetailItem>
                                            </DetailsList>
                                            <TagsList>
                                                <TagsHeader>Transactions Current Tags</TagsHeader>
                                            </TagsList>
                                        </DetailsContainer>
                                    </ExpandedDetails>
                                </DetailsRow>
                            )}
                        </>
                    ))}
                </tbody>
            </StyledTable>

            <Pagination>
                <button onClick={() => changePage(1)} disabled={currentPage === 1}>
                    First
                </button>
                <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                    ← Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => changePage(currentPage + 1)} disabled={currentPage == totalPages}>
                    Next →
                </button>
                <button onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>
                    Last
                </button>
            </Pagination>
        </TransactionsWrapper>
    );
};
// -------------------------------------------------------- Entire Transaction Table Container.
const TransactionsWrapper = styled.div`
    justify-items: center;
    width: 100%;
    border-radius: 16px;
`
const EmptyStateCard = styled.div`
    width: 90%;
    padding: 3rem 2rem;
    margin: 2rem auto;
    border-radius: 12px;
    background: var(--empty-bg);
    text-align: center;
    box-shadow: 0 2px 10px var(--shadow-light);
    border: 4px dashed var(--empty-border);
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
        box-shadow: 0px 5px 10px var(--shadow-strong);
    }
`
const EmptyIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 1rem;
`
const EmptyTitle = styled.h3`
    color: var(--empty-title);
`
const EmptyDescription = styled.p`
    color: var(--empty-description);
`
// -------------------------------------------------------- Controls Container At Top Of Table.
const Controls = styled.div`
    display: flex;
    width: 90%;
    justify-content: flex-end;
    margin: 0.75rem 0;
    font-size: 0.9rem;
    select {
        font: inherit;
        padding: 0.25rem;
        border-radius: 4px;
        border: 1px solid var(--border-medium);
    }
`
// -------------------------------------------------------- Table Wrapper.
const StyledTable = styled.table`
    table-layout: fixed;
    width: 90%;
    border-collapse: separate;
    overflow: hidden;
    border-spacing: 0;
    border-radius: 12px;
    border: 1px solid var(--border-medium);
    font-size: 0.9rem;
    line-height: 1.4;

    /* Column widths for better spacing */
    th:nth-child(1), td:nth-child(1) { width: 60px; }      /* Select */
    th:nth-child(2), td:nth-child(2) { width: 110px; }     /* Date */
    th:nth-child(3), td:nth-child(3) { width: 200px; }     /* Vendor */
    th:nth-child(4), td:nth-child(4) { width: 120px; }     /* Description */
    th:nth-child(5), td:nth-child(5) { width: 120px; }     /* Amount */

    thead {
        background-color: var(--header-bg);
        text-align: left;
    }

    th {
        font-weight: 700;
        text-align: center;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--header-text);
        padding: 1rem 0.75rem;
        border-bottom: 2px solid var(--border-medium);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    th:first-child {
        border-top-left-radius: 12px;
    }

    th:last-child {
        border-top-right-radius: 12px;
    }

    td {
        font-weight: 400;
        padding: 0.875rem 0.75rem;
        border-bottom: 1px solid var(--border-light);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr:last-child td:first-child {
        border-bottom-left-radius: 12px;
    }

    tbody tr:last-child td:last-child {
        border-bottom-right-radius: 12px;
    }

    tbody tr {
        transition: all 0.2s ease;
    }

    tbody tr:hover {
        background-color: var(--bg-hover) !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px var(--shadow-medium);
    }
    
    .type {
        text-transform: capitalize;
        font-weight: 500;
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .checkBox {
        border-right: 2px solid var(--border-heavy);
        border-bottom: none;
        background-color: var(--bg-tertiary);
        text-align: center;
        padding: 0.875rem 0.5rem;
    }

    .date {
        font-size: 1rem;
        color: var(--text-secondary);
    }

    .vendor {
        font-weight: 500;
        color: var(--text-primary);
    }

    .description {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .file {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-style: italic;
    }
`
const AmountCell = styled.td`
    text-align: right;
    font-weight: 500;
    color: ${(props) => (props.$isPos ? 'var(--amount-positive)' : 'var(--amount-negative)')};
`
const ActionsCell = styled.td`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem !important;
`
const MoreInfoButton = styled.div`
    color: var(--icon-color);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: var(--text-label);
        background: var(--bg-secondary);
        transform: scale(1.05);
    }
`

const TrashButton = styled.div`
    color: var(--icon-color);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: var(--amount-negative);
        background: rgba(220, 53, 69, 0.1);
        transform: scale(1.05);
    }
`
// -------------------------------------------------------- Details Row Components.
const ExpandableRow = styled.tr`
    background-color: ${(props) => {
        if (props.$isSelected) return 'var(--bg-selected-row)';
        if (props.$isExpanded) return 'var(--bg-expanded-row)';
        return props.$rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-zebra-row)';
    }};
    transition: all 0.3s ease;
    display: table-row;
    border-left: ${(props) => props.$isSelected ? '4px solid var(--button-primary)' : '4px solid transparent'};

    &:hover {
        background-color: var(--bg-hover) !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px var(--shadow-medium);
    }
`
const ExpandedDetails = styled.td`
    padding: 0 !important;
    border: none !important;
    background-color: transparent !important;
    
    /* Create the expanding effect */
    animation: slideDown 0.3s ease-out;
    
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
    border-radius: 12px;
    margin: 0.5rem 0;
    transform: translateY(0);
    animation: slideIn 0.4s ease-out;
    
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 1rem;
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
    gap: 0.4rem;
    padding: 0.5rem;
`
const DetailLabel = styled.span`
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-label);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`
const DetailValue = styled.span`
    font-weight: 400;
    font-size: 0.9rem;
    color: var(--text-light);
    word-wrap: break-word;
    line-height: 1.5;
    background: var(--bg-secondary);
    width: max-content;
    padding: 0.5rem;
    margin: 0;
`
const DetailsRow = styled.tr`
    background-color: ${(props) => {
        return props.$rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-zebra-row)';
    }};
    transition: background-color 0.3s ease;
    display: table-row;
`
const DetailsList = styled.div`
    display: flex;
    flex-direction: column;
`
const TagsList = styled.div`
    display: flex;
    flex-direction: column;
`
const TagsHeader = styled.h1`
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-label);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`
// -------------------------------------------------------- Page Buttons At Bottom.
const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;

    button {
        margin: 0 0.5rem;
        background-color: var(--button-primary);
        color: var(--bg-primary);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.3s ease-in-out;
        font: inherit;

        &:disabled {
            background-color: var(--button-disabled);
            cursor: not-allowed;
        }

        &:not(:disabled):hover{
            background-color: var(--button-primary-hover);
        }
    }
    
    span {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-medium);
        border-radius: 6px;
        font-size: 1rem;
        background-color: var(--bg-primary);
        color: var(--text-secondary);
    }
`

// -------------------------------------------------------- Custom Checkbox Components.
const CustomCheckbox = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
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
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid ${props => props.$isChecked ? 'var(--button-primary)' : 'var(--border-medium)'};
    border-radius: 4px;
    background: ${props => props.$isChecked ? 'var(--button-primary)' : 'transparent'};
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
    font-size: 0.85rem;
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
    border-right: 2px solid var(--border-heavy);
    border-bottom: none;
    background-color: var(--bg-tertiary);
    text-align: center;
    padding: 0.875rem 0.5rem;
`

export default TransactionTable;
