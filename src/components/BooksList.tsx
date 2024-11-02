import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBooks, deleteBook } from '../features/bookReducer';
import { findAllBooksSorted, deleteBook as deleteBookApi } from '../api/api';
import { SortField, SortOrder } from '../features/bookReducer';
import '../styles/Books.css';
import { useNavigate } from 'react-router-dom';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books);
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(SortField.TITLE);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
    const [filterBy, setFilterBy] = useState('all');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadInitialBooks = async () => {
            try {
                const sortedBooks = await findAllBooksSorted(sortBy, sortOrder);
                dispatch(setBooks(sortedBooks));
                setIsInitialLoad(false);
            } catch (error) {
                console.error('Error loading initial books:', error);
            }
        };
        loadInitialBooks();
    }, []);

    useEffect(() => {
        const loadSortedBooks = async () => {
            try {
                const sortedBooks = await findAllBooksSorted(sortBy, sortOrder);
                dispatch(setBooks(sortedBooks));
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };
        if (!isInitialLoad) {
            loadSortedBooks();
        }
    }, [sortBy, sortOrder, dispatch, isInitialLoad]);

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

    const filteredAndSortedBooks = books
        .filter((book) => {
            if (filterBy === 'all') return true;
            return book.author.toLowerCase().includes(filterBy.toLowerCase());
        })
        .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleSortOrderChange = () => {
        const newOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
        setSortOrder(newOrder);
    };

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
        setSearchTerm(value);
        setSuggestions(getSuggestions(value));
        setShowSuggestions(true);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
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
        return (<div className="books-container">
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
                </div>
                <div className="no-books">No books available</div>
                </div>);
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
                                value={searchTerm}
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
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortField)}
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
                                {sortOrder === SortOrder.ASC ? '↑' : '↓'}
                            </button>
                        </div>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
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
                    {filteredAndSortedBooks.map((book) => (
                        <div key={book.id} className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
                            {book.imageUrl ? (
                                <img 
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
                                        handleDelete(book.id);
                                    }}
                                    className="view-details-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BooksList;
