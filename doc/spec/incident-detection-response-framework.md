# Incident Detection & Response Framework

## 1. Incident Taxonomy

Incidents are categorized by their operational domain:

- **Service Reliability**: Delayed departures, missed stops, route deviations, punctuality issues.
- **Fleet & Assets**: Vehicle breakdown, telematics failure, fuel/charge exhaustion.
- **Human Resources**: Driver absence, driver fatigue, safety violations.
- **Supply & Demand**: Unexpected demand spikes, route occupancy collapse, hub congestion.
- **External Factors**: Severe weather, road closures, flight delays (airport connections).

## 2. Detection Signals

The system monitors the following data streams for anomalies:

| Incident Type | Detection Signal(s) |
|---------------|---------------------|
| **Delayed Departure** | Vehicle GPS position != Hub location at `ScheduledDepartureTime + 5 mins` |
| **Missed Connection** | Passenger check-in at Hub != Vehicle arrival for airport shuttle |
| **Driver Absence** | No "Shift Start" event logged in Driver App at `ShiftStartTime + 10 mins` |
| **Vehicle Breakdown** | OBD-II "Diagnostic Trouble Code" (DTC) detected + Vehicle speed = 0 |
| **Demand Spike** | Unfulfilled booking requests > 20% of capacity in a specific region/hub |
| **Route Collapse** | Multiple vehicles on the same route reporting > 15 min delay |

## 3. Alert Severity Levels

| Severity | Color | Definition | Action Requirement |
|----------|-------|------------|---------------------|
| **Critical** | Red | Immediate threat to service safety or major shutdown. | 2-minute response. Automatic escalation to Operations Chief. |
| **High** | Orange | Significant service disruption (e.g., missed airport shuttle). | 10-minute response. Triage by Senior Dispatcher. |
| **Medium** | Yellow | Minor delay or manageable resource shortage. | 30-minute response. Triage by Dispatcher. |
| **Low** | Blue | Information only or minor variance. | Review during shift wrap-up. |

## 4. Response Playbooks (Examples)

### 4.1 Delayed Departure Playbook
1. **Identify**: Detect delay via GPS/Schedule variance.
2. **Verify**: Automated nudge to Driver App asking for status.
3. **Action**:
   - If "Minor Traffic": Update passenger ETA in-app.
   - If "Vehicle Issue": Dispatch replacement vehicle from nearest hub.
4. **Communicate**: Alert impacted passengers via SMS/Push.

### 4.2 Driver Absence Playbook
1. **Identify**: Missed shift start event.
2. **Verify**: Call/Nudge driver.
3. **Action**: 
   - Assign standby driver from "Available" pool.
   - If no standby available, cancel/re-route lowest priority trips.
4. **Resolve**: Update schedule and notify affected routes.

## 5. Escalation Workflow

1. **Detection**: Anomaly Detection Agent identifies a signal.
2. **Alert**: Control Tower Agent creates an Incident in the dashboard.
3. **Triage**: Dispatcher Copilot suggests a playbook to the human dispatcher.
4. **Resolution**: Action taken (manual or automated).
5. **Escalation**: 
   - If Severity = Critical: Notify Operations Chief immediately.
   - If MTTR > Threshold: Escalate to Supervisor.
   - If System-wide impact: CEO notification.

## 6. Framework Execution
This framework is executed by the **Control Tower Agent** and **Anomaly Detection Agent**, coordinated via the Paperclip control plane.
