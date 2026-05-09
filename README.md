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

### Option 2: Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env
alembic revision --autogenerate -m "initial_tables"
alembic upgrade head
python scripts/seed_data.py
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

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
