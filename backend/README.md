# Agriculture Crop Prediction Platform - Backend

## Overview

FastAPI-based REST API backend for the Agriculture Crop Prediction Platform.
Provides endpoints for authentication, crop management, mandi price data,
and price prediction/recommendation.

## Tech Stack

- **Framework**: FastAPI 0.115+
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose + passlib)
- **Data Processing**: Pandas, NumPy
- **Validation**: Pydantic v2

## Project Structure

```
backend/
├── app/
│   ├── api/              # FastAPI route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── crops.py      # Crop CRUD endpoints
│   │   ├── mandi.py      # Mandi price endpoints
│   │   └── predictions.py # Prediction endpoints
│   ├── core/             # Core configuration
│   │   ├── config.py     # Environment settings
│   │   ├── security.py   # JWT & password utilities
│   │   ├── logging.py    # Logging configuration
│   │   └── exceptions.py # Global exception handlers
│   ├── database/         # Database layer
│   │   ├── base.py       # SQLAlchemy base
│   │   └── session.py    # Session management
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── crop.py
│   │   ├── mandi_price.py
│   │   ├── prediction.py
│   │   └── expense.py
│   ├── prediction/       # Prediction engine
│   │   └── engine.py     # Rule-based engine (extensible for ML)
│   ├── schemas/          # Pydantic schemas
│   │   ├── auth.py
│   │   ├── crop.py
│   │   ├── mandi.py
│   │   └── prediction.py
│   └── services/         # Business logic layer
│       ├── auth_service.py
│       ├── crop_service.py
│       ├── mandi_service.py
│       └── prediction_service.py
├── alembic/              # Database migrations
├── data/                 # Data files
│   ├── csv_imports/      # CSV import files
│   └── prediction_engine/ # ML model files (future)
├── scripts/              # Utility scripts
│   ├── import_csv.py     # CSV data importer
│   ├── data_cleaning.py  # Data cleaning utilities
│   └── seed_data.py      # Database seeding
├── main.py               # Application entry point
├── alembic.ini           # Alembic configuration
├── requirements.txt      # Python dependencies
├── Dockerfile
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- pip or pipenv

### 1. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Create Database

```sql
-- In PostgreSQL
CREATE USER crop_user WITH PASSWORD 'crop_password';
CREATE DATABASE crop_predict_db OWNER crop_user;
GRANT ALL PRIVILEGES ON DATABASE crop_predict_db TO crop_user;
```

### 5. Run Migrations

```bash
# Generate initial migration
alembic revision --autogenerate -m "initial_tables"

# Apply migrations
alembic upgrade head
```

### 6. Seed Database

```bash
python scripts/seed_data.py
```

### 7. Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 8. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login & get token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/crops` | List all crops | No |
| GET | `/api/crops/{id}` | Get crop details | No |
| POST | `/api/crops` | Create crop (admin) | Admin |
| GET | `/api/mandi/prices` | Get historical prices | No |
| GET | `/api/mandi/trends` | Get price trends | No |
| GET | `/api/mandi/districts` | Get districts list | No |
| GET | `/api/predictions` | Get price prediction | No |
| GET | `/api/predictions/recommendations` | Get crop recommendations | Yes |
| POST | `/api/predictions/profit` | Calculate profit | Yes |

## Default Admin Credentials

After seeding:
- **Mobile**: 9999999999
- **Password**: admin123

## Data Import

```bash
# Import from CSV
python scripts/import_csv.py --file data/csv_imports/sample_mandi_data.csv
```
