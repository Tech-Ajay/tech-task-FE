import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BooksList from './components/BooksList';
import AddBook from './components/AddBook';
import BookDetail from './components/BookDetail';
import NotFound from './components/NotFound';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<BooksList />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;

