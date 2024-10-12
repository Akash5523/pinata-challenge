import React from 'react';
import './App.css';
import FileUpload from './FileUpload';

function App() {
    return (
        <div className="App">
            <div className="header">
                <h1>Pinata File Hub</h1>
                <p>Seamless File Management & Uploads</p>
            </div>
            <div className="upload-container">
                <FileUpload />
            </div>
        </div>
    );
}

export default App;
