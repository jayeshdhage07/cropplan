# 🌾 CropPlan - Agriculture Crop Prediction & Planning Platform

A data-driven web platform that helps farmers make informed decisions about **crop selection**, **market prices**, and **profit estimation** — starting with Maharashtra, India.

## 🎯 Problem Statement

Indian farmers face significant losses due to:
- Oversupply of certain crops
- Poor planning without market intelligence
- Lack of future price visibility
- No access to historical trend data

**CropPlan** solves this by providing historical mandi price analysis, trend visualization, and AI-powered crop recommendations.

## 🏗️ Architecture

```
Angular Frontend (Port 4200)
        ↓
FastAPI Backend (Port 8000)
        ↓
Prediction Engine (Rule-based → ML)
        ↓
PostgreSQL Database (Port 5432)
        ↓
Government Agriculture Datasets (AGMARKNET)
```

## 📦 Project Structure

```
cropplan/
├── frontend/          → Angular 19 + Material UI + Chart.js
├── backend/           → FastAPI + SQLAlchemy + JWT Auth
├── docker-compose.yml → PostgreSQL + Backend + Frontend containers
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build

# Run migrations & seed data
docker exec crop_predict_backend alembic revision --autogenerate -m "initial"
docker exec crop_predict_backend alembic upgrade head
docker exec crop_predict_backend python scripts/seed_data.py
```

### Option 2: Manual Local Setup (Enterprise Version)

#### 1. Database (PostgreSQL)
Ensure you have PostgreSQL installed locally.
1. Open pgAdmin 4 or your terminal and create a database named `crop_predict_db`.
2. Update `backend/.env` so that your `DATABASE_URL` matches your local postgres credentials (e.g., `postgresql+pg8000://postgres:YOUR_PASSWORD@localhost:5432/crop_predict_db`).

#### 2. Backend API
Open a terminal in the `backend` folder:
```bash
cd backend
pip install -r requirements.txt

# Apply enterprise database migrations (Creates Audit Fields)
alembic upgrade head

# Start the FastAPI Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).*

#### 3. Frontend UI
Open a terminal in the `frontend` folder:
```bash
cd frontend
npm install

# Start the Angular Server
npm start
```
*The web platform will be available at [http://localhost:4200](http://localhost:4200).*

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

## 🔑 Default Credentials

| Role | Mobile | Password |
|------|--------|----------|
| Admin | 9999999999 | admin123 |

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, Angular Material, Chart.js, RxJS |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose + passlib) |
| Migrations | Alembic |
| Data Processing | Pandas, NumPy |
| DevOps | Docker, Docker Compose, Nginx |

## 📊 MVP Scope

- **Region**: Maharashtra only
- **Crops**: Onion, Tomato, Wheat
- **Features**:
  - ✅ User authentication (Farmer + Admin roles)
  - ✅ Historical mandi price visualization
  - ✅ Monthly/yearly trend charts
  - ✅ District-wise filtering
  - ✅ Rule-based price predictions
  - ✅ Crop recommendations
  - ✅ Profit calculator
  - ✅ CSV data import pipeline

## 🗺️ Roadmap

- **Phase 1** ✅ Backend + Frontend + Auth + DB setup
- **Phase 2** 🔄 Mandi data import + Charts + Trends API
- **Phase 3** 🔜 ML-based prediction engine
- **Phase 4** 🔜 Testing + Deployment + Pilot launch

## 📄 License

This project is for educational and development purposes.
