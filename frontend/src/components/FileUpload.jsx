// Imports.
import React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';

// Local Imports.
import { uploadCSV } from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);                 // State For Tracking If File Exists After Upload.
    const [uploading, setUploading] = useState(false);      // State For Tracking If File Is Currently Uploading.
    const [uploaded, setUploaded] = useState(false);        // State For Tracking If File Is Uploaded.
    const [notes, setNotes] = useState("");                 // State For Tracking If Notes Have Been Attached To Uploaded File.

    const handleSubmit = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('notes', notes);

        try {
            setUploading(true);
            await uploadCSV(formData);
            setFile(null);
            setNotes("");
            setUploaded(true);
            onUploadSuccess();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <UploadContainer>
            {!uploaded && (
                <>
                    <DescriptionText>Welcome In To Your Personal Expense Tracker.</DescriptionText>
                    <Step>
                        <CSVPrompt>
                            First, go ahead and upload your CSV file.
                        </CSVPrompt>
                        <FileLabel>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={(e) => setFile(e.target.files[0])} 
                            />
                            {file ? file.name : "Choose CSV File."}
                        </FileLabel>
                    </Step>
                </>
            )}
            
            
            {file && !uploaded && (
                <Step>
                    <UploadPrompt>Perfect! Let's upload and parse your expenses now.</UploadPrompt>
                    <NotesPrompt>Would you like to attach any notes to this file?</NotesPrompt>
                    <NotesInput
                        placeholder="Optional notes about this upload..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <UploadButton onClick={handleSubmit} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </UploadButton>
                </Step>
            )}
            
            {uploaded && (
                <>
                    <ParsingBar>File successfully uploaded and parsed!</ParsingBar>
                    <SuccessMessage>Great! You can now view and explore your expenses below.</SuccessMessage>
                </>
            )}        
        </UploadContainer>
    );
};

// -------------------------------------------------------- Entire File Upload Container.
const UploadContainer = styled.div`
    /* Container Set Up. */
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;

    width: 100%; /* Container Takes Up 100% Of Parent Container. */
    gap: 1rem; /* 1rem Gap Between Items. */
`
// -------------------------------------------------------- Introductory Text.
const DescriptionText = styled.div`
    font-size: 1.5em;
`
// -------------------------------------------------------- Iterative Step Container For Input To Upload.
const Step = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`
// -------------------------------------------------------- Prompt For Inputting CSV.
const CSVPrompt = styled.div`
    font-size: 1.1rem;
`
// -------------------------------------------------------- Label For Inputting CSV.
const FileLabel = styled.label`
    /* Container Set Up. */
    align-self: center;
    display: flex;
    padding: 0.5rem 1rem;
    width: fit-content;

    /* Styling. */
    background-color: #f1f3f5;
    border: 1px solid #ccc;
    border-radius: 6px;
    color: #000000;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;

    input { 
        display: none;
    }

    &:hover {
        background-color:rgb(214, 214, 216);
    }
`
// -------------------------------------------------------- Prompt For Uploading CSV.
const UploadPrompt = styled.div`
    font-size: 1.1rem;
`
// -------------------------------------------------------- Prompt For Entering In Notes.
const NotesPrompt = styled.div`
    font-size: 1rem;
    margin-top: 0.5rem;
`
// -------------------------------------------------------- Style For Input For Notes.
const NotesInput = styled.textarea`
    width: 100%;
    padding: 0.5rem;
    font-size: 0.9rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: vertical;
`
// -------------------------------------------------------- Button For Uploading CSV.
const UploadButton = styled.div`
    /* Container Set Up. */
    align-self: center;
    width: fit-content;
    padding: 0.5rem 1.25rem;

    /* Styling. */
    background-color: #0d6efd;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #0b5ed7;
    }

    &:disabled {
        background-color: #adb5bd;
        cursor: not-allowed;
    }
`
// -------------------------------------------------------- Bar For Sucess Message.
const ParsingBar = styled.div`
    background-color: #d1e7dd;
    color: #0f5132;
    padding: 0.75rem 1rem;
    border-radius: 6px;
`
// -------------------------------------------------------- Another Success Message.
const SuccessMessage = styled.div`
    font-size: 1.1rem;
    color: #198754;
`

export default FileUpload;