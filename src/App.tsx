import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BooksList from './components/BooksList';
import AddBook from './components/AddBook';
import BookDetail from './components/BookDetail';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<BooksList />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/book/:id" element={<BookDetail />} />
            </Routes>
        </Router>
    );
};

export default App;

