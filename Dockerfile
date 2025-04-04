# Use Node.js for development
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose port 3000 for development
EXPOSE 3000

# Run the Next.js development server
CMD ["npm", "run", "dev"]
