// Handler Test
// Covers "Happy Path" for all endpoints

// Imports
const handler = require('../handler');

test('Book is successfully created with "addBook" endpoint', () => {
    return handler.addBook().then((result) => {
        // Assert
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).response).toBe('AddYourAssertions');
    });
});

test('Book is successfully created with "getBook" endpoint', () => {
    return handler.getBook().then((result) => {
        // Assert
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).response).toBe('AddYourAssertions');
    });
});

test('Book is successfully created with "updateBook" endpoint', () => {
    return handler.updateBook().then((result) => {
        // Assert
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).response).toBe('AddYourAssertions');
    });
});

test('Book is successfully created with "deleteBook" endpoint', () => {
    return handler.deleteBook().then((result) => {
        // Assert
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).response).toBe('AddYourAssertions');
    });
});
