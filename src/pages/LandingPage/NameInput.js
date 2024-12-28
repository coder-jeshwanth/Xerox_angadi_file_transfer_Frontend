import React, { useState } from "react";
import './NameInput.css';
import { useNavigate } from "react-router-dom";

const NameInput = ({ setUsername }) => {
    const [name, setName] = useState("");
    const [error, setError] = useState(""); // To track if there's an error
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            setUsername(name);
            sessionStorage.setItem("username", name);
            navigate("/upload");
        } else {
            setError("Please enter a name!"); // Set the error message
        }
    };

    return (
        <div className="name-input-wrapper">
            <div className="header">
                <h1>XEROX</h1>
            </div>
            <div className="form-container">
                <h2>Welcome!</h2>
                <form onSubmit={handleSubmit} className="name-form">
                    <input
                        id="username"
                        type="text"
                        className="name-input"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError(""); // Clear error when user starts typing
                        }}
                        placeholder="Enter your name"
                    />
                    {/* Error message */}
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NameInput;