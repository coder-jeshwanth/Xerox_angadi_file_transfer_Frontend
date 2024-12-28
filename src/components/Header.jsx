import React from 'react';

const Header = ({ onLogout }) => {
    return (
        <header
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '10px 20px',
                background: '#f0f0f0',
                width: '100vw'
            }}
        >
            <h1>Owner Dashboard</h1>
            <button
                onClick={onLogout}
                style={{
                    padding: '10px 15px',
                    fontSize: '16px',
                    background: '#ff4d4d',
                    color: '#2f8fd5',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Logout
            </button>
        </header>
    );
};

export default Header;