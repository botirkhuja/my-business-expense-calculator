FROM node:22-alpine

# Create and set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --no-cache

# Copy the rest of the application
COPY . .

RUN yarn build

# Expose the Next.js dev port
EXPOSE 3000

# Start the development server
CMD ["yarn", "start"]
