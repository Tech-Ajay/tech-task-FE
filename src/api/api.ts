import { Book, SortField, SortOrder } from '../features/bookReducer';

const GRAPHQL_URL = 'http://localhost:8080/graphql';

export const fetchBooks = async (): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query { 
                    findAllBooks { 
                        id 
                        title 
                        author 
                        publishedDate 
                    } 
                }`
            }),
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result.data.findAllBooks;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
};

export const findBookById = async (id: number): Promise<Book | null> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query($id: Int) { 
                    findBookById(id: $id) { 
                        id 
                        title 
                        author 
                        publishedDate 
                    } 
                }`,
                variables: { id }
            }),
        });

        const result = await response.json();
        return result.data.findBookById;
    } catch (error) {
        console.error('Error fetching book:', error);
        return null;
    }
};

export const findBooksByDateRange = async (startDate: string, endDate: string): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query($startDate: String!, $endDate: String!) { 
                    findBooksByDateRange(startDate: $startDate, endDate: $endDate) { 
                        id 
                        title 
                        author 
                        publishedDate 
                    } 
                }`,
                variables: { startDate, endDate }
            }),
        });

        const result = await response.json();
        return result.data.findBooksByDateRange;
    } catch (error) {
        console.error('Error fetching books by date range:', error);
        return [];
    }
};

export const searchBooks = async (title: string): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query($title: String!) { 
                    findBooksByTitleContaining(title: $title) { 
                        id 
                        title 
                        author 
                        publishedDate 
                    } 
                }`,
                variables: { title }
            }),
        });

        const result = await response.json();
        return result.data.findBooksByTitleContaining;
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
};

export const getAllBooksSortedByTitle = async (ascending: boolean): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query($ascending: Boolean!) { 
                    findAllBooksSortedByTitle(ascending: $ascending) { 
                        id 
                        title 
                        author 
                        publishedDate 
                    } 
                }`,
                variables: { ascending }
            }),
        });

        const result = await response.json();
        return result.data.findAllBooksSortedByTitle;
    } catch (error) {
        console.error('Error fetching sorted books:', error);
        return [];
    }
};

export const getAllBooksSortedByDate = async (ascending: boolean): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query($ascending: Boolean!) { 
                    findAllBooksSortedByDate(ascending: $ascending) { 
                        id 
                        title 
                        author 
                        publishedDate 
                        description
                        imageUrl
                    } 
                }`,
                variables: { ascending }
            }),
        });

        const result = await response.json();
        return result.data.findAllBooksSortedByDate;
    } catch (error) {
        console.error('Error fetching date-sorted books:', error);
        return [];
    }
};

export const getAllBookTitles = async (): Promise<string[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query { getAllBookTitles }`
            }),
        });

        const result = await response.json();
        return result.data.getAllBookTitles;
    } catch (error) {
        console.error('Error fetching book titles:', error);
        return [];
    }
};

export const createBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation($title: String!, $author: String!, $publishedDate: String!, $description: String, $imageUrl: String) {
                    createBook(
                        title: $title,
                        author: $author,
                        publishedDate: $publishedDate,
                        description: $description,
                        imageUrl: $imageUrl
                    ) {
                        id
                        title
                        author
                        publishedDate
                        description
                        imageUrl
                    }
                }`,
                variables: {
                    title: book.title,
                    author: book.author,
                    publishedDate: book.publishedDate,
                    description: book.description,
                    imageUrl: book.imageUrl
                }
            }),
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result.data.createBook;
    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    }
};

export const deleteBook = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `mutation($id: Int!) { 
                    deleteBook(id: $id) 
                }`,
                variables: { id }
            }),
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result.data.deleteBook;
    } catch (error) {
        console.error('Error deleting book:', error);
        return false;
    }
};

export const findAllBooksSorted = async (sortField: SortField, sortOrder: SortOrder): Promise<Book[]> => {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                query($sortField: SortField!, $sortOrder: SortOrder!) {
                    findAllBooksSorted(sortField: $sortField, sortOrder: $sortOrder) {
                        id
                        title
                        author
                        publishedDate
                        description
                        imageUrl
                    }
                }`,
                variables: { sortField, sortOrder }
            }),
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result.data.findAllBooksSorted;
    } catch (error) {
        console.error('Error fetching sorted books:', error);
        return [];
    }
};
