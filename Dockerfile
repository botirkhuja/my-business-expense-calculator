FROM node:22-alpine

# Create and set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json yarn.lock ./
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose the Next.js dev port
EXPOSE 3000

# Start the development server
CMD ["yarn", "dev"]
