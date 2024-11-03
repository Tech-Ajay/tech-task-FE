import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBooks, deleteBook, Book, SortField, SortOrder } from '../features/bookReducer';
import { deleteBook as deleteBookApi, findBooksWithPagination } from '../api/api';
import '../styles/Books.css';
import { useNavigate } from 'react-router-dom';
import ImageCache from './ImageCache';
import ConfirmDialog from './subComponents/ConfirmDialog';

// Update filters state interface
interface FiltersState {
    searchTerm: string;
    sortBy: SortField;
    sortOrder: SortOrder;
    titleFilter: string;
    authorFilter: string;
}

// Initial filters state
const initialFilters: FiltersState = {
    searchTerm: '',
    sortBy: SortField.TITLE,
    sortOrder: SortOrder.ASC,
    titleFilter: '',
    authorFilter: ''
};

const BooksList = () => {
    // Redux state management with memoized selector to prevent unnecessary rerenders
    const books = useSelector((state: RootState) => state.books.books, 
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    );
    const dispatch = useDispatch();

    // State management for filters, search, and UI
    const [filters, setFilters] = useState<FiltersState>(initialFilters);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);

    // Add pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    // Load books with pagination
    useEffect(() => {
        const loadBooks = async () => {
            try {
                const result = await findBooksWithPagination(
                    pagination.currentPage,
                    pagination.pageSize,
                    filters.sortBy,
                    filters.sortOrder,
                    filters.titleFilter,
                    filters.authorFilter
                );
                
                dispatch(setBooks(result.content));
                setPagination(prev => ({
                    ...prev,
                    currentPage: result.pageNumber,
                    pageSize: result.pageSize,
                    totalPages: result.totalPages,
                    totalElements: result.totalElements
                }));
            } catch (error) {
                console.error('Error loading books:', error);
            }
        };

        loadBooks();
    }, [
        pagination.currentPage,
        pagination.pageSize,
        filters.sortBy,
        filters.sortOrder,
        filters.titleFilter,
        filters.authorFilter,
        dispatch
    ]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                titleFilter: prev.searchTerm,
                authorFilter: prev.searchTerm
            }));
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.searchTerm]);

    // Handle book deletion
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

    // Instead, use the books directly from Redux state
    const displayedBooks = books;

    // Extract unique authors for filter dropdown
    const getUniqueAuthors = () => {
        return Array.from(
            books.reduce((acc, book) => {
                acc.add(book.author);
                return acc;
            }, new Set<string>())
        );
    };

    // Toggle sort order between ascending and descending
    const handleSortOrderChange = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            sortOrder: prev.sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
        }));
    }, []);

    // Generate search suggestions based on input
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

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            searchTerm: value
        }));
        setSuggestions(getSuggestions(value));
        setShowSuggestions(true);
    };

    // Handle selection of a search suggestion
    const handleSuggestionClick = (suggestion: string) => {
        setFilters(prev => ({
            ...prev,
            searchTerm: suggestion
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Render empty state if no books exist
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
                            value={filters.authorFilter}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                authorFilter: e.target.value
                            }))}
                            className="select-control"
                        >
                            <option value="">All Authors</option>
                            {getUniqueAuthors().map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="books-grid">
                    {displayedBooks.length === 0 ? (
                        <div className="no-results">
                            <p>No books found for "{filters.searchTerm}"</p>
                        </div>
                    ) : (
                        displayedBooks.map((book) => (
                            <div key={book.id} className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
                                {book.imageUrl ? (
                                    <ImageCache 
                                        src={book.imageUrl} 
                                        alt={book.title} 
                                        className="book-image"
                                        height={200}
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

                {/* Add pagination controls */}
                <div className="pagination-controls">
                    <button
                        onClick={() => setPagination(prev => ({
                            ...prev,
                            currentPage: prev.currentPage - 1
                        }))}
                        disabled={pagination.currentPage === 0}
                        className="pagination-button"
                    >
                        Previous
                    </button>
                    
                    <span className="pagination-info">
                        Page {pagination.currentPage + 1} of {pagination.totalPages}
                        ({pagination.totalElements} total items)
                    </span>

                    <button
                        onClick={() => setPagination(prev => ({
                            ...prev,
                            currentPage: prev.currentPage + 1
                        }))}
                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                        className="pagination-button"
                    >
                        Next
                    </button>

                    <select
                        value={pagination.pageSize}
                        onChange={(e) => setPagination(prev => ({
                            ...prev,
                            pageSize: Number(e.target.value),
                            currentPage: 0 // Reset to first page when changing page size
                        }))}
                        className="select-control"
                    >
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
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
