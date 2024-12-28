import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// User pages
import NameInput from "./pages/LandingPage/NameInput";
import FileUpload from "./pages/FileUploadPage/FileUpload";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
// Owner pages
import OwnerLoginPage from "./pages/OwnerDashboard/LoginPage";
import OwnerDashboardPage from "./pages/OwnerDashboard/DashboardPage";

function App() {
    const [username, setUsername] = useState("");

    return (
        <BrowserRouter>
            <Routes>
                {/* User Routes */}
                <Route path="/" element={<NameInput setUsername={setUsername} />} />
                <Route path="/upload" element={<FileUpload username={username} />} />
                <Route path="/dashboard" element={<UserDashboard username={username} />} />

                {/* Owner Routes */}
                <Route path="/owner/login" element={<OwnerLoginPage />} />
                <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;