// Handler
'use strict';

// Imports
const booksApi = require('./services/books-api');

// Books API
module.exports.createBook = async (event) => {
    return booksApi.createBook(event);
};

module.exports.getBook = async (event) => {
    return booksApi.getBook(event);
};

module.exports.updateBook = async (event) => {
    return booksApi.updateBook(event);
};

module.exports.deleteBook = async (event) => {
    return booksApi.deleteBook(event);
};
