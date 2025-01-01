import React, { useState, useEffect } from "react";
import './FileUpload.css';
import { useNavigate } from "react-router-dom";

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false); // State to track if uploading
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = sessionStorage.getItem("username");
        if (!storedUsername) {
            navigate("/");
        } else {
            setUsername(storedUsername);
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
        setError("");
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please upload files!");
            return;
        }

        setIsUploading(true); // Set uploading state to true

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("username", username);

        try {
            const response = await fetch("https://backend.tigerjeshy.live/api/user/upload", {
                method: "POST",
                body: formData,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.ok) {
                // Delay navigation to ensure animation completes
                setTimeout(() => {
                    navigate("/dashboard", { state: { needRefresh: true } });
                }, 1000); // Adjust the delay as needed
            } else {
                setError("File upload failed!");
                setIsUploading(false); // Reset uploading state
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            setError("An error occurred while uploading files.");
            setIsUploading(false); // Reset uploading state
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
                        multiple
                        onChange={handleFileChange}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button
                        onClick={handleUpload}
                        className={`submit-button ${isUploading ? 'uploading' : ''}`}
                        disabled={isUploading} // Disable button during upload
                    >
                        {isUploading ? `Uploading... ${uploadProgress}%` : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;