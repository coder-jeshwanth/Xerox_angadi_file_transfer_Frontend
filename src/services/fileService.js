import axios from 'axios';
import React, { useEffect, useState } from 'react';
const API_BASE_URL = 'http://localhost:8080/api/auth';

// Fetch files logic and automatic fetching
export const fetchFiles = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/files`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
};

// Fetch specific file content (as Blob)
export const fetchFileContent = async (fileId, token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/files?fetchFile=true&id=${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
};

// Delete file after printing
export const deleteFileAfterPrint = async (fileId, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/print/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
};
const DashboardPage = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const token = 'your-token-here'; // Replace with actual token retrieval logic

    const fetchFilesPeriodically = async () => {
        try {
            const fetchedFiles = await fetchFiles(token);
            setFiles(fetchedFiles);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        fetchFilesPeriodically(); // Initial fetch
        const interval = setInterval(() => {
            fetchFilesPeriodically();
        }, 60000); // Every 60 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {error && <p>{error}</p>}
            <ul>
                {files.map(file => (
                    <li key={file.id}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default DashboardPage;
