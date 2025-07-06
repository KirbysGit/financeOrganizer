// Imports.
import React, { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import AccountSelectionModal from './AccountSelectionModal';

// -------------------------------------------------------- FileUploadModal Component.
const FileUploadModal = ({ isOpen, onClose, onUpload, onSuccess, existingAccounts = [] }) => {
    // Upload CSV States.
    const [file, setFile] = useState(null);                 // State 4 File.
    const [notes, setNotes] = useState('');                 // State 4 Notes.
    const [uploading, setUploading] = useState(false);      // State 4 Uploading State.
    const [uploadError, setUploadError] = useState('');     // State 4 Upload Error.
    const [showAccountSelection, setShowAccountSelection] = useState(false); // State for account selection modal.
    const [selectedAccount, setSelectedAccount] = useState(null); // State for selected account.

    // -------------------------------------------------------- Handle CSV Upload.
    const handleCSVUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        // Show account selection first
        setShowAccountSelection(true);
    };

    // -------------------------------------------------------- Handle Account Selection.
    const handleAccountSelect = async (account) => {
        setSelectedAccount(account);
        setShowAccountSelection(false);
        
        // Now proceed with upload
        await performUpload(account);
    };

    // -------------------------------------------------------- Perform Actual Upload.
    const performUpload = async (account) => {
        setUploading(true);                                 // Let User Know Upload Is In Progress.
        setUploadError('');                                 // Clear Any Previous Errors.

        const formData = new FormData();                    // Create New FormData Object.
        formData.append('file', file);                      // Add File To FormData.
        formData.append('notes', notes);                    // Add Notes To FormData.
        
        // Add account data if not cash
        if (account && account.type !== 'cash') {
            formData.append('account_data', JSON.stringify(account));
        }

        try {                                               // Try.
            const result = await onUpload(formData);        // API Call For Uploading CSV.
            onSuccess(result);                              // Pass Results To Parent (result is already the data).
            handleClose();                                  // Close Modal.
        } catch (error) {                                   // If Error.
            console.error("Upload failed:", error);         // Log Error.
            let errorMessage = "Failed to upload file. Please try again.";
            
            if (error.response?.data?.detail) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
                }
            }
            
            setUploadError(errorMessage);
        } finally {                                         // Finally.
            setUploading(false);                             // Let User Know Upload Has Finished.
        }
    };

    // -------------------------------------------------------- Handle Close Modal.
    const handleClose = () => {
        setFile(null);
        setNotes('');
        setUploadError('');
        setSelectedAccount(null);
        setShowAccountSelection(false);
        onClose();
    };

    // -------------------------------------------------------- Handle Drag & Drop On Upload Modal.
    const handleFileDrop = (e) => {
        e.preventDefault();                             // Prevent Default Browsing Behavior.
        const droppedFile = e.dataTransfer.files[0];    // Get First File In Dropped Items.
        if (droppedFile) {
            setFile(droppedFile);                       // If File Exists, Update Local State W/ It.
            setUploadError('');                         // Clear Any Previous Errors When New File Dropped.
        }
    };

    // -------------------------------------------------------- Handle Selection Of File From Input Element.
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];         // Get First File From File Input Element.
        if (selectedFile) {
            setFile(selectedFile);                       // If File Selected, Update State W/ It.
            setUploadError('');                          // Clear Any Previous Errors When New File Selected.
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Modal onClick={handleClose}>
                <ModalContent onClick={e => e.stopPropagation()}>
                    <ModalHeader>
                        <ModalTitle>Upload CSV File</ModalTitle>
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faTimes} />
                        </CloseButton>
                    </ModalHeader>

                    <UploadSection>
                        <FileDropZone $hasFile={!!file}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                id="csv-upload"
                            />
                            <label htmlFor="csv-upload">
                                <FontAwesomeIcon icon={faFileUpload} />
                                {file ? file.name : 'Choose CSV File'}
                            </label>
                        </FileDropZone>

                        <NotesInput
                            placeholder="Optional notes about this upload..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        {uploadError && (
                            <ErrorMessage>{uploadError}</ErrorMessage>
                        )}

                        <ActionButton 
                            onClick={handleCSVUpload} 
                            disabled={!file || uploading}
                            $primary
                        >
                            {uploading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Uploading...
                                </>
                            ) : (
                                'Upload & Parse'
                            )}
                        </ActionButton>
                    </UploadSection>
                </ModalContent>
            </Modal>

            {/* Account Selection Modal */}
            <AccountSelectionModal
                isOpen={showAccountSelection}
                onClose={() => setShowAccountSelection(false)}
                onAccountSelect={handleAccountSelect}
                existingAccounts={existingAccounts}
            />
        </>
    );
};

// ------------------------------------------------------------------------------------------------ Styled Components.

// -------------------------------------------------------- Modal Container.
const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
`;
const ModalContent = styled.div`
    background: white;
    border-radius: 24px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;
const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid #eee;
`;
const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
`;
// -------------------------------------------------------- Close Button.
const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        color: #333;
    }
`;
// -------------------------------------------------------- Upload Section.
const UploadSection = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;
// -------------------------------------------------------- File Drop Zone.
const FileDropZone = styled.div`
    border: 2px dashed ${props => props.$hasFile ? '#28a745' : '#ddd'};
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    background: ${props => props.$hasFile ? '#f8fff9' : '#fafafa'};
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: #007bff;
        background: #f0f8ff;
    }

    label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        font-weight: 500;
        color: ${props => props.$hasFile ? '#28a745' : '#666'};

        svg {
            font-size: 2rem;
            color: ${props => props.$hasFile ? '#28a745' : '#007bff'};
        }
    }
`;
// -------------------------------------------------------- Notes Input.
const NotesInput = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
// -------------------------------------------------------- Action Button.
const ActionButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    ${props => props.$primary ? `
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }
    ` : `
        background: #f8f9fa;
        color: #333;
        border: 2px solid #eee;

        &:hover:not(:disabled) {
            background: #e9ecef;
        }
    `}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }
`;
// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    text-align: center;
`;

export default FileUploadModal; 