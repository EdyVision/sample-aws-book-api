// Book API

// Imports
const handlerUtil = require('../libs/utils/handler-util');
const database = require('../db/db-manager');
const BookModel = require('../db/models/book-model');

module.exports.createBook = (entry) => {
    return new Promise((resolve) => {
        // Retrieve book details from request body
        let bookDetails = JSON.parse(entry.body);

        database
            .connectToDatabase()
            .then(async () => {
                // Place all the book details into the model to save it
                let newBook = new BookModel({
                    title: bookDetails.title,
                    subtitle: bookDetails.subtitle,
                    author_firstname: bookDetails.author_firstname,
                    author_lastname: bookDetails.author_firstname,
                    description: bookDetails.description,
                    isbn: bookDetails.isbn,
                    format: bookDetails.format,
                    price: bookDetails.price
                });

                await newBook
                    .save()
                    .then((savedBook) => {
                        let response = {
                            message: 'New book entry created!',
                            record_created: true,
                            id: savedBook._id
                        };

                        resolve(
                            handlerUtil.formatHandlerResponse(201, {
                                response: response
                            })
                        );
                    })
                    .catch((reason) => {
                        console.log(reason);
                        resolve(
                            handlerUtil.formatHandlerResponse(500, {
                                error:
                                    'Unable to save book. ' +
                                    JSON.stringify(reason)
                            })
                        );
                    });
            })
            .catch((error) => {
                console.log(error);
                resolve(
                    handlerUtil.formatHandlerResponse(500, { error: error })
                );
            });
    });
};

module.exports.getBook = (entry) => {
    return new Promise((resolve) => {
        // Retrieve book details from request body

        let bookSearchDetails;

        // Check the query string parameters to know what to delete
        // In this example, ID (from database) or the ISBN will be
        // required to delete the record
        if (entry.queryStringParameters.id) {
            bookSearchDetails = { _id: entry.queryStringParameters.id };
        } else if (entry.queryStringParameters.isbn) {
            bookSearchDetails = { isbn: entry.queryStringParameters.isbn };
        } else {
            resolve(
                handlerUtil.formatHandlerResponse(400, {
                    error: 'Unable to delete without ISBN or ID provided.'
                })
            );
        }

        database
            .connectToDatabase()
            .then(async () => {
                BookModel.findOne(bookSearchDetails).exec(function (err, book) {
                    if (err) {
                        resolve(
                            handlerUtil.formatHandlerResponse(400, {
                                error: 'There was an error finding the book.'
                            })
                        );
                    }
                    if (book) {
                        resolve(
                            handlerUtil.formatHandlerResponse(202, {
                                response: book
                            })
                        );
                    }
                });
            })
            .catch((error) => {
                console.log(error);
                resolve(
                    handlerUtil.formatHandlerResponse(500, { error: error })
                );
            });
    });
};

module.exports.updateBook = (entry) => {
    return new Promise((resolve) => {
        // Retrieve book details from request body
        let bookDetails = JSON.parse(entry.body);

        database
            .connectToDatabase()
            .then(async () => {
                // Create new Book Details entry
                let newBookDetails = {};
                if (bookDetails.title) newBookDetails.title = bookDetails.title;
                if (bookDetails.subtitle)
                    newBookDetails.subtitle = bookDetails.subtitle;
                if (bookDetails.author_firstname)
                    newBookDetails.author_firstname =
                        bookDetails.author_firstname;
                if (bookDetails.author_lastname)
                    newBookDetails.author_lastname =
                        bookDetails.author_lastname;
                if (bookDetails.description)
                    newBookDetails.description = bookDetails.description;
                if (bookDetails.format)
                    newBookDetails.format = bookDetails.format;
                if (bookDetails.price) newBookDetails.price = bookDetails.price;

                // Create the Update Query
                let updateQuery = { $set: newBookDetails };

                let bookQuery = { _id: bookDetails.id };

                // We pass in the upsert option
                let options = { upsert: true };

                BookModel.findOneAndUpdate(bookQuery, updateQuery, options)
                    .then((response) => {
                        if (response.isbn) {
                            resolve(
                                handlerUtil.formatHandlerResponse(202, {
                                    response: {
                                        message: 'Successfully updated book',
                                        results: {
                                            record_updated: true,
                                            id: response._id
                                        }
                                    }
                                })
                            );
                        } else {
                            resolve(
                                handlerUtil.formatHandlerResponse(200, {
                                    response: {
                                        message: 'Book record not modified',
                                        results: response
                                    }
                                })
                            );
                        }
                    })
                    .catch((error) => {
                        resolve(
                            handlerUtil.formatHandlerResponse(500, {
                                error:
                                    'Unable to update the book record. ' + error
                            })
                        );
                    });
            })
            .catch((error) => {
                resolve(
                    handlerUtil.formatHandlerResponse(500, {
                        error: 'Error connecting to database. ' + error
                    })
                );
            });
    });
};

module.exports.deleteBook = (entry) => {
    return new Promise((resolve) => {
        // Retrieve book details from request body

        let bookQuery;

        if (entry.queryStringParameters.id) {
            bookQuery = { _id: entry.queryStringParameters.id };
        } else {
            resolve(
                handlerUtil.formatHandlerResponse(404, {
                    error:
                        'Unable to delete the book record, id is required. ' +
                        error
                })
            );
        }

        database
            .connectToDatabase()
            .then(async () => {
                BookModel.findOneAndDelete(bookQuery)
                    .then((response) => {
                        resolve(
                            handlerUtil.formatHandlerResponse(202, {
                                response: {
                                    message: 'Successfully deleted book',
                                    results: {
                                        record_deleted: true,
                                        id: response._id
                                    }
                                }
                            })
                        );
                    })
                    .catch((error) => {
                        resolve(
                            handlerUtil.formatHandlerResponse(500, {
                                error:
                                    'Unable to delete the book record. ' + error
                            })
                        );
                    });
            })
            .catch((error) => {
                console.log(error);
                resolve(
                    handlerUtil.formatHandlerResponse(500, { error: error })
                );
            });
    });
};
