const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path'); // Make sure to require 'path'
require('dotenv').config(); // To use environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Define a root route
app.get('/', (req, res) => {
    res.send('Welcome to the Pinata File Upload API!');
});

// Set up file storage
const storage = multer.memoryStorage(); // Ensure storage is defined before usage
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const filetypes = /jpeg|jpg|png|gif|pdf|mp4|docx|txt|csv|zip/; 
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Use path.extname for extension

        console.log(`MIME Type: ${file.mimetype}, Original Name: ${file.originalname}, Mimetype Valid: ${mimetype}, Extname Valid: ${extname}`); // Debugging line

        // Ensure that either mimetype or extname is valid
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Error: File type not supported!'));
        }
    }    
});

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Extract metadata from the request body
        const { title, description } = req.body; // Assuming you will send these in your request

        // Create form data for the file to send to Pinata
        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);

        // Add metadata to the form data (if applicable)
        if (title) {
            formData.append('pinataMetadata', JSON.stringify({ name: title, description: description || '' }));
        }

        // Pinata API endpoint for pinning files
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        // Make a request to Pinata API
        const response = await axios.post(url, formData, {
            maxBodyLength: Infinity, // Important for large files
            headers: {
                'Authorization': `Bearer ${process.env.PINATA_JWT}`, // Use your Pinata JWT
                ...formData.getHeaders(),
            }
        });

        // Respond with the IPFS hash (CID) of the uploaded file
        res.json({
            success: true,
            message: 'File uploaded to IPFS successfully!',
            ipfsHash: response.data.IpfsHash,
            metadata: { title, description }, // Include metadata in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'File upload failed.',
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
