# Agriculture Crop Prediction & Planning Platform
## End-to-End Product & Technical Documentation

## 1. Product Vision

Build a web platform that helps farmers decide:
- Which crop to grow
- Expected future market price
- Estimated profit
- Oversupply risks
- Seasonal trends

The goal is to reduce farmer losses caused by:
- Oversupply
- Poor planning
- Lack of future price visibility
- Lack of market intelligence

---

# 2. MVP Scope (IMPORTANT)

Do NOT build everything initially.

## Start with:
- Maharashtra only
- 3 crops initially
  - Onion
  - Tomato
  - Wheat
- Historical mandi price visualization
- Trend-based crop recommendation
- Basic prediction logic

---

# 3. User Roles

## 3.1 Farmer
Features:
- Login/Register
- Select district/state
- View crop trends
- View future predictions
- Profit estimation
- Crop recommendations

## 3.2 Admin
Features:
- Manage crop data
- Trigger prediction jobs
- Manage mandi datasets
- Manage users

---

# 4. Technology Stack

## Frontend
- Angular 18+
- Angular Material
- RxJS
- Chart.js / ngx-charts
- Bootstrap or Tailwind

## Backend
- Python
- FastAPI (recommended)

Why FastAPI?
- Fast
- Modern
- Auto Swagger docs
- Async support
- Easy ML integration later

## Database
- PostgreSQL

## Data Processing
- Pandas
- NumPy

## Scheduled Jobs
- Celery OR APScheduler

## Hosting
Frontend:
- Vercel / Netlify

Backend:
- Render / Railway / AWS

Database:
- Neon PostgreSQL / Supabase

---

# 5. High-Level Architecture

```text
Angular Frontend
       ↓
FastAPI Backend
       ↓
Prediction Engine
       ↓
PostgreSQL Database
       ↓
Government Agriculture Datasets
```

---

# 6. Core Modules

## Module 1: Authentication

Features:
- Login
- Register
- JWT Authentication

Tech:
- FastAPI JWT
- Angular Route Guards

---

## Module 2: Crop Trend Dashboard

Features:
- Historical mandi prices
- Monthly average charts
- Yearly comparison
- District-wise filtering

UI Screens:
- Dashboard
- Crop detail page

---

## Module 3: Crop Recommendation Engine

Features:
- Select:
  - District
  - Season
  - Land size
- Recommendation:
  - Best crops
  - Expected prices
  - Expected profit

---

## Module 4: Prediction Engine

Phase 1:
- Rule-based prediction

Phase 2:
- Machine learning prediction

---

## Module 5: Profit Calculator

Inputs:
- Seeds cost
- Fertilizer cost
- Labour cost
- Irrigation cost

Outputs:
- Total cost
- Expected revenue
- Estimated profit

---

# 7. Data Sources

## 7.1 Historical Mandi Data

Source:
AGMARKNET

Data:
- Commodity name
- Mandi
- State
- District
- Min price
- Max price
- Modal price
- Arrival date

---

## 7.2 Weather Data

Source:
OpenWeather API

Data:
- Rainfall
- Temperature
- Humidity

---

## 7.3 Crop Production Data

Source:
data.gov.in

Data:
- Crop production
- State-wise cultivation

---

# 8. Database Design

## users

| Column | Type |
|---|---|
| id | UUID |
| name | VARCHAR |
| mobile | VARCHAR |
| password_hash | TEXT |
| district | VARCHAR |
| role | VARCHAR |
| created_at | TIMESTAMP |

---

## crops

| Column | Type |
|---|---|
| id | UUID |
| name | VARCHAR |
| season | VARCHAR |
| average_growth_days | INTEGER |

---

## mandi_prices

| Column | Type |
|---|---|
| id | UUID |
| crop_id | UUID |
| state | VARCHAR |
| district | VARCHAR |
| mandi_name | VARCHAR |
| arrival_date | DATE |
| min_price | NUMERIC |
| max_price | NUMERIC |
| modal_price | NUMERIC |

---

## predictions

| Column | Type |
|---|---|
| id | UUID |
| crop_id | UUID |
| district | VARCHAR |
| predicted_price | NUMERIC |
| confidence_score | NUMERIC |
| prediction_month | DATE |
| created_at | TIMESTAMP |

---

## expenses

| Column | Type |
|---|---|
| id | UUID |
| user_id | UUID |
| crop_id | UUID |
| seed_cost | NUMERIC |
| fertilizer_cost | NUMERIC |
| labour_cost | NUMERIC |
| irrigation_cost | NUMERIC |
| total_cost | NUMERIC |

---

# 9. Backend API Design

## Authentication APIs

### Register
POST /api/auth/register

### Login
POST /api/auth/login

---

## Crop APIs

### Get all crops
GET /api/crops

### Get crop details
GET /api/crops/{id}

---

## Mandi APIs

### Get historical prices
GET /api/mandi/prices?crop=onion&district=pune

### Get trends
GET /api/mandi/trends?crop=onion

---

## Prediction APIs

### Get prediction
GET /api/predictions?crop=onion&district=nagpur

Response:

```json
{
  "crop": "Onion",
  "predicted_price": 2100,
  "trend": "UP",
  "confidence": 78
}
```

---

# 10. Angular Frontend Structure

## Suggested Folder Structure

```text
src/app/
│
├── core/
├── shared/
├── auth/
├── dashboard/
├── crops/
├── mandi/
├── prediction/
├── admin/
└── services/
```

---

# 11. Angular Pages

## Public Pages
- Home
- Login
- Register

## Farmer Pages
- Dashboard
- Crop Trends
- Predictions
- Profit Calculator

## Admin Pages
- Upload Data
- Manage Predictions
- User Management

---

# 12. UI Design Recommendations

## Use:
- Large buttons
- Marathi/Hindi labels
- Simple charts
- Mobile-first design

Example:

```text
कांदा → पुढील ३ महिन्यांत भाव वाढण्याची शक्यता
```

---

# 13. Prediction Logic (Phase 1)

## Simple Rule-Based Logic

Example:

IF:
- Last 3 years same-season price trend is increasing
- Production is stable
- Rainfall is normal

THEN:
- Recommend crop
- Predict upward price trend

---

# 14. Python Prediction Engine Example

Pseudo Logic:

```python
if avg_price_last_3_years > threshold:
    trend = "UP"
else:
    trend = "DOWN"
```

---

# 15. Data Processing Pipeline

```text
Download CSV
    ↓
Clean Data
    ↓
Store in PostgreSQL
    ↓
Calculate Monthly Averages
    ↓
Generate Predictions
    ↓
Expose via APIs
```

---

# 16. Project Folder Structure (Backend)

```text
backend/
│
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── prediction/
│   └── database/
│
├── scripts/
├── requirements.txt
└── main.py
```

---

# 17. Python Packages

```text
fastapi
uvicorn
sqlalchemy
psycopg2-binary
pandas
numpy
python-jose
passlib
bcrypt
```

---

# 18. Development Roadmap

## Phase 1 (Weeks 1–2)
- Setup backend
- Setup Angular
- Setup PostgreSQL
- Create authentication

## Phase 2 (Weeks 3–4)
- Import mandi data
- Create charts
- Create trends API

## Phase 3 (Weeks 5–6)
- Build prediction logic
- Build recommendation engine

## Phase 4 (Weeks 7–8)
- Testing
- Deployment
- Pilot launch

---

# 19. Future Enhancements

## AI Features
- ML prediction models
- Demand forecasting
- Satellite data integration
- AI chatbot in Marathi

## Business Features
- Fertilizer marketplace
- Seed recommendation
- Crop insurance
- Loan recommendation

---

# 20. Monetization Strategy

## Free Plan
- Historical data
- Basic trends

## Premium Plan
- Future predictions
- Alerts
- Profit optimization

## Enterprise Plan
- Agri companies
- Traders
- Banks

---

# 21. Challenges You Must Prepare For

## Technical
- Data cleaning
- Missing values
- Inconsistent formats

## Business
- Farmer trust
- Prediction accuracy
- Regional language support

---

# 22. Recommended MVP Strategy

Do NOT launch nationally.

Start:
- Maharashtra
- 1 district
- 3 crops
- 50 farmers

Collect feedback.
Improve predictions.
Expand slowly.

---

# 23. Suggested Next Technical Steps

1. Setup Angular project
2. Setup FastAPI backend
3. Setup PostgreSQL
4. Create DB schema
5. Download AGMARKNET data
6. Build data import scripts
7. Build charts dashboard
8. Build prediction engine
9. Deploy MVP

---

# 24. Recommended Learning Areas

Frontend:
- Angular Charts
- RxJS
- Angular Material

Backend:
- FastAPI
- SQLAlchemy
- Pandas
- JWT Authentication

Data:
- Data cleaning
- CSV processing
- Time-series basics

---

# 25. Final Advice

Your biggest strength is NOT AI.

Your biggest strength should be:
- Simplicity
- Regional usability
- Useful insights
- Trustworthy recommendations

If farmers trust your platform, the product can become very valuable.

