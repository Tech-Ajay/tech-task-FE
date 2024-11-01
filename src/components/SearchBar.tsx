import React, { useState, useEffect } from 'react';
import { getAllBookTitles, searchBooks } from '../api/api';
import { useDispatch } from 'react-redux';
import { setBooks } from '../features/bookReducer';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [allTitles, setAllTitles] = useState<string[]>([]);
    const dispatch = useDispatch();

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        
        if (value.length > 0) {
            const filtered = allTitles.filter(title => 
                title.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = async (searchQuery: string) => {
        try {
            const searchResults = await searchBooks(searchQuery);
            dispatch(setBooks(searchResults));
            onSearch(searchQuery);
            setSuggestions([]); // Clear suggestions after search
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    return (
        <div className="search-container">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search books..."
                className="search-input"
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            onClick={() => {
                                setQuery(suggestion);
                                handleSearch(suggestion);
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