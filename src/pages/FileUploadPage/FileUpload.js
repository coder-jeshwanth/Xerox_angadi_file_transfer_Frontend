import React, { useState, useEffect } from "react";
import './FileUpload.css';
import { useNavigate } from "react-router-dom";

const FileUpload = () => {
    const [files, setFiles] = useState([]); // Array to hold multiple files
    const [username, setUsername] = useState("");
    const [error, setError] = useState(""); // Track if there's an error
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve username from session storage
        const storedUsername = sessionStorage.getItem("username");
        if (!storedUsername) {
            navigate("/"); // Redirect to homepage if no username is found
        } else {
            setUsername(storedUsername);
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]); // Set the selected files
        setError(""); // Clear the error when files are selected
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please upload files!"); // Set the error message if no files are selected
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file)); // Append each file to formData
        formData.append("username", username);

        try {
            const response = await fetch("https://backend.tigerjeshy.live/api/user/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                // Navigate to the dashboard without showing an alert
                navigate("/dashboard", { state: { needRefresh: true } });
            } else {
                setError("File upload failed!"); // Set an error message for failed uploads
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            setError("An error occurred while uploading files."); // Handle unexpected errors
        }
    };

    return (
        <div className="file-upload-wrapper">
            <div className="header">
                <h1>XEROX</h1>
            </div>
            <div className="form-container">
                <h2>Hi, {username}!</h2>
                <p className="description">Upload your files here:</p>
                <div className="file-upload-form">
                    <input
                        type="file"
                        className="file-input"
                        multiple // Allow multiple file selection
                        onChange={handleFileChange}
                    />
                    {/* Error message */}
                    {error && <p className="error-message">{error}</p>}
                    <button onClick={handleUpload} className="submit-button">
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;