FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Bundle app source
COPY . .

# Install npm packages
RUN npm install

# Build app source
RUN npm run build

# Start app
CMD npm run start:prod