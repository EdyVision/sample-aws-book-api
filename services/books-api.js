// Book API

// Imports
const handlerUtil = require("../libs/utils/handler-util");
const database = require("../db/db-manager");
const BookModel = require("../db/models/book-model");
const AWS = require("aws-sdk");

module.exports.createBook = (entry) => {
  return new Promise(async (resolve) => {
    // Retrieve book details from request body
    let bookDetails = JSON.parse(entry.body);

    await database
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
          price: bookDetails.price,
        });

        await newBook
          .save()
          .then((savedBook) => {
            let response = {
              message: "New book entry created!",
              record_created: true,
              id: savedBook._id,
            };

            resolve(
              handlerUtil.formatHandlerResponse(201, { response: response })
            );
          })
          .catch((reason) => {
            console.log(reason);
            resolve(
              handlerUtil.formatHandlerResponse(500, {
                error: "Unable to save book. " + JSON.stringify(reason),
              })
            );
          });
      })
      .catch((error) => {
        console.log(error);
        resolve(handlerUtil.formatHandlerResponse(500, { error: error }));
      });
  });
};

module.exports.getBook = (entry) => {
  return new Promise(async (resolve) => {
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
        handlerUtil.formatHandlerResponse(404, {
          error: "Unable to delete without ISBN or ID provided.",
        })
      );
    }

    await database
      .connectToDatabase()
      .then(async () => {
        BookModel.findOne(bookSearchDetails).exec(function (err, book) {
          if (err) {
            resolve(
              handlerUtil.formatHandlerResponse(400, {
                error: "There was an error finding the book.",
              })
            );
          }
          if (book) {
            resolve(handlerUtil.formatHandlerResponse(202, { response: book }));
          }
        });
      })
      .catch((error) => {
        console.log(error);
        resolve(handlerUtil.formatHandlerResponse(500, { error: error }));
      });
  });
};

module.exports.updateBook = (entry) => {
  return new Promise(async (resolve) => {
    // Retrieve book details from request body
    let bookDetails = JSON.parse(entry.body);

    await database
      .connectToDatabase()
      .then(async () => {
        // Create new Book Details entry
        let newBookDetails = {};
        if (bookDetails.title) newBookDetails.title = bookDetails.title;
        if (bookDetails.subtitle)
          newBookDetails.subtitle = bookDetails.subtitle;
        if (bookDetails.author_firstname)
          newBookDetails.author_firstname = bookDetails.author_firstname;
        if (bookDetails.author_lastname)
          newBookDetails.author_lastname = bookDetails.author_lastname;
        if (bookDetails.description)
          newBookDetails.description = bookDetails.description;
        if (bookDetails.format) newBookDetails.format = bookDetails.format;
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
                    message: "Successfully updated book",
                    results: {
                      record_updated: true,
                      id: response._id,
                    },
                  },
                })
              );
            } else {
              resolve(
                handlerUtil.formatHandlerResponse(200, {
                  response: {
                    message: "Book record not modified",
                    results: response,
                  },
                })
              );
            }
          })
          .catch((error) => {
            resolve(
              handlerUtil.formatHandlerResponse(500, {
                error: "Unable to update the book record. " + error,
              })
            );
          });
      })
      .catch((error) => {
        resolve(
          handlerUtil.formatHandlerResponse(500, {
            error: "Error connecting to database. " + error,
          })
        );
      });
  });
};

module.exports.deleteBook = (entry) => {
  return new Promise(async (resolve) => {
    // Retrieve book details from request body

    let bookQuery;

    if (entry.queryStringParameters.id) {
      bookQuery = { _id: entry.queryStringParameters.id };
    } else {
      resolve(
        handlerUtil.formatHandlerResponse(404, {
          error: "Unable to delete the book record, id is required. " + error,
        })
      );
    }

    await database
      .connectToDatabase()
      .then(async () => {
        BookModel.findOneAndDelete(bookQuery)
          .then((response) => {
            resolve(
              handlerUtil.formatHandlerResponse(202, {
                response: {
                  message: "Successfully deleted book",
                  results: {
                    record_deleted: true,
                    id: response._id,
                  },
                },
              })
            );
          })
          .catch((error) => {
            resolve(
              handlerUtil.formatHandlerResponse(500, {
                error: "Unable to delete the book record. " + error,
              })
            );
          });
      })
      .catch((error) => {
        console.log(error);
        resolve(handlerUtil.formatHandlerResponse(500, { error: error }));
      });
  });
};

/**
 * Adds the book image to the db after base64 conversion
 *
 * @param {*} params bookID, bookImageBase64
 * @return {Promise} promise
 */
exports.addBookImage = (params) => {
  // - update new book to include image key
  return new Promise(async (resolve) => {
    BookModel.findOne({
      _id: params.bookID,
    })
      .exec()
      .then(async (book) => {
        if (book) {
          let imageKey = await uploadPharmacyImage(
            params.bookImageBase64,
            book._id.toString()
          );
          book.imageKey = imageKey;

          book.save((err) => {
            if (err) {
              resolve({
                statusCode: 400,
                success: false,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(err),
              });
            } else {
              resolve({
                statusCode: 202,
                success: true,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                  pharmacy: pharmacy,
                  imageKey: imageKey,
                }),
              });
            }
          });
        } else {
          resolve({
            statusCode: 400,
            success: false,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
            body: "Pharmacy not found",
          });
        }
      });
  });
};

/**
 * Saves pharmacy image to S3
 *
 * @param {*} base64Image the base64Image for specilialist
 * @param {*} imageName the image name
 * @returns {Promise} promise
 */
async function uploadBookImage(base64Image, imageName) {
  return new Promise(async (resolve) => {
    let decodedImage = Buffer.from(base64Image, "base64");
    let imageUri = "images/books/" + imageName + ".jpg";
    let params = {
      Body: decodedImage,
      Bucket: process.env.S3_BOOK_IMAGE_BUCKET,
      Key: imageUri,
    };

    return s3
      .putObject(params)
      .promise()
      .then(() => {
        // - result contains an ETAG that's pretty worthless.  send back the HOST + imageUrl as the key for the uploaded image.
        let parts = [process.env.S3_BOOK_IMAGE_BUCKET_URL, imageUri];
        let imageUrl = parts.join("/");
        resolve(imageUrl);
      })
      .catch(() => {
        resolve("");
      });
  });
}
