import React, { useState, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
    fetchFiles,
    fetchFileContent,
    deleteFileAfterPrint,
} from "../../services/fileService";
import { getToken, clearToken } from "../../services/tokenUtils";
import { useNavigate } from "react-router-dom";
import FileList from "../../components/FileList";
import "bootstrap/dist/css/bootstrap.min.css";

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
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                    Logout
                </button>
            </header>

            {/* Search Bar */}
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>

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