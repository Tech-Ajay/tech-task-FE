import React, { useState, useEffect } from 'react';
import { getAllBookTitles, searchBooks } from '../api/api';
import { useDispatch } from 'react-redux';
import { setBooks } from '../features/bookReducer';

// Props interface for SearchBar component
interface SearchBarProps {
    onSearch: (query: string) => void;  // Callback function to handle search events
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    // State management
    const [query, setQuery] = useState('');                    // Current search query
    const [suggestions, setSuggestions] = useState<string[]>([]);  // Search suggestions
    const [allTitles, setAllTitles] = useState<string[]>([]);     // Cache of all book titles
    const dispatch = useDispatch();  // Redux dispatch for updating global state

    // Load all book titles on component mount for suggestions
    useEffect(() => {
        const loadTitles = async () => {
            try {
                const titles = await getAllBookTitles();
                setAllTitles(titles || []);
            } catch (error) {
                console.error('Error loading book titles:', error);
                setAllTitles([]);
            }
        };
        loadTitles();
    }, []);

    // Handle changes to search input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        
        // Filter suggestions based on input value
        if (value.length > 0) {
            const filtered = allTitles.filter(title => 
                title.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]); // Clear suggestions if input is empty
        }
    };

    // Execute search and update global state
    const handleSearch = async (searchQuery: string) => {
        try {
            const searchResults = await searchBooks(searchQuery);
            dispatch(setBooks(searchResults));  // Update Redux store with search results
            onSearch(searchQuery);             // Notify parent component
            setSuggestions([]);                // Clear suggestions after search
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    return (
        <div className="search-container">
            {/* Search input field */}
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search books..."
                className="search-input"
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            onClick={() => {
                                setQuery(suggestion);    // Update input with selected suggestion
                                handleSearch(suggestion); // Execute search with suggestion
                            }}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar; 