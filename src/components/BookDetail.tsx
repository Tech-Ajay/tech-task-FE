import React, { useState, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findBookById, findBooksByAuthorContaining } from '../api/api';
import { Book } from '../features/bookReducer';
import ImageCache from './ImageCache';
import '../styles/BookDetail.css';
import ConfirmDialog from './subComponents/ConfirmDialog';
import { deleteBook as deleteBookApi } from '../api/api';

// Custom hook to fetch book data and handle loading/error states
const useBookData = (id: string | undefined) => {
    const [book, setBook] = React.useState<Book | null>(null);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (!id) return;

        const fetchBook = async () => {
            try {
                const data = await findBookById(parseInt(id));
                if (data) {
                    setBook(data);
                } else {
                    setError(new Error('Book not found'));
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch book'));
            }
        };

        fetchBook();
    }, [id]);

    return { book, error };
};

// Helper function to handle book deletion via API
const handleDelete = async (id: number) => {
    try {
        const success = await deleteBookApi(id);
        return success;
    } catch (error) {
        console.error('Error deleting book:', error);
    }
};

// Memoized component to display detailed information about a book
const BookDetail = memo(() => {
    // Get book ID from URL parameters and navigation function
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { book, error: bookError } = useBookData(id);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

    // Fetch related books by the same author when book data changes
    React.useEffect(() => {
        if (book?.author) {
            findBooksByAuthorContaining(book.author)
                .then(setRelatedBooks)
                .catch(console.error);
        }
    }, [book?.author]);

    // Filter out the current book from related books list
    const filteredRelatedBooks = useMemo(() => 
        relatedBooks.filter((b: Book) => b.id !== book?.id),
        [relatedBooks, book?.id]
    );

    // Navigate to selected related book's detail page
    const handleRelatedBookClick = async (relatedBookId: number) => {
        navigate(`/book/${relatedBookId}`);
    };

    // Display error state if book fetch failed
    if (bookError) {
        return (
            <div className="pdp-error-container">
                <div className="pdp-error-content">
                    <h2 className="pdp-error-title">Oops!</h2>
                    <p className="pdp-error-message">{bookError.message}</p>
                    <button 
                        className="pdp-back-button"
                        onClick={() => navigate('/')}
                    >
                        Back to collection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pdp-container">
            {/* Header section with title and back button */}
            <div className="books-wrapper">
                <div className="header-container" style={{ marginLeft: '20px',marginRight: '20px' }}>
                    <h1 className="books-title">Book Detail</h1>
                    <button 
                        className="add-book-button"
                        onClick={() => navigate('/')}
                    >
                        Back to collection
                    </button>
                </div>
            </div>

            <div className="pdp-wrapper">
                {/* Main book details card */}
                <div className="pdp-card">
                    <div className="pdp-content">
                        <div className="pdp-image-container">
                            {book?.imageUrl ? (
                                <ImageCache 
                                    className="pdp-image"
                                    src={book.imageUrl} 
                                    alt={book.title}
                                    width={300}
                                    // height={400}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="pdp-image-placeholder" />
                            )}
                        </div>
                        <div className="pdp-info">
                            <div className="pdp-author">{book?.author}</div>
                            <h1 className="pdp-title">{book?.title}</h1>
                            <p className="pdp-date">
                                Published: {book?.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : ''}
                            </p>
                            <p className="pdp-description">{book?.description}</p>
                            <button 
                                onClick={() => setShowDeleteDialog(true)}
                                className="pdp-back-button"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related books section - shows other books by the same author */}
                {filteredRelatedBooks.length > 0 && (
                    <div className="pdp-related">
                        <h2 className="pdp-related-title">More by {book?.author}</h2>
                        <div className="pdp-related-scroll">
                            <div className="pdp-related-track">
                                {[...Array(4)].map((_, index) => (
                                    <React.Fragment key={`group-${index}`}>
                                        {filteredRelatedBooks.map((relatedBook) => (
                                            <div 
                                                key={`${index}-${relatedBook.id}`} 
                                                className="pdp-related-card"
                                                onClick={() => handleRelatedBookClick(relatedBook.id)}
                                            >
                                                <div className="pdp-related-image-container">
                                                    {relatedBook.imageUrl ? (
                                                        <ImageCache
                                                            className="pdp-related-image"
                                                            src={relatedBook.imageUrl} 
                                                            alt={relatedBook.title}
                                                            width={300}
                                                            height={300}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="pdp-related-image-placeholder" />
                                                    )}
                                                </div>
                                                <div className="pdp-related-info">
                                                    <h3 className="pdp-related-book-title">{relatedBook.title}</h3>
                                                    <p className="pdp-related-book-date">
                                                        {new Date(relatedBook.publishedDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation dialog for book deletion */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                message="Are you sure you want to delete this book?"
                onConfirm={async () => {
                    await handleDelete(book?.id || 0);
                    setShowDeleteDialog(false);
                    navigate('/');
                }}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </div>
    );
});

export default BookDetail;