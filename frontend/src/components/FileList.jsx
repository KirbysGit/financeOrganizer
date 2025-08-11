// FileList.jsx

// This is the file list component that is used on the dashboard. Its unused right now but I want to figure out
// where I want to put it. 

// Imports.
import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';

const FileList = ({ files, onDelete, onRename, onUploadFile }) => {
    
    const [editingId, setEditingId] = useState(null);           // State 4 Id Of Item That Is Being Edited.
    const [newName, setNewName] = useState("");                 // State 4 Holding New Name For Item.
    const [fileToDelete, setFileToDelete] = useState(null);     // State 4 Holding Name Of File To Delete.

    const startEditing = (file) => {    // Beginning Of Rename Process.
        setEditingId(file.id);          // Set Editing Id In Local State.
        setNewName(file.filename);      // Sets New Name In Local State.
    };

    const saveRename = (fileId) => {            // Save Rename Value By 'fileId'.
        if (newName.trim()) {                   // If New Name Isn't Empty Spaces.
            onRename(fileId, newName.trim())    // Call Rename Handler W/ Trimmed New Name.
        }
        setEditingId(null);                     // Clear Editing State.
        setNewName("");                         // Clear Input Value.
    }

    // If No Files, Return Empty State.
    if (files.length === 0) {
        return (
            <EmptyStateCard>
                <EmptyIcon>📁</EmptyIcon>
                <EmptyTitle>No Files Found...</EmptyTitle>
                <EmptyDescription>Upload A CSV File To Start Tracking Your Expenses.</EmptyDescription>
                <EmptyAction>Click The Plus Icon Below To Get Started.</EmptyAction>
            </EmptyStateCard>
        )
    }

    return (
        <ListContainer>
            <FileTable>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Notes</th>
                        <th>Uploaded At</th>
                        <th># Of Transactions</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id}>
                            <td>
                                {editingId === file.id ? (
                                    <EditWrapper>
                                        <EditInput
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder={file.filename}
                                        />
                                        <SaveIcon onClick={() => saveRename(file.id)}>
                                            <FontAwesomeIcon icon={faSave} />
                                        </SaveIcon>
                                    </EditWrapper>
                                ):(
                                    file.filename
                                )}
                            </td>
                            <td>{file.notes}</td>
                            <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                            <td>{file.num_transactions}</td>
                            <td>
                                <FileControls>
                                    <RenameFileButton onClick={() => startEditing(file)}> <FontAwesomeIcon icon={faEdit}/> </RenameFileButton>
                                    <DeleteFileButton onClick={() => setFileToDelete(file)}> <FontAwesomeIcon icon = {faTrash}/> </DeleteFileButton>
                                </FileControls>
                                
                            </td>
                        </tr>
                    ))}
                </tbody>
            </FileTable>
            {fileToDelete && (
                <DeleteModal>
                    <ModalContent>
                        <p>Are you sure you want to delete <strong>{fileToDelete.filename}</strong></p>
                        <ModalActions>
                            <ConfirmButton onClick={() => {
                                onDelete(fileToDelete.id);
                                setFileToDelete(null);
                            }}>
                                Confirm
                            </ConfirmButton>
                            <CancelButton onClick={() => setFileToDelete(null)}>
                                Cancel
                            </CancelButton>
                        </ModalActions>
                    </ModalContent>
                </DeleteModal>
            )}
        </ListContainer>
    );
};

// ----------------------------------------------------------------------------------- Empty State Container.
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
const EmptyAction = styled.p`
    color: #0d6efd;
    font-style: italic;
`
// ----------------------------------------------------------------------------------- Entire List Container.
const ListContainer = styled.div`
    width: 90%;
    margin: 2rem auto;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    background-color: white;
`
// -------------------------------------------------------- Table Set Up.
const FileTable = styled.table`
    width: 100%;
    font-size: 0.95rem;
    border-collapse: collapse;

    thead {
        background-color: #f1f3f5;
        text-align: left;
    }

    th, td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #dee2e6;
    }

    tbody tr:hover {
        background-color: rgb(231, 232, 233);    
    }
`
// -------------------------------------------------------- Controls Inside Table On Right Side.
const FileControls = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
`
// -------------------------------------------------------- Wrapper For Edit Inline Modal.
const EditWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`
// -------------------------------------------------------- Edit Inline Input.
const EditInput = styled.input`
    padding: 0.3rem 0.5rem;
    font-size: 0.9rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    width: 100%;
`
// -------------------------------------------------------- Save Icon For Edit.
const SaveIcon = styled.div`
    cursor: pointer;
    color: #198754;
    font-size: 1rem;

    &:hover {
        color: #146c43;
    }
`
// -------------------------------------------------------- Rename Button To Trigger Rename Input.
const RenameFileButton = styled.div`
    background: none;
    border: none;
    color: #6c757d;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        color: #212529;
    }
`
// -------------------------------------------------------- Delete Button To Delete File.
const DeleteFileButton = styled.div`
    background: none;
    border: none;
    color: #6c757d;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        color: #212529;
    }
`
// -------------------------------------------------------- Delete Modal Wrapper For Delete Function.
const DeleteModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`
// -------------------------------------------------------- Wrapper For Content Inside The Modal.
const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
`
// -------------------------------------------------------- Modal Actions (Confirm, Cancel) Wrapper.
const ModalActions = styled.div`
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
`
// -------------------------------------------------------- Confirm Button.
const ConfirmButton = styled.button`
    background-color: #dc3545;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
        background-color: #c82333;
    }
`
// -------------------------------------------------------- Cancel Button.
const CancelButton = styled.button`
    background-color: #6c757d;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        background-color: #5a6268;
    }
`

export default FileList;