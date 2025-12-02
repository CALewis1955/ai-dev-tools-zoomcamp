# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the backend and serve
FROM python:3.12-slim

WORKDIR /app

# Copy backend code
COPY backend/ .

# Install backend dependencies
# Using pip to install the current directory which contains pyproject.toml
RUN pip install --no-cache-dir .

# Copy frontend build artifacts from the builder stage
# We'll put them in a 'static' directory
COPY --from=frontend-builder /app/frontend/dist /app/static

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
