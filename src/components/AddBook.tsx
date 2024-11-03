'use client'

import React, { useState, useRef, useCallback, memo } from 'react'
import { useDispatch } from 'react-redux';
import { addBook } from '../features/bookReducer';
import { createBook } from '../api/api';
import '../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';
import ImageCache from './ImageCache';

// Define interfaces for form validation and state management
interface FormErrors {
    title: string;
    author: string;
    publishedDate: string;
    description?: string; // Make description optional
}

interface FormState {
    title: string;
    author: string;
    publishedDate: string;
    description: string;
    previewUrl: string | null;
    errors?: FormErrors;
}

// Memoized component to prevent unnecessary re-renders
export default memo(() => {
    // Initialize Redux dispatch and React Router navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State management for form data and UI states
    const [formData, setFormData] = useState<FormState>({
        title: '',
        author: '',
        publishedDate: '',
        description: '',
        previewUrl: null,
        errors: undefined
    });
    
    // Refs and state for file upload handling
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    
    // State for handling form submission and feedback
    const [apiError, setApiError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handle form submission and book creation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError('')
        setSuccessMessage('')

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            const newBook = await createBook({
                title: formData.title.trim(),
                author: formData.author.trim(),
                publishedDate: formData.publishedDate,
                description: formData.description.trim(),
                imageUrl: formData.previewUrl || undefined
            })
            dispatch(addBook(newBook))
            setSuccessMessage('Book added successfully!')
            setTimeout(() => {
                clearForm()
                setIsSubmitting(false)
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Failed to add book:', error)
            setIsSubmitting(false)
            setApiError(error instanceof Error ? error.message : 'Failed to add book. Please try again.')
        }
    }

    // Validate form fields and return validation status
    const validateForm = useCallback(() => {
        const errors = {} as FormErrors;
        let isValid = true;

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
            isValid = false;
        }

        if (!formData.author.trim()) {
            errors.author = 'Author name is required';
            isValid = false;
        }

        if (!formData.publishedDate) {
            errors.publishedDate = 'Published date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(formData.publishedDate)
            const currentDate = new Date()
            if (selectedDate > currentDate) {
                errors.publishedDate = 'Published date cannot be in the future'
                isValid = false
            }
        }

        return { isValid, errors };
    }, [formData]);

    // Reset form to initial state
    const clearForm = () => {
        setFormData({
            title: '',
            author: '',
            publishedDate: '',
            description: '',
            previewUrl: null
        })
        setApiError('')
    }

    // Handle image upload and preview
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    previewUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);

            const formDataObj = new FormData();
            formDataObj.append('file', file);

            try {
                const response = await fetch('https://supertails-backend.el.r.appspot.com/upload', {
                    method: 'POST',
                    body: formDataObj,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const responseData = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        previewUrl: responseData.url
                    }));
                } else {
                    throw new Error('Failed to upload image');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                setApiError('Failed to upload image. Please try again.');
                setFormData(prev => ({
                    ...prev,
                    previewUrl: null
                }));
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Trigger file input click when image area is clicked
    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="books-container">
            <div className="books-wrapper">
                <div className="header-container">
                    <h1 className="books-title">Add a New Book</h1>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/')}
                    >
                        Back to Books
                    </button>
                </div>
                <div className="add-book-form-container">
                    {successMessage && (
                        <div className="success-message">
                            {successMessage}
                        </div>
                    )}
                    
                    {apiError && (
                        <div className="api-error-message">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-spacing">
                        <div className="image-upload-container">
                            <div onClick={handleImageClick} className="image-upload-area">
                                {isUploading ? (
                                    <div className="loader">Uploading...</div>
                                ) : formData.previewUrl ? (
                                    <ImageCache 
                                        src={formData.previewUrl} 
                                        alt="Book cover preview" 
                                        className="preview-image"
                                    />
                                ) : (
                                    <span className="upload-text">Click to add book cover</span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                data-testid="file-input"
                            />
                        </div>
                        <div className="form-grid">
                            <div>
                                <label htmlFor="title" className="form-label">
                                    Title
                                </label>
                                <input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value })
                                    }}
                                    style={{
                                        width: '95%'
                                    }}
                                    className={`form-input ${formData.errors?.title ? 'error' : ''}`}
                                    required
                                />
                                {formData.errors?.title && <span className="error-message">{formData.errors.title}</span>}
                            </div>
                            <div>
                                <label htmlFor="author" className="form-label">
                                    Author
                                </label>
                                <input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => {
                                        setFormData({ ...formData, author: e.target.value })
                                    }}
                                    style={{
                                        width: '95%'
                                    }}
                                    className={`form-input ${formData.errors?.author ? 'error' : ''}`}
                                    required
                                />
                                {formData.errors?.author && <span className="error-message">{formData.errors.author}</span>}
                            </div>
                        </div>
                        <div className="form-spacing">
                            <label htmlFor="publishedDate" className="form-label">
                                Published Date
                            </label>
                            <input
                                id="publishedDate"
                                type="date"
                                value={formData.publishedDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, publishedDate: e.target.value })
                                }}
                                className={`form-input ${formData.errors?.publishedDate ? 'error' : ''}`}
                                required
                            />
                            {formData.errors?.publishedDate && <span className="error-message">{formData.errors.publishedDate}</span>}
                        </div>
                        <div className="form-spacing">
                            <label htmlFor="description" className="form-label">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value })
                                }}
                                rows={4}
                                className={`form-input ${formData.errors?.description ? 'error' : ''}`}
                                required
                            />
                            {formData.errors?.description && <span className="error-message">{formData.errors.description}</span>}
                        </div>
                        <div className="form-spacing">
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding Book...' : 'Add Book'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
})