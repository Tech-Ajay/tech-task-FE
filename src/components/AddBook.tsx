import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBook } from '../features/bookReducer';
import { createBook } from '../api/api';

const AddBook = () => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [publishedDate, setPublishedDate] = useState('');
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({
        title: '',
        author: '',
        publishedDate: ''
    });
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            title: '',
            author: '',
            publishedDate: ''
        };

        // Title validation
        if (!title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        // Author validation
        if (!authorName.trim()) {
            newErrors.author = 'Author name is required';
            isValid = false;
        }

        // Published date validation
        if (!publishedDate) {
            newErrors.publishedDate = 'Published date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(publishedDate);
            const currentDate = new Date();
            if (selectedDate > currentDate) {
                newErrors.publishedDate = 'Published date cannot be in the future';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const clearForm = () => {
        setTitle('');
        setAuthorName('');
        setPublishedDate('');
        setErrors({
            title: '',
            author: '',
            publishedDate: ''
        });
        setApiError('');
    };

    const handleAddBook = async () => {
        setApiError(''); // Clear any previous API errors
        setSuccessMessage(''); // Clear any previous success messages

        if (!validateForm()) {
            return;
        }

        try {
            const newBook = await createBook({
                title: title.trim(),
                author: authorName.trim(),
                publishedDate,
                description: description.trim(),
                imageUrl: imageUrl.trim()
            });
            dispatch(addBook(newBook));
            
            // Show success message
            setSuccessMessage('Book added successfully!');
            
            // Clear form after successful addition
            clearForm();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (error) {
            console.error('Failed to add book:', error);
            setApiError(error instanceof Error ? error.message : 'Failed to add book. Please try again.');
        }
    };

    return (
        <div className="add-book-form">
            <h2>Add Book</h2>
            
            {/* Success Message */}
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            {/* API Error Message */}
            {apiError && (
                <div className="api-error-message">
                    {apiError}
                </div>
            )}

            <div className="form-group">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) {
                            setErrors({ ...errors, title: '' });
                        }
                    }}
                    className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
                <input
                    type="text"
                    placeholder="Author Name"
                    value={authorName}
                    onChange={(e) => {
                        setAuthorName(e.target.value);
                        if (errors.author) {
                            setErrors({ ...errors, author: '' });
                        }
                    }}
                    className={errors.author ? 'error' : ''}
                />
                {errors.author && <span className="error-message">{errors.author}</span>}
            </div>

            <div className="form-group">
                <input
                    type="date"
                    placeholder="Published Date"
                    value={publishedDate}
                    onChange={(e) => {
                        setPublishedDate(e.target.value);
                        if (errors.publishedDate) {
                            setErrors({ ...errors, publishedDate: '' });
                        }
                    }}
                    className={errors.publishedDate ? 'error' : ''}
                />
                {errors.publishedDate && (
                    <span className="error-message">{errors.publishedDate}</span>
                )}
            </div>

            <div className="form-group">
                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="form-group">
                <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>

            <button onClick={handleAddBook}>Add</button>
        </div>
    );
};

export default AddBook;
