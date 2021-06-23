FROM node

RUN npm install -g serverless
RUN npm install -g serverless-offline

ARG db_url="mongodb://mongo:27017"
ARG db_name="booksapi"
ARG project_dir=/usr/src/app

# Set Environment Variables
ENV PORT 8000
ENV DB_URL=$db_url
ENV DB_NAME=$db_name

EXPOSE $PORT

WORKDIR $project_dir

# Copy Required Project Assets
COPY ./libs/ $project_dir/libs/
COPY ./services/ $project_dir/services/
COPY ./db $project_dir/db/
COPY ./handler.js $project_dir/
COPY ./package.json $project_dir/
COPY ./serverless.yml $project_dir/

# WORKDIR $project_dir

# Install Dependencies
RUN npm install

# Entry Point
CMD ["sls", "offline"]