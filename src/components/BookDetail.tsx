import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findBookById, findBooksByAuthorContaining } from '../api/api';
import { Book } from '../features/bookReducer';
import ImageCache from './ImageCache';
import '../styles/BookDetail.css';
import ConfirmDialog from './subComponents/ConfirmDialog';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBook = async () => {
            setLoading(true);
            setError(null);
            if (id) {
                try {
                    const bookData = await findBookById(parseInt(id));
                    if (!bookData) {
                        setError('Book not found');
                        return;
                    }
                    setBook(bookData);

                    const related = await findBooksByAuthorContaining(bookData.author);
                    setRelatedBooks(related.filter(b => b.id !== bookData.id));
                } catch (error) {
                    setError('An error occurred while loading the book');
                    console.error('Error loading book:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBook();
    }, [id]);

    const handleRelatedBookClick = async (relatedBookId: number) => {
        navigate(`/book/${relatedBookId}`);
    };

    if (loading) {
        return (
            <div className="pdp-loading-container">
                <div className="pdp-loading-text">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pdp-error-container">
                <div className="pdp-error-content">
                    <h2 className="pdp-error-title">Oops!</h2>
                    <p className="pdp-error-message">{error}</p>
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
            <div className="books-wrapper">
                <div className="header-container">
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

                {relatedBooks.length > 0 && (
                    <div className="pdp-related">
                        <h2 className="pdp-related-title">More by {book?.author}</h2>
                        <div className="pdp-related-scroll">
                            <div className="pdp-related-track">
                                {[...Array(4)].map((_, index) => (
                                    <React.Fragment key={`group-${index}`}>
                                        {relatedBooks.map((relatedBook) => (
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
            <ConfirmDialog
                isOpen={showDeleteDialog}
                message="Are you sure you want to delete this book?"
                onConfirm={() => {
                    setShowDeleteDialog(false);
                    navigate('/');
                }}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </div>
    );
};

export default BookDetail;