import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Enum for available sort fields
export enum SortField {
    TITLE = 'TITLE',
    AUTHOR = 'AUTHOR',
    PUBLISHED_DATE = 'PUBLISHED_DATE'
}

// Enum for sort directions
export enum SortOrder {
    ASC = 'ASC',    // Ascending order
    DESC = 'DESC'   // Descending order
}

// Interface defining the shape of a Book object
export interface Book {
    id: number;
    title: string;
    author: string;
    publishedDate: string;
    description?: string;   // Optional field
    imageUrl?: string;      // Optional field
}

// Interface for the books slice of Redux state
interface BookState {
    books: Book[];
}

// Initial state for the books reducer
const initialState: BookState = {
    books: [],
};

// Create the Redux slice for books
const bookReducer = createSlice({
    name: 'books',
    initialState,
    reducers: {
        // Replace entire books array
        setBooks(state, action: PayloadAction<Book[]>) {
            state.books = action.payload;
        },
        // Add a single book to the array
        addBook(state, action: PayloadAction<Book>) {
            state.books.push(action.payload);
        },
        // Remove a book by its ID
        deleteBook(state, action: PayloadAction<number>) {
            state.books = state.books.filter(book => book.id !== action.payload);
        },
    },
});

// Export action creators
export const {setBooks, addBook, deleteBook} = bookReducer.actions;

// Export the reducer
export default bookReducer.reducer;
