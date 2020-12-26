// Imports
const BookModel = require('../db/models/book-model');

exports.insertBook = async (entry) => {
  await database
    .connectToDatabase()
    .then(() => {
        let newBook = new BookModel({
            title: entry.title,
            subtitle: entry.subtitle,
            author_firstname: entry.author_firstname,
            author_lastname: entry.author_firstname,
            description: entry.description,
            isbn: entry.isbn,
            format: entry.format,
            price: Number
        });

        console.log(JSON.stringify(newBook));
    })
    .catch((error) => {
      console.log(error);
    });

  resolve(handlerUtil.formatHandlerResponse(200, { response: "Hello!" }));
};
