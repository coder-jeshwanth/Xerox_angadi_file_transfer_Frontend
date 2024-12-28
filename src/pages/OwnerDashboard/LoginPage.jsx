import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService"; // Import owner login API utility
import { saveToken } from "../../services/tokenUtils"; // Save token to sessionStorage

const OwnerLoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { jwtToken } = await login(username, password); // Authenticate
            saveToken(jwtToken); // Save the token
            navigate("/owner/dashboard"); // Redirect to Owner Dashboard
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.heading}>Owner Login</h1>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f7f8fc", // Light gray background
    },
    formContainer: {
        backgroundColor: "#ffffff", // White background for the form
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle box shadow
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
    },
    heading: {
        fontSize: "24px",
        marginBottom: "20px",
        color: "#333333", // Darker text for contrast
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginBottom: "10px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    input: {
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#007BFF", // Primary button color
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    buttonHover: {
        backgroundColor: "#0056b3", // Darker on hover
    },
};

export default OwnerLoginPage;