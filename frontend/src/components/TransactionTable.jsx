import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';

const TransactionTable = ({ transactions }) => {

    const [currentPage, setCurrentPage] = useState(1); // Use State 4 Setting Pages. Default Page #1.
    const [entriesPerPage, setEntriesPerPage] = useState(10); // Use State 4 Amount Of Entries Per Page. Default Page #10.

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(transactions.length / entriesPerPage);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <TransactionsWrapper>
            <Controls>
                <label>
                    Show&nbsp;
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
                    &nbsp;entries
                </label>
            </Controls>

            <StyledTable>
                <thead>
                    <tr>
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
                            <td>{tx.date}</td>
                            <td>{tx.vendor}</td>
                            <td>{tx.description}</td>
                            <td className="amount">{tx.amount.toFixed(2)}</td>
                            <td className="type">{tx.type}</td>
                            <td>{tx.file}</td>
                        </tr>
                    ))}
                </tbody>
            </StyledTable>

            <Pagination>
                <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                    ← Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => changePage(currentPage + 1)} disabled={currentPage == totalPages}>
                    Next →
                </button>
            </Pagination>
        </TransactionsWrapper>
    );
};

const TransactionsWrapper = styled.div`
    width: 100%;
`

const Controls = styled.div`
    display: flex;
    justify-content: flex-end;
    margin: 0.75rem 0;
    font-size: 0.9rem;

    select {
        padding: 0.25rem;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
`

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;

    thead {
        background-color: #f1f3f5;
        text-align: left;
    }

    th, td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #dee2e6;
    }

    tbody tr:hover {
        background-color:rgb(231, 232, 233);
    }

    .amount {
        text-align: right;
        font-weight: 500;
        color: #198754;
    }
    
    .type {
        text-transform: capitalize;
        color: #6c757d;
    }
`

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

        &:disabled {
            background-color: #ccc;
            cursor: non-allowed;
        }
    }
    
    span {
        font-size: 0.9rem;
    }
`

export default TransactionTable;