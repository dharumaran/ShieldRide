# InSURE

### Real-Time Income Stabilization Engine for Instant Delivery Gig Workers

---

## Overview

InSURE is a **parametric, AI-driven income protection system** designed for **instant delivery gig workers** (Zepto, Blinkit, Instamart).

Unlike traditional insurance systems, InSURE operates using **real-time data signals** (weather, demand, platform stability) to **detect disruptions and automatically trigger payouts**.

It does not just compensate losses — it **predicts risk, guides worker decisions, and stabilizes earnings proactively**.

---

## Problem Statement

Gig workers in instant delivery platforms face:

* Highly volatile income
* No protection against:

  * sudden demand drops
  * platform outages
  * extreme weather
* No visibility into:

  * where demand exists
  * when earnings will drop

Traditional insurance systems are too slow, manual, and not suited for **real-time gig economies**.

---

## Solution

InSURE introduces a **parametric income protection model**:

* Uses external and platform data to detect disruption events
* Automatically triggers instant payouts
* Provides predictive movement insights
* Ensures a minimum income floor
* Adapts to worker behavior and risk exposure

---

## Core Features

### Income Floor Guarantee

Ensures workers do not fall below a minimum earning threshold.

```
Income Floor = ₹120/hour  
Actual Earnings = ₹70/hour  
Payout = ₹50
```

---

### Income Stability Score (ISS)

A dynamic score representing worker reliability and risk.

**Components**

* delivery consistency
* activity levels
* zone behavior
* risk exposure

**Use Cases**

* premium pricing
* reward eligibility
* risk profiling

---

### Predictive Move-to-Earn Insights

Recommends optimal zones based on:

* demand trends
* environmental risk
* store availability

Example:

> High risk of demand drop in Zone A. Move to Zone B (+35% demand, low risk).

---

### Dark Store Dependency Risk (SDR)

```
SDR = Orders from top stores / Total orders
```

If key stores go offline, compensation is automatically triggered.

---

### Fatigue-Aware Risk Adjustment

Accounts for:

* active hours
* continuous work duration
* break patterns

System adapts by triggering earlier payouts and reducing risk burden.

---

### Smart Auto-Pause Protection

Detects low-demand and high-risk conditions.

Suggestion:

> Go offline — partial compensation will be provided.

---

### Cluster-Based Fairness Model

Workers are grouped based on:

* vehicle type
* work style
* zone density

Ensures fair premium pricing and equitable payouts.

---

### Streak Protection Bonus

Rewards consistent workers with:

* higher income floor
* lower premiums
* priority payouts

---

### Income Smoothing Wallet

Balances earnings across time:

* stores surplus earnings
* compensates during low-income periods

---

### Zone Saturation Control

```
ZSI = Active Riders / Expected Demand
```

Prevents overcrowding caused by movement recommendations.

---

## System Architecture

### 1. Data Collection Layer

Sources:

* Weather APIs
* Traffic APIs
* Platform data (orders, uptime, store status)

---

### 2. Risk Feature Engineering

Derived indices:

* Demand Index (DI)
* Platform Stability Index (PSI)
* Store Availability Index
* Environmental Risk Index (ERI)

---

### 3. Risk Index Engine

```
DRI = w1(DVI) + w2(1 - PSI) + w3(ERI)
```

Produces a unified disruption risk score.

---

### 4. ML Risk Prediction

* Model: XGBoost / LightGBM

Output:

```
P(event) = probability of disruption
```

---

### 5. Premium Calculation

```
Expected Loss = P(event) × payout  
Premium = Expected Loss + margin
```

---

### 6. Real-Time Monitoring

* Event-driven architecture
* Sliding window analysis
* Continuous trigger evaluation

---

### 7. Parametric Trigger Engine

```
if ERI > threshold → weather trigger  
if PSI < threshold → platform outage  
if DVI > threshold → demand drop  
```

---

### 8. Fraud Detection

* Cross-verification of APIs
* Anomaly detection (Isolation Forest)
* Time consistency checks

---

### 9. Automated Payout System

```
Trigger detected  
→ validation  
→ fraud check  
→ instant payout (UPI/bank)
```

---

## Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* FastAPI / Node.js

### Data & Streaming

* REST APIs
* Apache Kafka (optional)

### Machine Learning

* Python
* Scikit-learn
* XGBoost

### Database

* PostgreSQL
* InfluxDB

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/your-repo/insure.git
cd insure
```

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### Environment Variables

Create a `.env` file:

```
WEATHER_API_KEY=your_key
MAPS_API_KEY=your_key
DATABASE_URL=your_db_url
```

---

## Execution Flow

1. APIs fetch real-time data
2. Backend computes risk indices
3. ML model predicts disruption probability
4. Trigger engine evaluates conditions
5. If triggered:

   * payout calculation
   * fraud validation
   * payment execution
6. Frontend displays insights, recommendations, and risk levels

---

## Future Scope

* Blockchain-based payout transparency
* Federated learning for privacy
* Satellite-based weather integration
* Cross-platform gig aggregation
* Real-time earnings heatmaps

---

## Positioning

InSURE is a **real-time income stabilization and decision intelligence system** for gig workers.

---

## License

MIT License
