FROM node:20-slim

WORKDIR /app

# Install dependencies first (including dev dependencies for TypeScript build)
COPY package*.json ./
RUN npm install --include=dev

# Then copy source and build
COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "dev"] 