# Online Interview Platform

## Quick Start (Run Both)

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Install dependencies in `frontend`:
   ```bash
   cd frontend && npm install && cd ..
   ```
3. Run both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

## Backend

1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```
2. Run the server:
   ```bash
   uv run uvicorn main:app --reload
   ```

## Frontend

1. Navigate to `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Integration Tests

1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```
2. Run the tests:
   ```bash
   uv run pytest
   ```

## Usage

1. Open the frontend URL in multiple browser tabs.
2. Type code in one tab, and it will appear in others.
3. Select language and run code (JavaScript execution supported in browser).

