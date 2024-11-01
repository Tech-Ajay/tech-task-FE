import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import BooksList from '../../components/BooksList';
import booksReducer from '../../features/bookReducer';

describe('BooksList', () => {
    let store: ReturnType<typeof configureStore>;
    let initialState: RootState;

    beforeEach(() => {
        initialState = {
            books: {
                books: [
                    {
                        id: 1,
                        title: 'Book One',
                        author: 'Author One',
                        publishedDate: '2021-01-01'
                    },
                    {
                        id: 2,
                        title: 'Book Two',
                        author: 'Author Two',
                        publishedDate: '2022-02-02'
                    },
                ],
            },
        };
        store = configureStore({
            reducer: {
                books: booksReducer,
            },
            preloadedState: initialState,
        });
    });

    it('should render a list of books', () => {
        const { getByText } = render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        expect(getByText('Book One')).toBeInTheDocument();
        expect(getByText('Author: Author One')).toBeInTheDocument();
        expect(getByText('Book Two')).toBeInTheDocument();
        expect(getByText('Author: Author Two')).toBeInTheDocument();
    });
});