# 🏠 Hostel / Apartment Management API (MVP – Simplified)

This project is a **FastAPI + MongoDB backend** for managing **hostels and apartments**.

The goal is to **reduce the current over-engineered codebase** into a **clean, minimal MVP** with **only 4 core collections** and a **simple user experience**.

---

## 🔐 ABSOLUTE RULES (READ CAREFULLY)

These rules are **non-negotiable**:

1. ❌ DO NOT run `git commit` or `git push`
2. ❌ DO NOT keep unused features
3. ❌ DO NOT create building, floor, bed, or assignment entities
4. ✅ DELETE unnecessary files when instructed
5. ✅ Follow phases strictly (1 → 4)
6. ✅ After every phase:

   * List files deleted
   * List files modified
   * Explain what exists and what is missing
7. ⛔ WAIT for explicit permission before any commit

---

## 🎯 FINAL MVP SCOPE (LOCKED)

### Collections (ONLY THESE 4)

```
users      → owners
properties → hostel / apartment
units      → room / flat
persons    → guest / tenant / family
```

❌ No buildings
❌ No floors
❌ No beds
❌ No assignments

---

## 🧱 REQUIRED ARCHITECTURE (KEEP THIS)

```
core/
models/
schemas/
services/
routes/
```

Do **not** change this structure.

---

# 📌 PHASED EXECUTION PLAN (4 PHASES ONLY)

---

## ✅ PHASE 1 — READ & UNDERSTAND EXISTING CODE (NO CHANGES)

### Goal

Fully understand the current system **without touching code**.

### Tasks

* Read all existing folders:

  * core/
  * models/
  * schemas/
  * services/
  * routes/
* Identify:

  * What each file does
  * Which features exist
  * Which files are related to:

    * buildings
    * floors
    * beds
    * assignments
* Map current collections → new MVP collections

### Rules

❌ No code changes
❌ No deletions

### Output

* Summary of existing functionality
* List of files that are unnecessary for MVP
* List of files that should be kept and reused

---

## 🧹 PHASE 2 — DELETE UNNECESSARY FILES (CLEANUP PHASE)

### Goal

Remove everything **not required** for the simplified MVP.

### Files / Features to REMOVE

* Building
* Floor
* Bed
* Assignment
* Guest-specific logic (will be replaced by `persons`)

### Expected Deletions

```
core/buildingDb.py
core/floorDb.py
core/bedDb.py
core/assignmentDb.py

models/buildingModel.py
models/floorModel.py
models/bedModel.py
models/assignmentModel.py
models/guestModel.py

schemas/buildingSchema.py
schemas/floorSchema.py
schemas/bedSchema.py
schemas/assignmentSchema.py
schemas/guestSchema.py

services/buildingService.py
services/floorService.py
services/bedService.py
services/assignmentService.py
services/guestService.py

routes/buildingRoutes.py
routes/floorRoutes.py
routes/bedRoutes.py
routes/assignmentRoutes.py
routes/guestRoutes.py
```

### Rules

* Delete files completely
* Remove unused imports
* Fix broken references
* App must still start

### Output

* List of deleted files
* List of remaining features
* Confirmation app boots successfully

---

## 🧩 PHASE 3 — IMPLEMENT SIMPLIFIED MVP LOGIC

### Goal

Rebuild the backend using **only 4 collections** and **simple UX logic**.

### Implement / Modify

#### 1️⃣ Users (Owners)

* Keep existing auth
* Ensure `ownerId` is available everywhere

#### 2️⃣ Properties

* `propertyType`: hostel | apartment
* Owner-based access

#### 3️⃣ Units

* Represents **room or flat**
* Fields:

  * propertyId
  * unitType (room | flat)
  * floorNumber
  * unitNumber
  * totalCapacity
  * occupiedCount
  * price
  * meta (flatType, usageType)

#### 4️⃣ Persons

* Replaces guest / tenant / family
* Fields:

  * unitId
  * role (guest | tenant | family)
  * name
  * phone

### Rules

* No building logic
* No bed logic
* Capacity-based assignment only
* Increment/decrement `occupiedCount`

### Output

* New models, schemas, services, routes
* Working CRUD APIs
* Clean response structure (`id`, not `_id`)

---

## 🔍 PHASE 4 — VERIFY & POLISH

### Goal

Ensure correctness and simplicity.

### Tasks

* Verify:

  * Owner isolation
  * Capacity limits
  * Invalid assignments blocked
* Remove:

  * Dead code
  * Unused helpers
* Update:

  * README with final API usage
* Run basic test (`test_api.py`)

### Output

* Confirmation MVP works end-to-end
* Final file list
* API summary

---





