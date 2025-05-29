// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { useState, useEffect } from 'react';


// Local Imports.

// Components.
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import TransactionTable from '../components/TransactionTable';

// API.
import { fetchTransactions } from '../services/api';
import { deleteFile, renameFile, getFiles } from '../services/api';
import { emptyDatabase } from '../services/api';

// Dashboard Component.
const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);       // Transaction State.
    const [files, setFiles] = useState([]);

    // Load Transactions Function.
    const loadTransactions = async () => {
        try {                                           // Try.
            const tx = await fetchTransactions();      // API Request For Fetch Transaction.   
            const fi = await getFiles();             
            setTransactions(tx.data);                  // Set 'res' For Transactions.
            setFiles(fi.data);
        } catch (err) {                                 // If Error.
            console.error('Fetch Failed:', err);        // Display Error To Console.
        }
    };

    const clearDB = async () => {
        try {
            await emptyDatabase();
            loadTransactions();
            getFiles();
        } catch (err) {
            console.error('Delete Failed:', err);
        }
    };

    const loadFiles = async () => {
        try {
            const res = await getFiles();
            setFiles(res.data);
        } catch (err) {
            console.error('Fetched Failed: ', err);
        }
    }

    const handleDelete = async(fileId) => {
        try {
            await deleteFile(fileId);
            loadFiles();
        } catch (err) {
            console.error("Delete Failed:", err);
        }
    };
    
    const handleRename = async(fileId, newName) => {
        try {
            await renameFile(fileId, newName);
            loadFiles();
        } catch (err) {
            console.error("Rename Failed:", err);
        }
    }

    // UseEffect To Load Transactions.
    useEffect(() => {
        loadTransactions();
        loadFiles();
    }, []);

    // UI Component.
    return (
        <ExpenseContainer>
            <Header>Expense Tracker</Header>
            { files.length === 0 && (
                <FileUploadWrapper>
                    <FileUpload onUploadSuccess={loadTransactions} />
                </FileUploadWrapper>
            )}
            { files.length > 0 && (
                <>
                    <FileList files={files} onDelete={handleDelete} onRename={handleRename}/>
                    <ClearDBButton onClick={() => clearDB()}>
                        Delete
                    </ClearDBButton>
                    <TableSection>
                        <TransactionTable transactions={transactions} />
                    </TableSection>
                </>
            )}
        </ExpenseContainer>
    )
}

const ExpenseContainer = styled.div`
    font-family: 'DM Sans', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: 100vh;
`

const ClearDBButton = styled.button`
    display: flex;
`

const Header = styled.div`
    font-size: 2rem;
    width: 100%;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgb(0, 0, 0, 0.2);
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1.5rem;
    color: #343a40;
`

const FileUploadWrapper = styled.div`
    margin-bottom: 2rem;
    width: 100%;
`

const TableSection = styled.div`
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
`

export default Dashboard;