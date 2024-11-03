import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBooks, deleteBook } from '../features/bookReducer';
import { findAllBooksSorted, deleteBook as deleteBookApi } from '../api/api';
import { SortField, SortOrder } from '../features/bookReducer';
import '../styles/Books.css';
import { useNavigate } from 'react-router-dom';
import ImageCache from './ImageCache';
import ConfirmDialog from './subComponents/ConfirmDialog';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books, 
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    );
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        searchTerm: '',
        sortBy: SortField.TITLE,
        sortOrder: SortOrder.ASC,
        filterBy: 'all'
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);

    useEffect(() => {
        const loadInitialBooks = async () => {
            try {
                const sortedBooks = await findAllBooksSorted(filters.sortBy, filters.sortOrder);
                dispatch(setBooks(sortedBooks));
                setIsInitialLoad(false);
            } catch (error) {
                console.error('Error loading initial books:', error);
            }
        };
        loadInitialBooks();
    }, [dispatch, filters.sortBy, filters.sortOrder]);

    useEffect(() => {
        const loadSortedBooks = async () => {
            try {
                const sortedBooks = await findAllBooksSorted(filters.sortBy, filters.sortOrder);
                dispatch(setBooks(sortedBooks));
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };
        if (!isInitialLoad) {
            loadSortedBooks();
        }
    }, [filters.sortBy, filters.sortOrder, dispatch, isInitialLoad]);

    const handleDelete = async (id: number) => {
        try {
            const success = await deleteBookApi(id);
            if (success) {
                dispatch(deleteBook(id));
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
        setBookToDelete(null);
    };

    const filteredAndSortedBooks = useMemo(() => 
        books.filter((book) => {
            if (filters.filterBy === 'all') return true;
            return book.author.toLowerCase().includes(filters.filterBy.toLowerCase());
        })
        .filter((book) =>
            book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ),
        [books, filters.filterBy, filters.searchTerm]
    );

    // Helper function to get unique authors
    const getUniqueAuthors = () => {
        return Array.from(
            books.reduce((acc, book) => {
                acc.add(book.author);
                return acc;
            }, new Set<string>())
        );
    };

    const handleSortOrderChange = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            sortOrder: prev.sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
        }));
    }, []);

    // Helper function to get suggestions based on input
    const getSuggestions = (input: string) => {
        const inputValue = input.trim().toLowerCase();
        if (inputValue.length === 0) return [];

        return Array.from(new Set([
            ...books.map(book => book.title)
                .filter(title => title.toLowerCase().includes(inputValue)),
            ...books.map(book => book.author)
                .filter(author => author.toLowerCase().includes(inputValue))
        ])).slice(0, 5); // Limit to 5 suggestions
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            searchTerm: value
        }));
        setSuggestions(getSuggestions(value));
        setShowSuggestions(true);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setFilters(prev => ({
            ...prev,
            searchTerm: suggestion
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Handle click outside suggestions
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    if (!books || books.length === 0) {
        return (
            <div className="books-container">
                <div className="books-wrapper">
                    <div className="header-container">
                        <h1 className="books-title">Book Collection</h1>
                        <button 
                            className="add-book-button"
                            onClick={() => navigate('/add-book')}
                        >
                            Add New Book
                        </button>
                    </div>
                    <div className="no-books-container">
                        <div className="no-books" onClick={() => navigate('/add-book')}>
                            <span>📚</span>
                            <p>Your book collection is empty</p>
                            <p>Click "Add New Book" to get started!</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="books-container">
            <div className="books-wrapper">
                <div className="header-container">
                    <h1 className="books-title">Book Collection</h1>
                    <button 
                        className="add-book-button"
                        onClick={() => navigate('/add-book')}
                    >
                        Add New Book
                    </button>
                </div>
                
                <div className="search-container">
                    <div className="search-controls">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={filters.searchTerm}
                                onChange={handleSearchChange}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSuggestions(true);
                                }}
                                className="search-input"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="suggestions-container">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="suggestion-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSuggestionClick(suggestion);
                                            }}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="sort-controls" style={{"marginBottom": 0}}>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    sortBy: e.target.value as SortField
                                }))}
                                className="select-control"
                            >
                                <option value={SortField.TITLE}>Sort by Title</option>
                                <option value={SortField.AUTHOR}>Sort by Author</option>
                                <option value={SortField.PUBLISHED_DATE}>Sort by Date</option>
                            </select>
                            <button
                                onClick={handleSortOrderChange}
                                className="sort-order-button"
                            >
                                {filters.sortOrder === SortOrder.ASC ? '↑' : '↓'}
                            </button>
                        </div>
                        <select
                            value={filters.filterBy}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                filterBy: e.target.value
                            }))}
                            className="select-control"
                        >
                            <option value="all">All Authors</option>
                            {getUniqueAuthors().map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="books-grid">
                    {filteredAndSortedBooks.length === 0 ? (
                        <div className="no-results">
                            <p>No books found for "{filters.searchTerm}"</p>
                        </div>
                    ) : (
                        filteredAndSortedBooks.map((book) => (
                            <div key={book.id} className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
                                {book.imageUrl ? (
                                    <ImageCache 
                                        src={book.imageUrl} 
                                        alt={book.title} 
                                        className="book-image"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ): <div className="book-image"></div>}
                                <div className="book-info">
                                    <h2 className="book-title">{book.title}</h2>
                                    <p className="book-author">by {book.author}</p>
                                    <p className="book-date">
                                        Published: {new Date(book.publishedDate).toLocaleDateString()}
                                    </p>
                                    {book.description && (
                                        <p className="book-description">{book.description}</p>
                                    )}
                                </div>
                                <div className="book-action">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBookToDelete(book.id);
                                        }}
                                        className="view-details-button"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <ConfirmDialog
                isOpen={bookToDelete !== null}
                message="Are you sure you want to delete this book?"
                onConfirm={() => bookToDelete && handleDelete(bookToDelete)}
                onCancel={() => setBookToDelete(null)}
            />
        </div>
    );
};

export default BooksList;
