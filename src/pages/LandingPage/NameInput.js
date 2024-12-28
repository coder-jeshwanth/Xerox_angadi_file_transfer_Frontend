import React, { useState } from "react";
import axios from "axios";
import "./NameInput.css";
import { useNavigate } from "react-router-dom";

const NameInput = ({ setUsername }) => {
    const [name, setName] = useState("");
    const [error, setError] = useState(""); // To track if there's an error
    const [isChecking, setIsChecking] = useState(false); // To show a loader during API requests
    const navigate = useNavigate();

    // Function to check username availability
    const checkUsernameAvailability = async (username) => {
        try {
            setIsChecking(true); // Indicate the API call is in progress
            const response = await axios.post("http://localhost:8080/api/user/checkUsername", null, {
                params: { username }, // Passing username as form data (query param in this case)
            });
            setIsChecking(false);
            return response.data; // Return success message
        } catch (error) {
            setIsChecking(false);
            if (error.response?.status === 400) { // Username already exists case
                throw new Error("Username already exists!");
            } else {
                throw new Error("Something went wrong. Please try again.");
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim()) {
            try {
                // Check username availability via API
                await checkUsernameAvailability(name);

                // If no error, set the username and navigate
                setUsername(name);
                sessionStorage.setItem("username", name);
                navigate("/upload");
            } catch (err) {
                // If there's an error, display it
                setError(err.message);
            }
        } else {
            setError("Please enter a name!"); // Show error for empty input
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
                            setError(""); // Clear error on input change
                        }}
                        placeholder="Enter your name"
                    />
                    {/* Error or loader message */}
                    {error && <p className="error-message">{error}</p>}
                    {isChecking && <p className="loading-message">Checking username...</p>}
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isChecking} // Disable button while checking username
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NameInput;