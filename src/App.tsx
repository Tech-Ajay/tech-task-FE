// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import BooksList from './components/BooksList';
import AddBook from './components/AddBook';
import BookDetail from './components/BookDetail';
import NotFound from './components/NotFound';

// Main App component with routing configuration
const App: React.FC = () => {
    return (
        // Router wrapper for handling client-side routing
        <Router>
            {/* Routes container for defining application routes */}
            <Routes>
                {/* Home page - displays list of books */}
                <Route path="/" element={<BooksList />} />

                {/* Add book page - form for creating new books */}
                <Route path="/add-book" element={<AddBook />} />

                {/* Book detail page - displays single book info with dynamic ID parameter */}
                <Route path="/book/:id" element={<BookDetail />} />

                {/* Catch-all route for handling 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;

