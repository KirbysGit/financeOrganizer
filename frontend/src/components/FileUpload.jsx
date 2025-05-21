import React, { useState } from 'react';
import { uploadCSV } from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadCSV(formData);
            onUploadSuccess();
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleSubmit}>Upload</button>
        </div>
    );
};

export default FileUpload;