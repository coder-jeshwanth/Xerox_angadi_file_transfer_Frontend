import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WebSocketService } from "../../services/WebSocketService";
import "./UserDashboard.css";

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

    // Establish WebSocket connection
    useEffect(() => {
        if (!username) return;

        const client = WebSocketService.connect(username, (message) => {
            console.log("WebSocket message received:", message);

            try {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.status === "deleted") {
                    fetchUploadedFiles(); // Refresh file list on deletion
                }
                if (parsedMessage.status === "printed") {
                    console.log(`[WebSocket] File printed: ${parsedMessage.fileId}`);
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        });

        return () => client.deactivate(); // Cleanup WebSocket connection
    }, [username]);

    // Fetch the uploaded files
    const fetchUploadedFiles = useCallback(async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/user/dashboard/${username}`
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
            const response = await fetch("http://localhost:8080/api/user/upload", {
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
            </div>

            {/* Pop-up Modal */}
            {showPopup && (
                <div className="popup-modal">
                    <div className="popup-content">
                        <img
                            src="/123.png" // Replace with your tick image path
                            alt="Success"
                            className="popup-icon"
                        />
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