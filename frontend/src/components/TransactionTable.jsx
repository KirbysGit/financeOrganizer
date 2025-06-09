import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';

// Local Imports.
import './StyleUtils.css';

const TransactionTable = ({ transactions }) => {

    const [currentPage, setCurrentPage] = useState(1);                          // Use State 4 Setting Pages. Default Page #1.
    const [entriesPerPage, setEntriesPerPage] = useState(10);                   // Use State 4 Amount Of Entries Per Page. Default Page #10.
    const [selectedIds, setSelectedIds] = useState(new Set());                  // Use State 4 Storing All Transactions That Are Selected.

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
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>From File</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTransactions.map((tx) => (
                        <tr key={tx.id}>
                            <td className="checkBox">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(tx.id)}
                                    onChange={() => toggleSelection(tx.id)}
                                />
                            </td>
                            <td className="date" title={tx.date}>
                                {formatDate(tx.date)}
                            </td>
                            <td className="vendor" title={tx.vendor}>
                                {truncateText(tx.vendor, 20)}
                            </td>
                            <td className="description" title={tx.description}>
                                {truncateText(tx.description, 30)}
                            </td>
                            <AmountCell $isPos={tx.amount >= 0}>
                                {formatAmount(tx.amount)}
                            </AmountCell>
                            <td className="type" title={tx.type}>
                                {truncateText(tx.type, 15)}
                            </td>
                            <td className="file" title={tx.file}>
                                {truncateText(tx.file, 12)}
                            </td>
                        </tr>
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
    background: white;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    border: 4px dashed #dee2e6;
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
        box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
    }
`

const EmptyIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 1rem;
`

const EmptyTitle = styled.h3`
    color: #495057;
`

const EmptyDescription = styled.p`
    color: #6c757d;
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
        border: 1px solid #ccc;
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
    border: 1px solid #dee2e6;
    font-size: 0.9rem;
    line-height: 1.4;

    /* Column widths for better spacing */
    th:nth-child(1), td:nth-child(1) { width: 60px; }      /* Select */
    th:nth-child(2), td:nth-child(2) { width: 110px; }     /* Date */
    th:nth-child(3), td:nth-child(3) { width: 180px; }     /* Vendor */
    th:nth-child(4), td:nth-child(4) { width: 220px; }     /* Description */
    th:nth-child(5), td:nth-child(5) { width: 120px; }     /* Amount */
    th:nth-child(6), td:nth-child(6) { width: 130px; }     /* Type */
    th:nth-child(7), td:nth-child(7) { width: 100px; }     /* File */

    thead {
        background-color:rgb(236, 236, 236);
        text-align: left;
    }

    th {
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #495057;
        padding: 1rem 0.75rem;
        border-bottom: 2px solid #dee2e6;
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
        border-bottom: 1px solid #f1f3f5;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Zebra striping */
    tbody tr:nth-child(even) {
        background-color:rgb(243, 243, 245);
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
        background-color: #e3f2fd !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .type {
        text-transform: capitalize;
        font-weight: 500;
        color: #6c757d;
        font-size: 0.85rem;
    }

    .checkBox {
        text-align: center;
        padding: 0.875rem 0.5rem;
    }

    .date {
        font-size: 1rem;
        color: #495057;
    }

    .vendor {
        font-weight: 500;
        color: #212529;
    }

    .description {
        color: #6c757d;
        font-size: 0.85rem;
    }

    .file {
        font-size: 0.8rem;
        color: #6c757d;
        font-style: italic;
    }
`

const AmountCell = styled.td`
    text-align: right;
    font-weight: 500;
    color: ${(props) => (props.$isPos ? '#198754' : '#dc3545')};
`;

// -------------------------------------------------------- Page Buttons At Bottom.
const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;

    button {
        margin: 0 0.5rem;
        background-color: #0d6efd;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.3s ease-in-out;
        font: inherit;

        &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        &:not(:disabled):hover{
            background-color:rgb(0, 71, 177);
        }
    }
    
    span {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
    }
`

export default TransactionTable;