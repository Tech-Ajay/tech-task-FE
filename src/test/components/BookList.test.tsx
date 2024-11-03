import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import BooksList from '../../components/BooksList';
import booksReducer from '../../features/bookReducer';
import { findAllBooksSorted } from '../../api/api';

// Mock the API module
jest.mock('../../api/api');

// Mock data for testing
const mockBooks = [
  {
    id: 1,
    title: 'Book One',
    author: 'Author One',
    publishedDate: '2023-01-01',
    description: 'Description One'
  },
  {
    id: 2,
    title: 'Book Two',
    author: 'Author Two',
    publishedDate: '2023-02-02',
    description: 'Description Two'
  }
];

// Helper function to render component with Redux store and Router context
const renderWithProviders = (component: React.ReactElement) => {
  // Create store with mock data preloaded
  const store = configureStore({
    reducer: {
      books: booksReducer,
    },
    preloadedState: {
      books: {
        books: mockBooks
      }
    }
  });
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('BooksList Component', () => {
  // Reset mock before each test
  beforeEach(() => {
    (findAllBooksSorted as jest.Mock).mockResolvedValue(mockBooks);
  });

  // Test 1: Verify basic rendering of book list
  it('renders book list correctly', async () => {
    await act(async () => {
      renderWithProviders(<BooksList />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Book One')).toBeInTheDocument();
      expect(screen.getByText('Book Two')).toBeInTheDocument();
    });
  });

  // Test 2: Verify search functionality
  it('handles search functionality', async () => {
    await act(async () => {
      renderWithProviders(<BooksList />);
    });
    
    // Simulate user typing in search input
    const searchInput = screen.getByPlaceholderText(/Search books/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Book One' } });
    });
    
    // Verify filtered results
    await waitFor(() => {
      expect(screen.getAllByText('Book One')[0]).toBeInTheDocument();
      expect(screen.queryByText('Book Two')).not.toBeInTheDocument();
    });
  });

  // Test 3: Verify sorting functionality
  it('handles sorting functionality', async () => {
    await act(async () => {
      renderWithProviders(<BooksList />);
    });
    
    // Change sort selection to 'AUTHOR'
    const sortSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: 'AUTHOR' } });
    });
    
    // Verify API call with correct sort parameters
    await waitFor(() => {
      expect(findAllBooksSorted).toHaveBeenCalledWith('AUTHOR', 'ASC');
    });
  });

  // Test 4: Verify empty state handling
  it('handles empty book list', async () => {
    // Mock API to return empty array
    (findAllBooksSorted as jest.Mock).mockResolvedValue([]);
    
    await act(async () => {
      renderWithProviders(<BooksList />);
    });
    
    // Verify empty state message
    await waitFor(() => {
      expect(screen.getByText(/Your book collection is empty/i)).toBeInTheDocument();
    });
  });

  // Test 5: Verify author filtering
  it('handles author filter', async () => {
    await act(async () => {
      renderWithProviders(<BooksList />);
    });
    
    // Select author filter
    const filterSelect = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'Author One' } });
    });
    
    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('Book One')).toBeInTheDocument();
      expect(screen.queryByText('Book Two')).not.toBeInTheDocument();
    });
  });
});