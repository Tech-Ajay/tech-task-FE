import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBooks } from './features/bookReducer';
import BooksList from './components/BooksList';
import AddBook from './components/AddBook';
import { fetchBooks } from './api/api';

const App: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const books = await fetchBooks();
                dispatch(setBooks(books));
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };

        loadBooks();
    }, [dispatch]);

    return (
        <div>
            <h1>Book Management</h1>
            <AddBook />
            <BooksList />
        </div>
    );
};

export default App;

