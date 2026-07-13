# User Workflows

This document describes the key user workflows within the LoadAfrica platform.

---

## 1. Transport Booking Workflow

```mermaid
sequenceDiagram
  autonumber
  actor Customer
  actor Broker
  actor Driver
  
  Customer->>Customer: Fill in cargo & routing parameters
  Customer->>Broker: Submit booking request (Status: PENDING)
  Broker->>Broker: Review load request & estimate route
  Broker->>Customer: Submit Quote amount (Status: QUOTED)
  Customer->>Broker: Accept Quote & Pay (Status: ASSIGNED)
  Broker->>Driver: Assign Driver to load
  Driver->>Customer: Complete Delivery (Status: COMPLETED)
```

---

## 2. Yellow Plant Hire Workflow

```mermaid
sequenceDiagram
  autonumber
  actor Customer
  actor PlantOwner
  
  Customer->>Customer: Browse available machines (excavators, loaders)
  Customer->>PlantOwner: Submit hire request with dates & duration
  PlantOwner->>Customer: Accept/Reject request with pricing terms
  Customer->>PlantOwner: Make payment & confirm hire
  PlantOwner->>Customer: Deliver machine with operator to site
```

---

## 3. Core Workflow Status Lifecycles

### Transport Bookings
- **PENDING**: Customer created booking. Awaiting broker review.
- **QUOTED**: Broker calculated pricing and sent quote.
- **ASSIGNED**: Customer accepted quote. Awaiting driver/vehicle assignment.
- **IN_TRANSIT**: Driver dispatched. Real-time telemetry tracking active.
- **DELIVERED**: Cargo unloaded at destination.
- **COMPLETED**: Customer confirmed delivery. Commission credited to broker.
