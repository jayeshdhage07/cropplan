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

### Development Environment (New Node Runner Orchestrator)

The easiest way to run the full stack locally is to use the included Node orchestrator script which automatically handles port conflict resolution and boots both the FastAPI backend and Angular frontend concurrently.

```bash
# From the root directory (cropplan/)
npm install
node runner.js
```
*Note: The frontend port may dynamically change if 4200 is occupied, check the terminal output for the active local URL.*

### Option 1: Docker (Production)

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
| Frontend | Angular 19 (Standalone), Angular Material, Chart.js, ngx-translate (i18n) |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose + passlib) |
| Migrations | Alembic |
| Data Processing | Pandas, NumPy |
| DevOps | Docker, Docker Compose, Nginx |

## 📊 MVP Scope

- **Region**: Maharashtra only
- **Crops**: Onion, Tomato, Wheat, Rice, Sugarcane, Cotton, Soyabean, Maize, Gram
- **Features**:
  - ✅ Enterprise-grade Internationalization (i18n) supporting English, Hindi, and Marathi.
  - ✅ Premium Glassmorphic UI/UX tailored for agricultural accessibility.
  - ✅ User authentication (Farmer + Admin roles)
  - ✅ Live Mandi rates with minimum, maximum, and modal price tables.
  - ✅ Historical mandi price visualization & trend charts
  - ✅ District-wise filtering and agricultural advisories
  - ✅ Rule-based price predictions & crop recommendations
  - ✅ Profit calculator tailored for seed, fertilizer, and irrigation costs.
  - ✅ CSV data import pipeline

## 🗺️ Roadmap

- **Phase 1** ✅ Backend + Frontend + Auth + DB setup
- **Phase 2** 🔄 Mandi data import + Charts + Trends API
- **Phase 3** 🔜 ML-based prediction engine
- **Phase 4** 🔜 Testing + Deployment + Pilot launch

## 📄 License

This project is for educational and development purposes.
