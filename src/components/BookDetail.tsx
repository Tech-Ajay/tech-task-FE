import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findBookById, findBooksByAuthorContaining } from '../api/api';
import { Book } from '../features/bookReducer';
import '../styles/BookDetail.css';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const loadBook = async () => {
            if (id) {
                const bookData = await findBookById(parseInt(id));
                setBook(bookData);

                if (bookData) {
                    const related = await findBooksByAuthorContaining(bookData.author);
                    setRelatedBooks(related.filter(b => b.id !== bookData.id));
                }
            }
        };
        loadBook();
    }, [id]);

    if (!book) {
        return (
            <div className="pdp-loading-container">
                <div className="pdp-loading-text">Loading...</div>
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
                            {book.imageUrl ? (
                                <img 
                                    className="pdp-image"
                                    src={book.imageUrl} 
                                    alt={book.title}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="pdp-image-placeholder" />
                            )}
                        </div>
                        <div className="pdp-info">
                            <div className="pdp-author">{book.author}</div>
                            <h1 className="pdp-title">{book.title}</h1>
                            <p className="pdp-date">
                                Published: {new Date(book.publishedDate).toLocaleDateString()}
                            </p>
                            <p className="pdp-description">{book.description}</p>
                            <button 
                                onClick={() => navigate('/')}
                                className="pdp-back-button"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                {relatedBooks.length > 0 && (
                    <div className="pdp-related">
                        <h2 className="pdp-related-title">More by {book.author}</h2>
                        <div className="pdp-related-scroll">
                            <div className="pdp-related-track">
                                {/* Repeat the items multiple times for seamless looping */}
                                {[...Array(4)].map((_, index) => (
                                    <React.Fragment key={`group-${index}`}>
                                        {relatedBooks.map((relatedBook) => (
                                            <div 
                                                key={`${index}-${relatedBook.id}`} 
                                                className="pdp-related-card"
                                                onClick={() => navigate(`/book/${relatedBook.id}`)}
                                            >
                                                <div className="pdp-related-image-container">
                                                    {relatedBook.imageUrl ? (
                                                        <img 
                                                            className="pdp-related-image"
                                                            src={relatedBook.imageUrl} 
                                                            alt={relatedBook.title}
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
    );
};

export default BookDetail; 