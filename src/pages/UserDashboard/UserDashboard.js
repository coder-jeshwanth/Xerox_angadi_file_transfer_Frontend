import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const BASE_URL = "https://backend.tigerjeshy.live";

const UserDashboard = () => {
    const [username, setUsername] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]); // File list state
    const [selectedFile, setSelectedFile] = useState(null); // Input file state
    const [error, setError] = useState(""); // Error for upload validation
    const [showPopup, setShowPopup] = useState(false); // State to handle when the modal is shown
    const navigate = useNavigate();

    // Retrieve state passed from FileUpload.js & session storage
    const location = useLocation();
    const needRefresh = location.state?.needRefresh || false;

    // Load username from session storage
    useEffect(() => {
        const storedUsername = sessionStorage.getItem("username");
        if (!storedUsername) {
            navigate("/");
        } else {
            setUsername(storedUsername);
        }
    }, [navigate]);

    // Fetch the uploaded files
    const fetchUploadedFiles = useCallback(async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/user/dashboard/${username}`
            );
            if (response.ok) {
                const data = await response.json();
                setUploadedFiles(data); // Update uploaded files state

                // Show modal if no files are present
                if (data.length === 0) setShowPopup(true);
            } else {
                console.error("Failed to fetch uploaded files.");
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    }, [username]);

    useEffect(() => {
        // Fetch the files when username is set
        if (username) fetchUploadedFiles();
    }, [username, fetchUploadedFiles]);

    useEffect(() => {
        // Auto-refresh every 5 seconds
        const interval = setInterval(() => fetchUploadedFiles(), 5000);
        return () => clearInterval(interval);
    }, [fetchUploadedFiles]);

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file!");
            return;
        }
        setError("");

        const formData = new FormData();
        formData.append("files", selectedFile);
        formData.append("username", username);

        try {
            const response = await fetch(`${BASE_URL}/api/user/upload`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setSelectedFile(null);
                fetchUploadedFiles();
            } else {
                alert("Failed to upload file.");
            }
        } catch (error) {
            console.error("File upload failed:", error);
            alert("An error occurred while uploading the file.");
        }
    };

    const handleDeleteAllFiles = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/files/deleteByUsername?userName=${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert(`All files for ${username} deleted successfully.`);
                fetchUploadedFiles(); // Refresh the file list
            } else {
                alert(`Failed to delete files for ${username}.`);
            }
        } catch (error) {
            console.error("Error deleting files by username:", error);
            alert("Error deleting files. Please try again.");
        }
    };

    const handlePopupClose = () => {
        setShowPopup(false); // Hide the popup
        navigate("/"); // Redirect to FileUpload page
    };

    return (
        <div className="dashboard-wrapper">
            <div className="header">
                <h1>XEROX</h1>
            </div>
            <div className="dashboard-container">
                <h2 className="welcome-message">Welcome, {username}!</h2>

                {/* File Upload Section */}
                <section className="file-upload-section">
                    <h3>Upload a File</h3>
                    <input
                        type="file"
                        className="file-input"
                        onChange={(e) => {
                            setSelectedFile(e.target.files[0]);
                            setError(""); // Clear error when file is selected
                        }}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button className="submit-button" onClick={handleFileUpload}>
                        Upload File
                    </button>
                </section>

                {/* Uploaded Files Section */}
                <section className="uploaded-files">
                    <h3>Your Uploaded Files</h3>
                    {uploadedFiles.length > 0 ? (
                        <ul className="file-list">
                            {uploadedFiles.map((file) => (
                                <li key={file.id} className="file-item">
                                    {file.fileName}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-files-message">No files found.</p>
                    )}
                </section>

                {/* Delete All Files Button */}
                <button className="submit-button" style={{ backgroundColor: 'mediumred' }} onClick={handleDeleteAllFiles}>
                    Delete All Files
                </button>
            </div>

            {/* Pop-up Modal */}
            {showPopup && (
                <div className="popup-modal">
                    <div className="popup-content">
                        <div className="popup-success-text" style={{ color: 'green', fontWeight: 'bold', fontSize: '25px' }}>
                            Success
                        </div>
                        <h3>All files printed successfully!</h3>
                        <button className="popup-button" onClick={handlePopupClose}>
                            Go Back to Upload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;