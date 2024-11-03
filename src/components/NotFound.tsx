import React from 'react';
// Import navigation hook from react-router
import { useNavigate } from 'react-router-dom';
// Import styles for 404 page
import '../styles/NotFound.css';

// 404 Not Found component that displays when a route doesn't exist
const NotFound: React.FC = () => {
    // Hook to programmatically navigate between routes
    const navigate = useNavigate();

    return (
        // Main container for the 404 page
        <div className="not-found-container">
            {/* Content wrapper for centering and styling */}
            <div className="not-found-content">
                {/* Large 404 error code display */}
                <h1 className="not-found-title">404</h1>
                {/* Secondary heading explaining the error */}
                <h2 className="not-found-subtitle">Page Not Found</h2>
                {/* Friendly error message for users */}
                <p className="not-found-message">
                    Oops! The page you're looking for doesn't exist.
                </p>
                {/* Navigation button to return to home page */}
                <button 
                    className="not-found-button"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound; 