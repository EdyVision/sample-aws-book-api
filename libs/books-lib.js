/*eslint-disable no-unused-vars*/

/**
 * Adds the book image to the db after base64 conversion
 *
 * @param {*} params bookID, bookImageBase64
 * @return {Promise} promise
 */
exports.addBookImage = (params) => {
    // - update new book to include image key
    return new Promise((resolve) => {
        BookModel.findOne({
            _id: params.bookID
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
                                    'Access-Control-Allow-Origin': '*'
                                },
                                body: JSON.stringify(err)
                            });
                        } else {
                            resolve({
                                statusCode: 202,
                                success: true,
                                headers: {
                                    'Access-Control-Allow-Origin': '*'
                                },
                                body: JSON.stringify({
                                    pharmacy: pharmacy,
                                    imageKey: imageKey
                                })
                            });
                        }
                    });
                } else {
                    resolve({
                        statusCode: 400,
                        success: false,
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: 'Pharmacy not found'
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
    return new Promise((resolve) => {
        let decodedImage = Buffer.from(base64Image, 'base64');
        let imageUri = 'images/books/' + imageName + '.jpg';
        let params = {
            Body: decodedImage,
            Bucket: process.env.S3_BOOK_IMAGE_BUCKET,
            Key: imageUri
        };

        return s3
            .putObject(params)
            .promise()
            .then(() => {
                // - result contains an ETAG that's pretty worthless.  send back the HOST + imageUrl as the key for the uploaded image.
                let parts = [process.env.S3_BOOK_IMAGE_BUCKET_URL, imageUri];
                let imageUrl = parts.join('/');
                resolve(imageUrl);
            })
            .catch(() => {
                resolve('');
            });
    });
}
