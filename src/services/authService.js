import axios from 'axios';

const API_BASE_URL = 'https://backend.tigerjeshy.live/api/auth';

export const login = async (username, password) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/login`,
            new URLSearchParams({ username, password }).toString(), // Form data format
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded", // Set proper Content-Type
                },
            }
        );
        return response.data; // Contains JWT token on success
    } catch (error) {
        throw (error.response && error.response.data && error.response.data.message) || "Login failed"; // Extract error message
    }
};