import React, { useState, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findBookById, findBooksByAuthorContaining } from '../api/api';
import { Book } from '../features/bookReducer';
import ImageCache from './ImageCache';
import '../styles/BookDetail.css';
import ConfirmDialog from './subComponents/ConfirmDialog';

// Create a custom hook for data fetching
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

const BookDetail = memo(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { book, error: bookError } = useBookData(id);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

    React.useEffect(() => {
        if (book?.author) {
            findBooksByAuthorContaining(book.author)
                .then(setRelatedBooks)
                .catch(console.error);
        }
    }, [book?.author]);

    // Memoize expensive computations
    const filteredRelatedBooks = useMemo(() => 
        relatedBooks.filter((b: Book) => b.id !== book?.id),
        [relatedBooks, book?.id]
    );

    const handleRelatedBookClick = async (relatedBookId: number) => {
        navigate(`/book/${relatedBookId}`);
    };

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
});

export default BookDetail;