import React, { useState, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
    fetchFiles,
    fetchFileContent,
    deleteFileAfterPrint,
    deleteAllFiles,
} from "../../services/fileService";
import { getToken, clearToken } from "../../services/tokenUtils";
import { useNavigate } from "react-router-dom";
import FileList from "../../components/FileList";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "https://backend.tigerjeshy.live";

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
                setFilteredFiles(response.data);
                setError(""); // Clear the error if files are successfully loaded
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

    useEffect(() => {
        loadFiles();
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
                }, 3000);
            };
        } catch (err) {
            console.error("Error printing the file:", err);
            setError("Error printing the file.");
        }
    };

    // Handle "Delete All" functionality
    const handleDeleteAll = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete all files?");
        if (!confirmDelete) return; // Exit if not confirmed

        try {
            const token = getToken();
            if (!token) {
                handleLogout();
                return;
            }
            await deleteAllFiles(token); // Call "delete all" service
            setFiles({});
            setFilteredFiles({});

            // Trigger API request to delete downloaded files
            await fetch(`${BASE_URL}/api/deleteDownloadedFiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ folderPath: 'path/to/download/folder' }) // Replace with actual path
            });

            alert("All files deleted successfully!");
        } catch (err) {
            console.error("Error deleting all files:", err);
            setError("Failed to delete all files. Please try again.");
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
            setFilteredFiles(files);
            return;
        }

        const filtered = Object.keys(files)
            .filter((key) => key.toLowerCase().includes(query))
            .reduce((obj, key) => {
                obj[key] = files[key];
                return obj;
            }, {});

        setFilteredFiles(filtered);
    };

    // Implement the handleDownload function
    const handleDownload = async (fileId, fileName, username) => {
        try {
            const token = getToken();
            const response = await fetchFileContent(fileId, token);
            const blob = new Blob([response], { type: response.type });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Sanitize the filename and username
            const sanitizedFileName = fileName.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, '');
            const sanitizedUsername = username.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, '');

            // Create an anchor element and trigger a download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sanitizedUsername}_${sanitizedFileName}`; // Include username first in the filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Revoke the object URL
            window.URL.revokeObjectURL(url);

            // Log the download on the server
            await fetch(`${BASE_URL}/api/logDownload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filePath: `${sanitizedUsername}_${sanitizedFileName}`, username, timestamp: new Date().toISOString() }),
            });

            alert(`File downloaded successfully as ${sanitizedUsername}_${sanitizedFileName}.`);
        } catch (error) {
            console.error("Error downloading file:", error);
            setError("Error downloading file.");
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column p-3">
            {/* Header Section */}
            <header className="d-flex justify-content-between align-items-center py-3 bg-primary text-white rounded shadow p-3 mb-4">
                <div className="d-flex align-items-center">
                    <h1 className="fs-4 m-0">Dashboard</h1>
                    {/* Manual Refresh Button */}
                    <button
                        onClick={loadFiles}
                        type="button"
                        className="btn btn-light btn-sm ms-3"
                        title="Refresh Files"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                <div className="d-flex align-items-center" style={{ width: "70%" }}>
                    {/* Search Bar */}
                    <div className="input-group w-100">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    {/* Delete All Button */}
                    <button
                        onClick={handleDeleteAll}
                        type="button"
                        className="btn btn-danger btn-sm me-3"
                        title="Delete All Files"
                    >
                        Delete All
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger btn-sm">
                        Logout
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            )}

            {/* File List Section */}
            <div className="flex-grow-1 overflow-auto">
                {Object.keys(filteredFiles).length > 0 ? (
                    <FileList
                        files={filteredFiles}
                        onPreview={handlePreview}
                        onPrint={handlePrint}
                        onDownload={handleDownload} // Pass handleDownload as a prop
                        onRefresh={loadFiles} // Pass loadFiles as a prop
                    />
                ) : (
                    <p className="text-center text-muted">No files available.</p>
                )}
            </div>

            {/* Modal Preview */}
            {previewFile.fileUrl && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Preview: {previewFile.fileName}</h5>
                                <button
                                    onClick={closePreview}
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">
                                <iframe
                                    src={previewFile.fileUrl}
                                    title="File Preview"
                                    className="w-100"
                                    style={{ height: "400px", border: "none" }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={closePreview}
                                    type="button"
                                    className="btn btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;