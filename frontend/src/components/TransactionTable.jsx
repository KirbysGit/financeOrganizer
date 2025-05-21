import React from 'react';

const TransactionTable = ({ transactions }) => {
    return(
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((tx) => (
                    <tr key={tx.id}>
                        <td>{tx.date}</td>
                        <td>{tx.description}</td>
                        <td>{tx.amount.toFixed(2)}</td>
                        <td>{tx.type}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TransactionTable;