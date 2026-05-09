# Agriculture Crop Prediction Platform - Frontend

## Overview

Angular-based frontend for the Agriculture Crop Prediction Platform. Provides an intuitive interface for farmers to view crop trends, get price predictions, and make data-driven farming decisions.

## Tech Stack

- **Framework**: Angular 19 (Standalone Components)
- **UI Library**: Angular Material
- **Charts**: Chart.js
- **State Management**: Angular Signals
- **HTTP**: RxJS + HttpClient
- **Styling**: SCSS with CSS Custom Properties

## Project Structure

```
src/app/
├── core/                  # Core services, guards, interceptors
│   ├── services/
│   │   ├── api.service.ts         # Base HTTP service
│   │   ├── auth.service.ts        # Authentication
│   │   ├── crop.service.ts        # Crop data
│   │   ├── mandi.service.ts       # Mandi prices
│   │   └── prediction.service.ts  # Predictions
│   ├── guards/
│   │   └── auth.guard.ts          # Route protection
│   └── interceptors/
│       └── auth.interceptor.ts    # JWT token injection
├── shared/                # Shared components
│   ├── layout/
│   │   └── layout.component.ts    # Main layout with sidebar
│   └── components/
│       └── chart/
│           └── chart.component.ts # Reusable Chart.js wrapper
├── auth/                  # Authentication module
│   ├── login/
│   └── register/
├── dashboard/             # Dashboard module
├── crops/                 # Crop trends module
│   ├── crop-list/
│   └── crop-detail/
├── prediction/            # Prediction module
├── app.component.ts       # Root component
├── app.config.ts          # App configuration
└── app.routes.ts          # Root routing
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```
Open http://localhost:4200

### 3. Build for Production
```bash
npm run build
```

## Features

- **Authentication**: Login/Register with JWT
- **Dashboard**: Stats overview, price trend charts
- **Crop Trends**: Historical mandi price visualization
- **Predictions**: AI-powered price predictions and recommendations
- **Responsive**: Mobile-first design with Material UI
- **Dark Sidebar**: Premium navigation experience
