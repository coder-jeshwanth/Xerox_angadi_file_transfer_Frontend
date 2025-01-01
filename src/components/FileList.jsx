import 'bootstrap/dist/css/bootstrap.min.css';

const FileList = ({ files, onPreview, onPrint, onDownload, onRefresh }) => {
    const handleDeleteByUsername = async (username) => {
        try {
            const response = await fetch(`https://backend.tigerjeshy.live/api/auth/files/deleteByUsername?userName=${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert(`Files for ${username} deleted successfully.`);
                onRefresh(); // Call the refresh function after successful deletion
            } else {
                alert(`Failed to delete files for ${username}.`);
            }
        } catch (error) {
            console.error("Error deleting files by username:", error);
            alert("Error deleting files. Please try again.");
        }
    };

    if (Object.keys(files).length === 0) {
        return (
            <div className="text-center mt-4">
                <p className="text-muted fs-5">No files available.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex flex-wrap gap-3 justify-content-center">
                {Object.entries(files).map(([username, userFiles]) => (
                    <div
                        key={username}
                        className="card shadow-sm"
                        style={{
                            flex: '1 1 calc(30% - 1rem)',
                            maxWidth: '30%',
                            minWidth: '280px',
                        }}
                    >
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{username}</h5>
                            <button
                                onClick={() => handleDeleteByUsername(username)}
                                className="btn btn-danger btn-sm"
                                title="Delete User Files"
                            >
                                &times;
                            </button>
                        </div>
                        <ul className="list-group list-group-flush">
                            {Array.isArray(userFiles) ? (
                                userFiles.map((file) => (
                                    <li
                                        key={file.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <span className="fw-semibold fs-6">{file.fileName}</span>
                                        <div className="btn-group">
                                            <button
                                                onClick={() => onPreview(file.id, file.fileName)}
                                                className="btn btn-success btn-sm"
                                            >
                                                Preview
                                            </button>
                                            <button
                                                onClick={() => onPrint(file.id, file.fileName)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Print
                                            </button>
                                            <button
                                                onClick={() => onDownload(file.id, file.fileName, username)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-muted">
                                    No files found for this user.
                                </li>
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;