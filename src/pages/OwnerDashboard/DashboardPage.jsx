import React, { useState, useEffect } from "react";
import {
    fetchFiles,
    fetchFileContent,
    deleteFileAfterPrint,
} from "../../services/fileService";
import { getToken, clearToken } from "../../services/tokenUtils";
import { useNavigate } from "react-router-dom";
import FileList from "../../components/FileList";
import "./dashboardpage.css";

const DashboardPage = () => {
    const [files, setFiles] = useState({});
    const [filteredFiles, setFilteredFiles] = useState({});
    const [error, setError] = useState("");
    const [previewFile, setPreviewFile] = useState({
        fileUrl: null,
        fileName: null,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    // Fetch files and update the state
    const loadFiles = async () => {
        try {
            const token = getToken();

            if (!token) {
                handleLogout();
                return;
            }

            const response = await fetchFiles(token);

            if (response && response.data && typeof response.data === "object") {
                setFiles(response.data);
                setFilteredFiles(response.data); // Initialize filteredFiles
            } else {
                setFiles({});
                setFilteredFiles({});
                setError("Invalid file structure received from the server.");
            }
        } catch (err) {
            console.error("Error loading files:", err);
            setError("Failed to load files. Please try again.");
            setFiles({});
            setFilteredFiles({});
        }
    };

    // Automatically refresh file list periodically
    useEffect(() => {
        loadFiles(); // Initial load

        const intervalId = setInterval(() => {
            loadFiles();
        }, 20000); // Fetch files every 20 seconds

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    const handlePreview = async (fileId, fileName) => {
        try {
            const token = getToken();
            const fileBlob = await fetchFileContent(fileId, token);
            const fileUrl = URL.createObjectURL(fileBlob);
            setPreviewFile({ fileUrl, fileName });
        } catch {
            setError("Error previewing the file.");
        }
    };

    const handlePrint = async (fileId, fileName) => {
        try {
            const token = getToken();
            const fileBlob = await fetchFileContent(fileId, token);
            const fileUrl = URL.createObjectURL(fileBlob);

            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.top = "-9999px";
            iframe.src = fileUrl;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow.print();

                // Trigger confirmation dialog after 3 seconds
                setTimeout(async () => {
                    document.body.removeChild(iframe);
                    const userConfirmed = window.confirm(
                        "Did the file print successfully?"
                    );
                    if (userConfirmed) {
                        try {
                            await deleteFileAfterPrint(fileId, token);
                            loadFiles();
                        } catch (err) {
                            console.error("Error deleting file:", err);
                            setError("Error deleting the file after printing.");
                        }
                    } else {
                        setError("Print not confirmed. File not deleted.");
                    }
                }, 3000); // 3 seconds delay
            };
        } catch (err) {
            console.error("Error printing the file:", err);
            setError("Error printing the file.");
        }
    };

    const handleLogout = () => {
        clearToken();
        navigate("/owner/login");
    };

    const closePreview = () => {
        if (previewFile.fileUrl) {
            URL.revokeObjectURL(previewFile.fileUrl);
        }
        setPreviewFile({ fileUrl: null, fileName: null });
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query) {
            setFilteredFiles(files); // Reset to all files if query is empty
            return;
        }

        const filtered = Object.keys(files)
            .filter((key) => key.toLowerCase().includes(query))
            .reduce((obj, key) => {
                obj[key] = files[key]; // Preserve the structure of the files object
                return obj;
            }, {});

        setFilteredFiles(filtered);
    };

    return (
        <div className="dashboard-container">
            <header>
                <div className="header-content">
                    <h1>Dashboard</h1>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </header>

            {error && <p className="dashboard-error">{error}</p>}

            <div className="file-list-container">
                {Object.keys(filteredFiles).length > 0 ? (
                    <FileList
                        files={filteredFiles}
                        onPreview={handlePreview}
                        onPrint={handlePrint}
                    />
                ) : (
                    <p className="empty-message">No files available.</p>
                )}
            </div>

            {previewFile.fileUrl && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-heading">Preview: {previewFile.fileName}</h3>
                        <iframe
                            src={previewFile.fileUrl}
                            title="File Preview"
                            className="preview-iframe"
                        />
                        <button onClick={closePreview} className="close-button">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;