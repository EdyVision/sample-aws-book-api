# Sample AWS Books API
![Test and Deploy to Staging](https://github.com/EdyVision/sample-aws-book-api/workflows/Test%20and%20Deploy%20to%20Staging/badge.svg)


A simple API that performs Create, Read, Update, and Delete against a table in MongoDB. Includes linting, GitHub Actions workflow, project structuring, and tests. This repository was created as part of an extended example for the book <em>Building Node.js serverless apps on AWS: A Brief Guide on Where to Start</em>. This project does not contain any auth setup like the <em>Serverless AWS Starter Project</em>. 


## Setup
Have serverless installed locally and on your CI/CD pipeline:

```
npm install -g serverless
```

Make sure that you have your AWS Key and Secret in your env vars or bash profile:

```
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```


## Deployment
To deploy to AWS locally, make sure you have your AWS key and secret in your bash profile and execute the following:

```
sls deploy -v --stage <dev, test, staging, production, etc>
```

## Usage

To execute locally, run the following command (<strong>npm install serverless -g</strong> is required):

```
sls offline
```

or

```
npm start
```

If running locally, the beginning of your url will be http://localhost:3000

A sample Postman collection has been provided in the <strong>misc</strong> folder.
