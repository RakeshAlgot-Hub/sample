# 🏠 Hostel / Apartment Management API

This project is a **Hostel and Apartment Management Backend** built using **FastAPI** and **MongoDB**. It provides a robust API for managing properties, units (rooms/flats), guests, beds, and assignments, with a strong focus on data integrity, ownership enforcement, and flexible property type support.

---

## ✨ Features

The API supports comprehensive management across various entities:

### 🔐 Owner Authentication & Ownership Enforcement (Phase 1)
- User registration, login, and logout.
- All data (Properties, Units, Guests, Beds, Assignments) is linked to a specific owner.
- Strict ownership validation is enforced across all CRUD operations, preventing cross-owner access.

### 🏢 Property Type Support (Hostel / Apartment) (Phase 2)
- Supports two distinct property types: `HOSTEL` and `APARTMENT`.
- Property type is validated during creation and used to dictate unit creation rules.

### 🏗 Building & Floor Structure (MVP Level) (Phase 3)
- `buildingNumber` and `floorNumber` are integrated into the unit model.
- `floorNumber` is validated to be a non-negative integer.

### 🚪 Units (Rooms & Flats) (Phase 4)
- Differentiates between `ROOM` units (for Hostels) and `FLAT` units (for Apartments).
- **Hostel Rooms**:
    - `shareType` (e.g., 1, 2, 3, 4, 5+ sharing) and `sharePrice` are supported.
    - `totalBeds` calculated based on `numberOfRooms` and `shareType`.
- **Apartment Flats**:
    - `flatType` (e.g., 1BHK, 2BHK, 1ROOM, OTHER) and `listingType` (rent, sell, empty) are supported.
    - `rentPrice` and `sellPrice` are associated with appropriate `listingType`.

### 🛏 Bed Management (Hostel Only) (Phase 5)
- Automatic generation of beds when a `ROOM` type unit is created.
- Tracks `bedNumber` and `isOccupied` status for each bed.
- Prevents double booking: a guest cannot be assigned to more than one bed within the same owner's properties.

### 👥 Guest, Tenant & Family Assignment (Phase 6)
- **Hostel**: Guests can be assigned to individual beds, with checks for bed occupancy and guest double-booking.
- **Apartment**: Tenants can be assigned to flats.
    - Prevents assigning a tenant to an actively occupied flat.
    - Only `FLAT` type units can have tenant assignments via this service.
- Ownership of guests, units, and beds is validated during assignment.

### 🔐 Data Integrity & Safety Rules (Phase 7)
- Prevents the deletion of units if they are currently occupied:
    - `ROOM` units cannot be deleted if they have occupied beds.
    - `FLAT` units cannot be deleted if they have active assignments.
- Comprehensive validation errors provide clear feedback to the user.

### 🧹 Documentation & Cleanup (Phase 8)
- Cleaned project by removing all `__pycache__` directories and orphaned `.pyc` files.
- API documentation (Swagger UI/OpenAPI) is automatically generated and kept up-to-date with code changes.

---

## 🚀 Tech Stack

-   **FastAPI**: Modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
-   **MongoDB**: NoSQL document database used for data storage.
-   **Pydantic**: Data validation and settings management using Python type hints.
-   **PyJWT**: JSON Web Token implementation for Python for secure authentication.
-   **Bcrypt**: Hashing passwords for secure storage.
-   **Uvicorn**: ASGI server for running the FastAPI application.

---

## 🛠 Project Structure

The project follows a layered architectural pattern for clear separation of concerns:

```
core/       → DB connections, config, security, helpers, rate limiting
models/     → Pydantic models for database entities
schemas/    → Pydantic schemas for request and response validation
services/   → Business logic and data manipulation
routes/     → API endpoints and routing
utils/      → Utility functions (e.g., file upload)
```

---

## ⚙️ Setup and Run

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>/api
    ```
2.  **Create a virtual environment:**
    ```bash
    python -m venv .venv
    ```
3.  **Activate the virtual environment:**
    -   **Windows:** `.\.venv\Scripts\activate`
    -   **macOS/Linux:** `source ./.venv/bin/activate`
4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Set up environment variables:**
    Create a `.env` file in the `api/` directory with the following content (adjust values as needed):
    ```env
    # Mongo
    MONGO_URL=mongodb://localhost:27017
    MONGO_DATABASE=hostel_db
    MONGO_USERS_COLLECTION=users
    MONGO_PROPERTY_COLLECTION=properties
    MONGO_UNIT_COLLECTION=units
    MONGO_GUESTS_COLLECTION=guests
    MONGO_ASSIGNMENTS_COLLECTION=assignments

    # Security
    JWT_SECRET_KEY=your-super-secret-key-at-least-32-chars
    JWT_ALGORITHM=HS512
    ACCESS_TOKEN_TTL_MINUTES=15
    REFRESH_TOKEN_TTL_DAYS=90
    COOKIE_SECURE=True

    LOG_LEVEL=INFO
    ```
    *Make sure MongoDB is running on `mongodb://localhost:27017` or update the `MONGO_URL`.*

6.  **Run the application:**
    ```bash
    python main.py
    ```
    The API will be accessible at `http://0.0.0.0:8000` (or the port configured).
    Access the interactive API documentation at `http://0.0.0.0:8000/docs`.

---

This README provides an overview of the project's current state and how to set it up.