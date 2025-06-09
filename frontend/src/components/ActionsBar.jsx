// Imports.
import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import { createTransaction, uploadCSV } from '../services/api';

const FilesActionsBar = ({ onClear, onUploadSuccess }) => {

    // Add Menu States.
    const [showAddMenu, setShowAddMenu] = useState(false);              // State 4 Whether Add Menu Is Open.
    const [uploadModal, setUploadModal] = useState(false);              // State 4 Whether Modal For Upload Is Open.
    const [transactionModal, setTransactionModal] = useState(false);    // State 4 Whether Transaction Modal Is Open.

    // Upload CSV States.
    const [file, setFile] = useState(null);                             // State 4 Storing Set File From Upload Modal.
    const [notes, setNotes] = useState('');                             // State 4 Storing Set Notes From Upload Modal.
    const [uploading, setUploading] = useState(false);                  // State 4 Letting User Know File Is Uploading.
    const [uploadError, setUploadError] = useState('');                 // State 4 Storing Upload Error Messages.

    // Transaction Input States.
    const [type, setType] = useState('');                               // State 4 Storing Type Of Transaction.
    const [date, setDate] = useState('');                               // State 4 Storing Date Of Transaction.
    const [vendor, setVendor] = useState('');                           // State 4 Storing Vendor Of Transaction.
    const [amount, setAmount] = useState('');                           // State 4 Storing Amount Of Transaction.
    const [description, setDescription] = useState('');                 // State 4 Storing Description Of Transaction.

    // -------------------------------------------------------- Handle Uploading Of CSV.
    const handleUpload = async () => {
        if (!file) return;                              // If File Does Not Exist. Return.

        const formData = new FormData();                // Create New FormData Item.
        formData.append('file', file);                  // Add 'file' to FormData.
        formData.append('notes', notes);                // Add 'notes' to FormData.

        try {
            setUploading(true);                         // Uploading Var Set To True.
            setUploadError('');                         // Clear Any Previous Errors.
            await uploadCSV(formData);                  // API Request For Upload.
            setFile(null);                              // Clear File Var.
            setNotes('');                               // Clear Notes Var.
            setUploadModal(false);                      // Close Upload Modal.
            onUploadSuccess();                          // 
        } catch (error) {
            console.error("Upload Failed : ", error);   // If Error, Return Error.
            
            // Extract Error Messages From Response.
            let errorMessage = "Upload failed. Please try again.";
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setUploadError(errorMessage);               // Set Error Message For Display.
        } finally {
            setUploading(false);                        // Verify Uploading Var Is Set To False.
        }
    };

    // -------------------------------------------------------- Handle Dropping Of File Into Upload Modal.
    const handleFileDrop = (e) => {
        e.preventDefault();                             // Prevent Default Browsing Behavior.
        const droppedFile = e.dataTransfer.files[0];    // Get First File In Dropped Items.
        if (droppedFile) {
            setFile(droppedFile);                       // If File Exists, Update Local State W/ It.
            setUploadError('');                         // Clear Any Previous Errors When New File Dropped.
        }
    }

    // -------------------------------------------------------- Handle Selection Of File From Input Element.
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];         // Get First File From File Input Element.
        if (selectedFile) {
            setFile(selectedFile);                       // If File Selected, Update State W/ It.
            setUploadError('');                          // Clear Any Previous Errors When New File Selected.
        }
    }

    // -------------------------------------------------------- Handle Closing Upload Modal.
    const closeUploadModal = () => {
        setUploadModal(false);
        setUploadError('');                              // Clear Error When Modal Closes.
        setFile(null);                                   // Clear File Selection.
        setNotes('');                                    // Clear Notes.
    };

    // -------------------------------------------------------- Handling Submission Of Transaction.
    const handleTransactionSubmit = async () => {
        if (!date || !vendor || !amount || !type) {
            alert("Please fill in all required fields.");
            return;
        }

        const newTransaction = {
            date,
            vendor,
            description,
            amount: parseFloat(amount),
            type,
            file: "manual"
        };

        try {
            await createTransaction(newTransaction);
            onUploadSuccess();
            setTransactionModal(false);
            setDate('');
            setType('');
            setVendor('');
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    }

    const TRANSACTION_TYPE_OPTIONS = {
        sale: "Purchase",
        payment: "Credit Card Payment",
        refund: "Refund / Reimbursement",
        fee: "Service / Late Fee",
        interest: "Interest Charge",
        adjustment: "Account Adjustment",
        transfer: "Transfer",
        other: "Other"
      };
      
    
    return (
        <Actions>
            <BarWrapper>
                <ClearDBButton 
                    onClick={() => { onClear() }} 
                    aria-label="Clear All Data."
                    title="Clear All Files & Corresponding Transactions."
                >
                    <FontAwesomeIcon icon={faBomb} />
                </ClearDBButton>
                <AddMenuWrapper>
                    <AddButton 
                        onClick={() => setShowAddMenu(prev => !prev)} 
                        aria-label="Add New Content."
                        title="Add New File Or Transaction."    
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </AddButton>
                    {showAddMenu && (
                        <DropDownMenu onClick={(e) => e.stopPropagation()}>
                            <DropDownItem onClick={() => {
                                setUploadModal(true);
                                setShowAddMenu(false);
                            }}>
                                Upload File
                            </DropDownItem>
                            <DropDownItem onClick={() => {
                                setTransactionModal(true);
                                setShowAddMenu(false);
                            }}>
                                Add Transaction
                            </DropDownItem>
                        </DropDownMenu>
                    )}
                </AddMenuWrapper>
                
                <RefreshContentsButton 
                    onClick={() => {onUploadSuccess()}} 
                    aria-label="Refresh Site Contents."
                    title="Refresh Files & Transactions."
                >
                    <FontAwesomeIcon icon={faRefresh} />
                </RefreshContentsButton>
            </BarWrapper>
            { uploadModal && (
                <UploadModal onClick={closeUploadModal}>
                    <UploadModalContent onClick={e => e.stopPropagation()}>
                        <DropZone
                            onDrop={handleFileDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <input type="file" accept=".csv" onChange={handleFileSelect} />
                            {file ? file.name : "Drop or Click To Select A CSV File."}
                        </DropZone>

                        <NotesInput
                            placeholder="Enter Any Optional Notes Here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        {uploadError && (
                            <ErrorMessage>
                                {uploadError}
                            </ErrorMessage>
                        )}

                        <UploadButton onClick={handleUpload} disabled={uploading || !file}>
                            {uploading ? "Uploading..." : "Upload"}
                        </UploadButton>
                    </UploadModalContent>
                </UploadModal>
            )}
            { transactionModal && (
                <TransactionModal onClick={() => setTransactionModal(false)}>
                    <TransactionContent onClick={e => e.stopPropagation()}>
                        <h2>Add A New Transaction</h2>
                        <TransactionInputs>
                            <label>Date Of Transaction</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />

                            <label>Associated Vendor</label>
                            <input
                                type="text"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                placeholder="Vendor Name"
                            />

                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                            />

                            <label>Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="$0.01"
                            />

                            <label>Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">Select Type</option>
                                {Object.entries(TRANSACTION_TYPE_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <SubmitButton onClick={handleTransactionSubmit}>
                                Submit
                            </SubmitButton>
                        </TransactionInputs>
                    </TransactionContent>
                </TransactionModal>
            )}  
        </Actions>
    );  
}

// -------------------------------------------------------- Entire Actions Container.
const Actions = styled.div`
    width: 90%;
`
// -------------------------------------------------------- Wrapper For Actions Bar.
const BarWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
`
// -------------------------------------------------------- Clear DB Button.
const ClearDBButton = styled.div`
    cursor: pointer;
    background-color:rgb(255, 40, 58);
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.25rem;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: rgb(206, 6, 6);
    }
`
// -------------------------------------------------------- Add Menu Wrapper.
const AddMenuWrapper = styled.div`
    position: relative;
`

// -------------------------------------------------------- Add File Button.
const AddButton = styled(ClearDBButton)`
    background-color:rgb(40, 90, 255);
    &:hover {
        background-color: rgb(34, 75, 211);
    }
`
// -------------------------------------------------------- Drop Down Menu Container.
const DropDownMenu = styled.div`
    min-width: 200px;
    margin-top: 4px;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgb(255, 255, 255);
    border: 1px solid rgb(182, 182, 182);
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    z-index: 100;

    &::before {
        content: '';
        color: white;
        position: absolute;
        top: -7px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 12px;
        height: 12px;
        background-color: white;
        border-left: 1px solid rgb(182, 182, 182);
        border-top: 1px solid rgb(182, 182, 182);
        z-index: -1;
    }
`;
// -------------------------------------------------------- Drop Down Item.
const DropDownItem = styled.div`
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.3s ease;
    text-align: center;
    width: 100%;

    &:hover {
        background-color:rgb(201, 201, 201);
    }
`
// -------------------------------------------------------- Add File Button.
const RefreshContentsButton = styled(ClearDBButton)`
    background-color:rgb(105, 140, 252);
   
    &:hover {
        background-color: rgb(83, 109, 197);
    }
`
// -------------------------------------------------------- Upload Modal Container.
const UploadModal = styled.div`
    position: fixed;
    inset: 0;
    background-color: (0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`
// -------------------------------------------------------- Actual Content Of Upload Modal.
const UploadModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`
// -------------------------------------------------------- Drop Zone Container.
const DropZone = styled.label`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    border: 2px dashed #ced4da;
    padding: 2rem;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
    font-size: 0.9rem;

    input {
        display: none;
    }

    &:hover {
        background-color: #e9ecef;
    }
`
// -------------------------------------------------------- Notes Input Area.
const NotesInput = styled.textarea`
    padding: 0.5rem;
    font-szie: 0.9rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: vertical;
`
// -------------------------------------------------------- Upload Button On Upload Modal.
const UploadButton = styled.button`
    background-color: #0d6efd;
    color: white;
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    align-self: flex-end;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #0b5ed7;
    }
`
// -------------------------------------------------------- Transaction Modal Wrapper.
const TransactionModal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`
// -------------------------------------------------------- Content Of Transaction Modal.
const TransactionContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.25s ease-in-out;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
        margin: 0;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(0, 0, 0, 0.2);
    }
`
// -------------------------------------------------------- All Transactions Inputs.
const TransactionInputs = styled.div`
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    width: 100%;
    gap: 0.75rem;

    input, select {

        box-sizing: border-box;
        font-family: inherit;
        padding: 0.6rem 0.75rem;
        margin-top: 0.15rem;
        font-size: 0.95rem;
        border: 2px solid rgba(143, 143, 143, 0.29);
        border-radius: 6px;
        transition: all 0.3s ease-in-out;
        cursor: pointer;

        &:focus {
            outline: none;
            border: 2px solid rgb(1, 110, 253);
        }
    }

    label {
        font-weight: 600;
        margin-top: 0.5rem;
        display: block;
        font-size: 0.9rem;
    }
`
// -------------------------------------------------------- Submit Button Of Transaction Modal.
const SubmitButton = styled.button`
    background-color: #198754;
    color: white;
    text-align: center;
    padding: 0.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    font: inherit;
    margin-top: 0.5rem;
    &:hover {
        background-color: #146c43;
    }
`
// -------------------------------------------------------- Error Message Display.
const ErrorMessage = styled.div`
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
    margin: 0.5rem 0;
`

export default FilesActionsBar;