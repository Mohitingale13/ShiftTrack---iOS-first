# ShiftTrack

A mobile shift-tracking application designed for hospitality staff (servers, bartenders, hosts, and kitchen teams) to manage work shifts, breaks, live elapsed hours, and hourly earnings. Built with **React Native**, **TypeScript**, and **Expo** adhering to iOS-first Human Interface Guidelines.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js >= 18 (Tested on Node.js 22.23.0)
- npm >= 9
- **Platform Limitations:** Native iOS Simulator is not natively available on Windows. iOS verification was performed via Expo Go and EAS cross-platform abstraction.

### Installation & Run Instructions
```bash
# Clone the repository
git clone https://github.com/Mohitingale13/ShiftTrack---iOS-first.git
cd ShiftTrack---iOS-first

# Install dependencies
npm install

# Start development server
npx expo start

# Run specifically in browser preview
npx expo start --web

# Run on iOS physical device (via Expo Go app)
npx expo start --ios

# Run on Android device / emulator
npx expo start --android
```

### Assessment Credentials
- **Email:** `staff@shifttrack.test`
- **Password:** `Password123`
*(A discrete "Auto-fill Staff Account" button is also provided on the sign-in screen for one-tap testing).*

---

## 2. API Contract & Mock Simulation

The application implements a dedicated in-app mock service layer simulating real-world network latency (300ms-500ms) adhering strictly to the assessment REST contract. **Note: This simulates the REST contract locally; it does not imply a real remote backend exists.**

| Operation | Method / Route | Simulated Service Function | Response / Payload Contract |
|---|---|---|---|
| **Staff Login** | `POST /auth/login` | `loginApi(credentials)` in [`src/services/auth.ts`](./src/services/auth.ts) | `{ "token": "mock-jwt-...", "user": { "id": "usr_hosp_01", "name": "Mohit", "role": "server", "hourlyRate": 30 } }` |
| **Get Weekly Shifts** | `GET /shifts?weekStart=YYYY-MM-DD` | `fetchShiftsApi(userId, { weekStart })` in [`src/services/shifts.ts`](./src/services/shifts.ts) | Returns `ShiftRecord[]`. Example fields: `{ "id": "s1", "scheduledStart": "2026-09-28T09:00:00.000Z", "scheduledEnd": "2026-09-28T17:00:00.000Z", "status": "scheduled", "breaks": [...] }` |
| **Create Shift** | `POST /shifts` | `createShiftApi(userId, input)` in [`src/services/shifts.ts`](./src/services/shifts.ts) | Validates timestamps (end > start, break < duration) and persists new record. |
| **Update / End Shift** | `PATCH /shifts/:id` | `patchShiftApi(shiftId, updates)` / `endShiftApi(shiftId)` in [`src/services/shifts.ts`](./src/services/shifts.ts) | Updates fields (e.g., sets `actualClockOut`, `status: "completed"`). |

### How to Demonstrate Error State & Retry Action
To reproduce a network error on demand for demonstrations and evaluations:
1. Open the browser developer console at `http://localhost:8081`.
2. Run:
   ```js
   window.__simulateShiftApiError = true;
   ```
3. Pull to refresh or trigger a reload: The screen will display the global error banner.
4. In the console, reset the flag:
   ```js
   window.__simulateShiftApiError = false;
   ```
5. Tap the **"Retry"** button on the error banner: The shifts will instantly reload and the error clears.

---

## 3. Architecture & Persistence Strategy

```
ShiftTrack/
|-- src/
|   |-- app/                # Expo Router screens and layouts
|   |-- components/         # Reusable UI components (ActiveShiftCard, TimePickerModal, etc.)
|   |-- services/           # Service layer simulating remote API
|   |   |-- auth.ts         # Authentication API simulation
|   |   |-- shifts.ts       # Shift management API simulation
|   |   |-- storage.ts      # Hardware-backed SecureStore & browser fallback
|   |   \-- integrity.ts    # Shift Integrity Assistant conflict detection
|   |-- state/              # Application state providers (AuthContext, ShiftContext)
|   |-- theme/              # Apple frosted-glass design tokens
|   \-- utils/              # Pure utilities for dates, week boundaries, and timer math
```

### Persistence Logic & Wall-Clock Timer
- **Native Secure Storage:** Persisted using hardware-backed **Expo SecureStore** on iOS/Android.
- **Browser Preview Fallback:** Automatically falls back to `window.localStorage` on web.
- **Wall-Clock Elapsed Timer:** Elapsed time is calculated strictly from the persisted ISO timestamp (`actualClockIn`) against `Date.now()`. It ensures 100% accuracy if the app is backgrounded, device is locked, or app is killed and reopened.

---

## 4. Extra Features

### Shift Integrity Assistant
A deterministic, rule-based conflict detector ensures schedule integrity without requiring an LLM:
- **Schedule Overlap Detection:** Identifies when a scheduled or active shift overlaps with another shift. It flags the exact overlapping duration in minutes and identifies both conflicting shifts by their scheduled intervals.
- **12-Hour Active Shift Caution:** Continuously monitors active shifts; if a shift remains active (clocked-in) for longer than 12 hours, a caution warning is presented reminding staff to check if a clock-out was missed.

### Missed Shift Detection & Earnings Engine
- **Missed Shifts:** Dynamically derives missed shifts if a scheduled shift's end time passes without being started. Active shifts are safely protected from this state.
- **Earnings Calculator:** Automatically deducts unpaid break minutes from the gross active duration, multiplying by the user's hourly rate to display exact per-shift and aggregate weekly earnings.

---

## 5. Verification & Testing

The following automated and manual checks were successfully run on the final codebase:

```bash
# Run full automated test suite (14 tests passed: Auth + Shift Logic + Integrity + Missed/Earnings)
npm test

# Run TypeScript strict type check (0 errors)
npx tsc --noEmit

# Run Expo dependency and configuration diagnostics (21/21 passed)
npx expo-doctor

# Validate production Web bundling (Successfully Exported)
npx expo export -p web
```
*(Note: Native iOS bundling was tested via Expo Go abstraction; local `.ipa` export requires macOS and `eas build` was utilized for iOS verification without local Mac hardware).*

---

## 6. Submission Checklist

- [x] **Repository URL:** `https://github.com/Mohitingale13/ShiftTrack---iOS-first.git`
- [x] **Branch:** `main`
- [ ] **Collaborator Access:** If repository is private, invite GitHub user `JeetDas5`.
- [ ] **5-Minute Loom Video Walkthrough:** (Pending recording)
  1. **Login:** Enter `staff@shifttrack.test` / `Password123`. Show invalid password error first.
  2. **Shifts List:** Review current week schedule, times, breaks, net durations.
  3. **Create Shift:** Add a new shift, demonstrating validation (end time after start time).
  4. **Active Shift & Timer:** Tap "Clock In Now". Show the live digital timer.
  5. **Background / Reopen:** Refresh the browser / background the app to verify timer accuracy.
  6. **End Shift:** Tap "Clock Out & End Shift".
  7. **Error / Retry Demo:** Execute `window.__simulateShiftApiError = true`, trigger refresh, tap "Retry" after resetting.
  8. **Architecture:** Briefly explain separation of UI, Services, State, and persistence.
