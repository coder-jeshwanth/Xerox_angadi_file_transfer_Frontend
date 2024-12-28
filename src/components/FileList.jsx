import './filelist.css';

const FileList = ({ files, onPreview, onPrint }) => {
    // Check if the files object is empty.
    if (Object.keys(files).length === 0) {
        return <p className="empty-message">No files available.</p>;
    }

    return (
        <div className="file-list-container">
            {Object.entries(files).map(([username, userFiles]) => (
                <div key={username} className="file-group">
                    <div className="file-group-header">
                        <h3 className="username-title">{username}</h3>
                    </div>
                    <ul className="file-items">
                        {/* Safeguard to ensure userFiles is an array */}
                        {Array.isArray(userFiles) ? (
                            userFiles.map((file) => (
                                <li key={file.id} className="file-item">
                                    <span className="file-name">{file.fileName}</span>
                                    <div className="file-actions">
                                        <button
                                            onClick={() => onPreview(file.id, file.fileName)}
                                            className="file-button preview-button"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => onPrint(file.id, file.fileName)}
                                            className="file-button print-button"
                                        >
                                            Print
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>No files found for this user.</p>
                        )}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default FileList;