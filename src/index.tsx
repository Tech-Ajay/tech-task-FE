// Import core React dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Redux Provider for state management
import {Provider} from 'react-redux';
import store from './store';

// Import main App component and styles
import App from './App';
import './index.css';

// Import performance monitoring utility
import reportWebVitals from './reportWebVitals';

// Create root element for React application
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// Render the application
root.render(
    // Redux Provider wraps the app to provide access to the store
    <Provider store={store}>
        {/* StrictMode enables additional development checks */}
        <React.StrictMode>
            {/* Main application component */}
            <App/>
        </React.StrictMode>
    </Provider>
);

// Performance monitoring setup
// To use, pass a function to log results:
// - reportWebVitals(console.log) for console output
// - Or pass a function to send to an analytics endpoint
// Learn more at: https://bit.ly/CRA-vitals
reportWebVitals();
