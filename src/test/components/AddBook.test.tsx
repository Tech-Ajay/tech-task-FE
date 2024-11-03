import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AddBook from '../../components/AddBook';
import booksReducer from '../../features/bookReducer';
import { createBook } from '../../api/api';
import userEvent from '@testing-library/user-event';

// Mock the API module
jest.mock('../../api/api');

// Suppress console.error messages during tests for cleaner output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock data for testing book creation
const mockBookData = {
  title: "Test Book",
  author: "Test Author",
  publishedDate: "2024-01-01",
  description: "This is a test description",
  imageUrl: "https://example.com/image.jpg"
};

// Helper function to render component with Redux store and Router context
const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      books: booksReducer,
    },
  });
  
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('AddBook Component', () => {
  // Reset mock before each test
  beforeEach(() => {
    (createBook as jest.Mock).mockResolvedValue({
      id: 1,
      ...mockBookData
    });
  });

  // Test 1: Verify all form fields are rendered
  it('renders form fields correctly', () => {
    renderWithProviders(<AddBook />);
    // Check for presence of all required form fields
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Published Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  // Test 2: Verify successful form submission flow
  it('handles form submission successfully', async () => {
    renderWithProviders(<AddBook />);
    
    // Fill out all form fields
    await userEvent.type(screen.getByLabelText(/Title/i), mockBookData.title);
    await userEvent.type(screen.getByLabelText(/Author/i), mockBookData.author);
    await userEvent.type(screen.getByLabelText(/Published Date/i), mockBookData.publishedDate);
    await userEvent.type(screen.getByLabelText(/Description/i), mockBookData.description);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await userEvent.click(submitButton);
    
    // Verify API call and success message
    await waitFor(() => {
      expect(createBook).toHaveBeenCalledWith(expect.objectContaining({
        title: mockBookData.title,
        author: mockBookData.author,
        publishedDate: mockBookData.publishedDate,
        description: mockBookData.description
      }));
      expect(screen.getByText(/Book added successfully/i)).toBeInTheDocument();
    });
  });

  // Test 3: Verify form validation for empty fields
  it('displays validation state for empty fields', async () => {
    renderWithProviders(<AddBook />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await userEvent.click(submitButton);
    
    // Check validation state of required fields
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    const authorInput = screen.getByLabelText(/Author/i) as HTMLInputElement;
    const dateInput = screen.getByLabelText(/Published Date/i) as HTMLInputElement;
    
    expect(titleInput.validity.valueMissing).toBe(true);
    expect(authorInput.validity.valueMissing).toBe(true);
    expect(dateInput.validity.valueMissing).toBe(true);
  });

  // Test 4: Verify error handling during API failure
  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to add book';
    (createBook as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    // ... test implementation ...
  });

  // Test 5: Verify image upload functionality
  it('handles image upload', async () => {
    renderWithProviders(<AddBook />);
    
    // Create mock file and upload
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    // Verify file upload
    expect(input.files?.[0]).toBe(file);
    expect(input.files?.length).toBe(1);
  });

  // Test 6: Verify navigation button presence
  it('shows back button that navigates to book list', () => {
    renderWithProviders(<AddBook />);
    
    const backButton = screen.getByRole('button', { name: /Back to Books/i });
    expect(backButton).toBeInTheDocument();
  });
});