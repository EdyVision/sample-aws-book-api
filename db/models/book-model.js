const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model definition for a book
let book = {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    title: String,
    subtitle: String,
    author: {
        firstName: String,
        middleName: String,
        lastName: String
    },
    description: String,
    isbn: String,
    format: String,
    price: Number
};

const bookSchema = new Schema(book);

// Reference for already declared model issue resolution
// https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('Books'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}
module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('Books')
        : mongoose.model('Books', bookSchema);
