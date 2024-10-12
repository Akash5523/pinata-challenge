import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css'; // Import the CSS file

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [uploadPercentage, setUploadPercentage] = useState(0); // State for upload percentage
    const [isUploading, setIsUploading] = useState(false); // State for tracking upload status

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        // Start upload
        setIsUploading(true);
        setUploadPercentage(0); // Reset upload percentage before starting

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    const current = progressEvent.loaded;
                    const percentage = Math.round((current / total) * 100);
                    setUploadPercentage(percentage); // Update upload percentage
                },
            });

            // Display success message
            setMessage(response.data.message);

            // Reset form fields
            setFile(null);        // Reset the file
            setTitle('');         // Reset the title
            setDescription('');   // Reset the description
        } catch (error) {
            console.error('Error uploading the file:', error);
            setMessage('File upload failed.');
        } finally {
            setUploadPercentage(0); // Reset percentage after the upload is complete
            setIsUploading(false);  // Reset the uploading state
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload File</h2>
            <form onSubmit={handleUpload} className="upload-form">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input"
                />
                <button type="submit" className="upload-button" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {message && <p className="upload-message">{message}</p>}
            {uploadPercentage > 0 && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${uploadPercentage}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default FileUpload;
