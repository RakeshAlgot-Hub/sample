# FastAPI + MongoDB Backend

## Structure

- `app/main.py`: FastAPI entrypoint
- `app/models/`: Pydantic models
- `app/routes/`: API routes
- `app/services/`: Business logic
- `app/database/`: MongoDB connection
- `app/utils/`: Utility functions
- `app/config/`: Settings/configuration
- `app/tests/`: Test cases

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Environment

- Configure `.env` for MongoDB and debug settings.
