# Control Tower Operational Dashboard Blueprint

## 1. Introduction
The HO Copilot Control Tower dashboard is the central nervous system for mobility operations at Haivan. It provides real-time visibility and actionable insights for dispatchers, fleet managers, and leadership.

## 2. Dashboard Modules

### 2.1 Route Performance Monitor
- **Objective**: Track efficiency and punctuality of all active routes.
- **Key Metrics**:
  - On-Time Performance (OTP) %
  - Delay Variance (Actual vs. Scheduled)
  - Route Load Factor (Occupancy)
  - Traffic Impact Score
- **Information Hierarchy**:
  - High-level: System-wide OTP.
  - Mid-level: Route-specific performance cards.
  - Low-level: Individual stop/vehicle status within a route.
- **Data Sources**: GPS tracking, Scheduling engine, Traffic APIs (Google/Waze).

### 2.2 Fleet Status Monitor
- **Objective**: Monitor the health and availability of the vehicle fleet.
- **Key Metrics**:
  - Fleet Utilization %
  - Vehicles In-Service vs. Maintenance/Offline
  - Fuel/EV Charge Levels
  - Odometer & Service Warnings
- **Information Hierarchy**:
  - High-level: Total available fleet.
  - Mid-level: Fleet clusters by hub or vehicle type.
  - Low-level: Specific vehicle diagnostics.
- **Data Sources**: Telematics (OBD-II), Maintenance logs, Hub check-in system.

### 2.3 Driver Activity Monitor
- **Objective**: Ensure driver safety, compliance, and availability.
- **Key Metrics**:
  - Active vs. Idle Drivers
  - Driving Hours Compliance (Hours of Service)
  - Safety Score (Harsh braking, speeding)
  - Break/Rest status
- **Information Hierarchy**:
  - High-level: Active headcount.
  - Mid-level: Driver duty status list.
  - Low-level: Individual driver profile and current trip details.
- **Data Sources**: Driver App logs, Telematics, ELD (Electronic Logging Device).

### 2.4 Incident & Alert Board
- **Objective**: Real-time detection and management of operational anomalies.
- **Key Metrics**:
  - Open Incidents by Severity (Critical, High, Medium, Low)
  - Mean Time to Resolution (MTTR)
  - Alert volume trends
- **Information Hierarchy**:
  - Top: Critical alerts ticker.
  - Middle: Triage list of active incidents.
  - Bottom: Historical incident archive.
- **Data Sources**: Control Tower Anomaly Detection Agent, Manual dispatcher reports.

### 2.5 Demand Forecast Snapshot
- **Objective**: Anticipate upcoming volume to optimize resource allocation.
- **Key Metrics**:
  - Forecasted vs. Actual Bookings
  - Peak Demand Window prediction
  - Shortage/Surplus resource indicators
- **Information Hierarchy**:
  - High-level: 24-hour demand curve.
  - Mid-level: Regional/Hub demand heatmaps.
- **Data Sources**: Historical booking data, Current booking trends, External event calendars.

### 2.6 Airport Connection Tracker
- **Objective**: Specialized monitoring for high-value airport shuttle services.
- **Key Metrics**:
  - Flight Status (Delay/On-Time) for incoming/outgoing connections
  - Passenger Wait Times at Hubs
  - Connection Success Rate
- **Information Hierarchy**:
  - High-level: Connection health index.
  - Mid-level: Flight-to-Shuttle mapping.
- **Data Sources**: Flight data APIs (FlightAware), Passenger check-in system.

## 3. UI Layout Proposal (Control Room Screen)

### 3.1 Layout Grid
- **Top Bar**: System Health, Global Clock, Active Incidents Ticker.
- **Left Sidebar**: Module Switcher, Filters (Hub, Service Type).
- **Main View (Center)**:
  - **Upper Center**: Route Performance Map (Geospatial view).
  - **Lower Center**: Live Incident Board (Primary focus).
- **Right Sidebar**: Fleet & Driver Summaries (Actionable lists).
- **Bottom Bar**: Demand Trend Sparklines, KPI Rollups.

### 3.2 Visual Language
- **Color Coding**: 
  - Green: Optimal / On-time
  - Yellow: Warning / Minor Delay
  - Red: Critical / Action Required
- **Interactivity**: Drill-down from module cards to detailed tables/maps.

## 4. Data Requirements & Integration Strategy
- **Real-time Stream**: WebSockets for GPS and incident updates.
- **Data Warehouse**: Snowflake/BigQuery for historical performance analysis.
- **Integration Layer**: Unified API Gateway to aggregate telematics, scheduling, and flight data.
