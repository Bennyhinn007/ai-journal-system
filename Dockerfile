FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend
COPY server ./server

# Copy frontend
COPY client ./client

# Create database directory
RUN mkdir -p .dist

# Expose ports
EXPOSE 5000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start both services
RUN npm install -g pm2
CMD ["pm2-runtime", "start", "server/server.js", "--name", "api"]
