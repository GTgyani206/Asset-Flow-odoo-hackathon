# Domain Glossary

This document defines the precise domain terminology used throughout the AssetFlow platform. Consistency in these terms is required across all code, database schemas, API designs, and architectural documentation.

---

## Core System Boundaries

### Tenant / Organization
A **Tenant** (also referred to as an **Organization**) represents the primary boundary of multi-tenancy. It is a completely isolated data space containing its own departments, employees, locations, assets, and logs. Data must never cross tenant boundaries.

### User
A **User** is an identity and authentication concept. It represents a set of credentials (email, password hash) and metadata needed to authenticate. A User exists globally across the system and is decoupled from organizational logic.

### Membership
A **Membership** is the binding entity that links a global **User** to a specific **Tenant**. It defines the User's security access level (**Role**) within that Tenant. A User can have multiple Memberships if they are part of multiple Tenants (e.g. external auditors).

---

## Organizational Structure

### Employee
An **Employee** is a domain profile representing a person within a specific **Tenant**. It stores operational data such as department assignment, reporting manager, direct job properties, and contact info. 
> [!NOTE]  
> **User vs. Employee:** A User represents *who is logging in* (authentication/credentials). An Employee represents *who they are in the company* (department, allocations, manager).

### Department
A logistical grouping of Employees and Assets within a single Tenant. Departments serve as cost centers and can also act as custody holders for physical assets.

### Department Head
An Employee designated as the manager of a Department. They hold the authority to approve or deny asset transfers and resource bookings for their department members.

---

## Resources & Assets

### Asset
A tracked physical item that is individually serialized and managed through a strict state machine. Assets possess a unique identification code and undergo long-term custodial assignments.

### Asset Category
A logical classification for assets (e.g. Laptops, Vehicles, Office Chairs) that determines standard metadata schemas and depreciation properties.

### Asset Tag
A globally unique alphanumeric identifier printed on a physical barcode or RFID tag affixed directly to an Asset (formatted as `AF-[A-Z0-9]{6}`).

### Resource
A shareable physical or logical commodity (e.g., a conference room, a pool projector, or a vehicle) that can be reserved for short, discrete time slots.
> [!NOTE]  
> **Asset vs. Resource:** An Asset is individually tracked for long-term custody (Holder-based). A Resource is booked for short-term time slots (Interval-based). A Resource *may* optionally map to an underlying physical Asset (e.g., a specific "Toyota Prius" Asset underlies the "Pool Car 1" Resource).

---

## Custody & Reservation

### Allocation
The active custodial assignment of an Asset to a specific **Holder** (either an Employee or a Department). Only one active allocation can exist for an asset at any time.

### Holder
The designated target entity possessing physical custody of an Asset. A Holder must be either an **Employee** or a **Department**.

### Transfer
A controlled multi-step workflow designed to move custody of an Asset from one Holder to another without returning the asset to the central warehouse.

### Return
The process of releasing an Asset from a Holder back to the central registry, accompanied by a condition inspection.

### Booking
A time-bound reservation of a Resource by an Employee for a specific time range `[start, end)`.

### Blackout
A designated period of time during which a Resource is marked unavailable for Booking (used for maintenance, system locks, or organizational holidays).

---

## Operations & Compliance

### Maintenance Request
A workflow ticket initiating inspection or repair for an Asset or Resource. It forces state changes to prevent allocations/bookings during repair.

### Audit Cycle
A scheduled compliance process during which designated Auditors verify the location, custody, and physical condition of all Assets within a Tenant.

### Audit Item
A single verification record within an Audit Cycle corresponding to one specific Asset.

### Discrepancy
A mismatch discovered during an Audit Cycle between the recorded system state of an asset (e.g., location, condition) and its physical state.

---

## System Infrastructure

### Notification
A transactional system message (delivered via in-app alert or email) informing an Employee of state changes (e.g., transfer requests, overdue allocations).

### Activity Log
An append-only, immutable registry of security-critical and operational mutations within a Tenant.

### Outbox Event
A database record storing a domain event message within the same transaction as state changes. It guarantees reliable, asynchronous publishing to background queues.

### Idempotency Key
A unique client-supplied token (UUID) used to ensure that a mutating API request executes exactly once, preventing double execution on network retries.
