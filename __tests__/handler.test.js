// Handler Test

// Imports
const handler = require('../handler');
const Book = require('../db/models/book-model');
const mockingoose = require('mockingoose').default;

// Expected Request and Response bodies
const createBookRequest = require('./sample-data/create-book-request.json');
const createBookResponse = require('./sample-data/create-book-response.json');
const updateBookRequest = require('./sample-data/update-book-request.json');
const updateBookResponse = require('./sample-data/update-book-response.json');
const deleteBookResponse = require('./sample-data/delete-book-response.json');

describe('Book API Tests', () => {
    beforeEach(() => {
        mockingoose.resetAll();
        jest.clearAllMocks();
    });

    it('should validate book record', async () => {
        const user = new Book(createBookRequest);

        await user.validate();
        expect(user.toObject()).toHaveProperty('title');
        expect(user.toObject()).toHaveProperty('_id');
    });

    it('should create book record', async () => {
        // Mock the db entries
        mockingoose(Book).toReturn([createBookRequest]);

        // Event to pass to endpoint
        let event = {
            body: JSON.stringify(createBookRequest)
        };

        await handler.createBook(event).then(async (response) => {
            // Assert
            expect(response.statusCode).toBe(201);
            expect(JSON.parse(response.body).response.message).toBe(
                createBookResponse.response.message
            );
            expect(JSON.parse(response.body).response).toHaveProperty('id');
        });
    });

    it('should update book record', async () => {
        // Mock the db entries
        mockingoose(Book).toReturn(updateBookRequest, 'findOneAndUpdate');

        // Seed the "pre-existing" book into the db for update operation
        let updatedBook = updateBookRequest;
        updatedBook = await Book.create(new Book(createBookRequest)).then(
            (book) => {
                updatedBook.id = book._id;
                return updatedBook;
            }
        );

        // Event to pass to endpoint
        let event = {
            body: JSON.stringify(updatedBook)
        };

        await handler.updateBook(event).then(async (response) => {
            // Assert
            expect(response.statusCode).toBe(202);
            expect(JSON.parse(response.body).response.message).toBe(
                updateBookResponse.response.message
            );
        });
    });

    it('should delete book record', async () => {
        // Mock the db entries
        mockingoose(Book).toReturn(createBookRequest, 'findOneAndDelete');

        // Seed the "pre-existing" book into the db for delete operation
        let savedBook = createBookRequest;
        savedBook = await Book.create(new Book(createBookRequest)).then(
            (book) => {
                savedBook.id = book._id;
                return savedBook;
            }
        );

        // Event to pass to endpoint
        let event = {
            queryStringParameters: { id: savedBook.id }
        };

        await handler.deleteBook(event).then(async (response) => {
            // Assert
            expect(response.statusCode).toBe(202);
            expect(JSON.parse(response.body).response.message).toBe(
                deleteBookResponse.response.message
            );
        });
    });
});
