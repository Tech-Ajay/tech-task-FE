'use client'

import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux';
import { addBook } from '../features/bookReducer';
import { createBook } from '../api/api';
import '../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';
import ImageCache from './ImageCache';

// Add interface for errors
interface FormErrors {
    title: string;
    author: string;
    publishedDate: string;
    description?: string; // Make description optional
}

export default function AddBook() {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [publishedDate, setPublishedDate] = useState('')
    const [description, setDescription] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [apiError, setApiError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [errors, setErrors] = useState<FormErrors>({
        title: '',
        author: '',
        publishedDate: '',
        description: ''
    })
    const [isUploading, setIsUploading] = useState(false)
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                title: title.trim(),
                author: author.trim(),
                publishedDate,
                description: description.trim(),
                imageUrl: previewUrl || undefined
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

    const validateForm = () => {
        let isValid = true
        const newErrors = {
            title: '',
            author: '',
            publishedDate: ''
        }

        if (!title.trim()) {
            newErrors.title = 'Title is required'
            isValid = false
        }

        if (!author.trim()) {
            newErrors.author = 'Author name is required'
            isValid = false
        }

        if (!publishedDate) {
            newErrors.publishedDate = 'Published date is required'
            isValid = false
        } else {
            const selectedDate = new Date(publishedDate)
            const currentDate = new Date()
            if (selectedDate > currentDate) {
                newErrors.publishedDate = 'Published date cannot be in the future'
                isValid = false
            }
        }

        setErrors(newErrors)
        return isValid
    }

    const clearForm = () => {
        setTitle('')
        setAuthor('')
        setPublishedDate('')
        setDescription('')
        setPreviewUrl(null)
        setErrors({
            title: '',
            author: '',
            publishedDate: ''
        })
        setApiError('')
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setIsUploading(true)

            // Show preview immediately
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload image
            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await fetch('https://supertails-backend.el.r.appspot.com/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    }
                })
                
                if (response.ok) {
                    const responseData = await response.json()
                    setPreviewUrl(responseData.url)
                } else {
                    throw new Error('Failed to upload image')
                }
            } catch (error) {
                console.error('Error uploading image:', error)
                setApiError('Failed to upload image. Please try again.')
                setPreviewUrl(null)
            } finally {
                setIsUploading(false)
            }
        }
    }

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
                                ) : previewUrl ? (
                                    <ImageCache 
                                        src={previewUrl} 
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
                            />
                        </div>
                        <div className="form-grid">
                            <div>
                                <label htmlFor="title" className="form-label">
                                    Title
                                </label>
                                <input
                                    id="title"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value)
                                        if (errors.title) {
                                            setErrors({ ...errors, title: '' })
                                        }
                                    }}
                                    style={{
                                        width: '95%'
                                    }}
                                    className={`form-input ${errors.title ? 'error' : ''}`}
                                    required
                                />
                                {errors.title && <span className="error-message">{errors.title}</span>}
                            </div>
                            <div>
                                <label htmlFor="author" className="form-label">
                                    Author
                                </label>
                                <input
                                    id="author"
                                    value={author}
                                    onChange={(e) => {
                                        setAuthor(e.target.value)
                                        if (errors.author) {
                                            setErrors({ ...errors, author: '' })
                                        }
                                    }}
                                    style={{
                                        width: '95%'
                                    }}
                                    className={`form-input ${errors.author ? 'error' : ''}`}
                                    required
                                />
                                {errors.author && <span className="error-message">{errors.author}</span>}
                            </div>
                        </div>
                        <div className="form-spacing">
                            <label htmlFor="publishedDate" className="form-label">
                                Published Date
                            </label>
                            <input
                                id="publishedDate"
                                type="date"
                                value={publishedDate}
                                onChange={(e) => {
                                    setPublishedDate(e.target.value)
                                    if (errors.publishedDate) {
                                        setErrors({ ...errors, publishedDate: '' })
                                    }
                                }}
                                className={`form-input ${errors.publishedDate ? 'error' : ''}`}
                                required
                            />
                            {errors.publishedDate && <span className="error-message">{errors.publishedDate}</span>}
                        </div>
                        <div className="form-spacing">
                            <label htmlFor="description" className="form-label">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    if (errors.description) {
                                        setErrors({ ...errors, description: '' })
                                    }
                                }}
                                rows={4}
                                className={`form-input ${errors.description ? 'error' : ''}`}
                                required
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
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
}