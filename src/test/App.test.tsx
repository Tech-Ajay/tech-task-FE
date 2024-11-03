// Import necessary testing and component dependencies
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import store from '../store';
import App from '../App';

// Helper function to render components with Redux Provider and routing context
const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  // Set the URL for the test
  window.history.pushState({}, 'Test page', route);
  
  // Render component with Redux store
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('App Component', () => {
  // Test 1: Verify basic app rendering
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    // Check if main heading is present
    expect(screen.getByRole('heading', { name: /Book Collection/i })).toBeInTheDocument();
  });

  // Test 2: Verify default route shows BooksList
  it('renders BooksList by default', () => {
    renderWithProviders(<App />);
    // Check for BooksList component elements
    expect(screen.getByRole('heading', { name: /Book Collection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Book/i })).toBeInTheDocument();
  });

  // Test 3: Verify 404 page for invalid routes
  it('renders NotFound for invalid routes', () => {
    // Render app with invalid route
    renderWithProviders(<App />, { route: '/invalid-route' });
    // Check for NotFound component elements
    expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });
});
