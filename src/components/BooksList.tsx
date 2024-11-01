import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBooks } from '../features/bookReducer';
import { findAllBooksSorted, deleteBook as deleteBookApi } from '../api/api';
import { SortField, SortOrder } from '../features/bookReducer';
import SearchBar from './SearchBar';
import { deleteBook } from '../features/bookReducer';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books);
    const dispatch = useDispatch();
    const [sortField, setSortField] = useState<SortField>(SortField.TITLE);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

    useEffect(() => {
        const loadSortedBooks = async () => {
            try {
                console.log('Fetching books...');
                const sortedBooks = await findAllBooksSorted(sortField, sortOrder);
                console.log('Fetched books:', sortedBooks);
                dispatch(setBooks(sortedBooks));
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };
        loadSortedBooks();
    }, [sortField, sortOrder, dispatch]);

    const handleDelete = async (id: number) => {
        try {
            const success = await deleteBookApi(id);
            if (success) {
                dispatch(deleteBook(id));
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    if (!books || books.length === 0) {
        return <div className="no-books">No books available</div>;
    }

    return (
        <div className="books-list">
            <div className="controls">
                <SearchBar onSearch={(query) => {/* implement search */}} />
                <div className="sort-controls">
                    <select 
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as SortField)}
                    >
                        <option value={SortField.TITLE}>Title</option>
                        <option value={SortField.AUTHOR}>Author</option>
                        <option value={SortField.PUBLISHED_DATE}>Date</option>
                    </select>
                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    >
                        <option value={SortOrder.ASC}>Ascending</option>
                        <option value={SortOrder.DESC}>Descending</option>
                    </select>
                </div>
            </div>
            <div className="books-grid">
                {books.map(book => (
                    <div key={book.id} className="book-card">
                        {book.imageUrl && (
                            <div className="book-image-container">
                                <img 
                                    src={book.imageUrl} 
                                    alt={book.title}
                                    className="book-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="book-content">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">By: {book.author}</p>
                            <p className="book-date">
                                Published: {new Date(book.publishedDate).toLocaleDateString()}
                            </p>
                            {book.description && (
                                <p className="book-description">{book.description}</p>
                            )}
                            <button 
                                onClick={() => handleDelete(book.id)}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BooksList;
