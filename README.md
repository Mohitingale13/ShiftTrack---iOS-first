# ShiftTrack

A mobile shift-tracking application designed for hospitality staff (servers, bartenders, hosts, and kitchen teams) to manage work shifts, breaks, live elapsed hours, and hourly earnings. Built with **React Native**, **TypeScript**, and **Expo** adhering to iOS-first Human Interface Guidelines.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js >= 18 (Tested on Node.js 22.23.0)
- npm >= 9

### Installation & Run Instructions
```bash
# Clone the repository
git clone https://github.com/Mohitingale13/ShiftTrack---iOS-first.git
cd ShiftTrack---iOS-first

# Install dependencies (SDK-compatible versions)
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

The application implements a dedicated in-app mock service layer simulating real-world network latency (300ms–500ms) adhering strictly to the assessment REST contract:

| Operation | Method / Route | Simulated Service Function | Response / Payload Contract |
|---|---|---|---|
| **Staff Login** | `POST /auth/login` | `loginApi(credentials)` in [`src/services/auth.ts`](file:///c:/Users/Mohit/Desktop/ShiftTrack/src/services/auth.ts) | `{ "token": "mock-jwt-...", "user": { "id": "usr_hosp_01", "name": "Mohit", "role": "server", "hourlyRate": 18.50 } }` |
| **Get Weekly Shifts** | `GET /shifts?weekStart=YYYY-MM-DD` | `fetchShiftsApi(userId, { weekStart })` in [`src/services/shifts.ts`](file:///c:/Users/Mohit/Desktop/ShiftTrack/src/services/shifts.ts) | Returns `ShiftRecord[]` matching the week interval with canonical fields: `{ "id": "s1", "date": "2026-09-28", "startTime": "...", "endTime": null, "breakMinutes": 30 }` |
| **Create Shift** | `POST /shifts` | `createShiftApi(userId, input)` in [`src/services/shifts.ts`](file:///c:/Users/Mohit/Desktop/ShiftTrack/src/services/shifts.ts) | Validates timestamps (end > start, break < duration) and persists new record. |
| **Update / End Shift** | `PATCH /shifts/:id` | `patchShiftApi(shiftId, updates)` / `endShiftApi(shiftId)` in [`src/services/shifts.ts`](file:///c:/Users/Mohit/Desktop/ShiftTrack/src/services/shifts.ts) | Updates fields (e.g., sets `actualClockOut`, `status: "completed"`, `endTime: ISO`). |

### How to Demonstrate Error State & Retry Action
To reproduce a network error on demand for demonstrations and evaluations:
1. Open the browser developer console at `http://localhost:8081`.
2. Run:
   ```js
   window.__simulateShiftApiError = true;
   ```
3. Pull to refresh or trigger a reload: The screen will display the global error banner:
   *"Simulated network error: Unable to connect to shift server. Tap Retry to reconnect."*
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
|   |   |-- _layout.tsx     # Root layout with SafeAreaProvider, AuthProvider, and ShiftProvider
|   |   |-- (auth)/login.tsx# Frosted-glass staff sign-in screen
|   |   \-- (app)/          # Authenticated routes
|   |       |-- index.tsx   # Dashboard: weekly shifts, hero active timer, integrity alerts
|   |       \-- create-shift.tsx # Modal form to record/schedule new shifts
|   |-- components/         # Reusable UI components (ActiveShiftCard, ShiftItem, GlassCard, etc.)
|   |-- services/           # Service layer
|   |   |-- auth.ts         # Authentication API simulation
|   |   |-- shifts.ts       # Shift management API simulation
|   |   |-- storage.ts      # Hardware-backed SecureStore & browser preview persistence
|   |   \-- integrity.ts    # Shift Integrity Assistant conflict detection
|   |-- state/              # Application state providers (AuthContext, ShiftContext)
|   |-- theme/              # Apple frosted-glass design tokens (HIG metrics, specular borders)
|   |-- types/              # TypeScript domain types & canonical API contracts
|   \-- utils/              # Pure utilities for dates, week boundaries, and timer math
```

### Persistence Logic & Wall-Clock Timer
- **Native Secure Storage:** On native iOS and Android, authentication tokens, user sessions, and shift data are persisted using hardware-backed **Expo SecureStore** (iOS Keychain / Android Keystore).
- **Browser Preview Fallback:** In the web browser preview, `storage.ts` and `shifts.ts` detect the web environment and fall back to `window.localStorage` so data survives browser page refreshes.
- **Wall-Clock Elapsed Timer:** The active shift elapsed time is calculated strictly from the persisted ISO timestamp (`actualClockIn`) against `Date.now()`. It does not rely on an incrementing counter, ensuring 100% accuracy if the app is backgrounded, the device is locked, or the app is killed and reopened.

---

## 4. Verification & Testing

```bash
# Run full automated test suite (12 tests: Auth + Shift Logic + Integrity + PDF Contract)
npm test

# Run authentication unit tests specifically
npm run test:auth

# Run shift logic and integrity detector tests specifically
npm run test:shifts

# Run TypeScript strict type check (0 errors)
npx tsc --noEmit

# Run Expo dependency and configuration diagnostics (21/21 passed)
npx expo-doctor

# Validate production iOS bundling
npx expo export -p ios

# Validate production Web bundling
npx expo export -p web
```

---

## 5. Submission Checklist

- [x] **Repository URL:** `https://github.com/Mohitingale13/ShiftTrack---iOS-first.git`
- [x] **Branch:** `main`
- [ ] **Collaborator Access:** If repository is private, invite GitHub user `JeetDas5`.
- [ ] **5-Minute Loom Video Walkthrough:**
  1. **Login:** Enter `staff@shifttrack.test` / `Password123` (or auto-fill button). Show invalid password error first.
  2. **Shifts List:** Review current week schedule, times, breaks, net durations, and ₹18.50/hr rate.
  3. **Create Shift:** Add a new shift, demonstrating validation (end time after start time).
  4. **Active Shift & Timer:** Tap "Clock In Now" (or "Start This Shift"). Show the live digital timer.
  5. **Background / Reopen:** Refresh the browser / background the app and show that elapsed time remains accurate.
  6. **End Shift:** Tap "Clock Out & End Shift" to complete the shift.
  7. **Error / Retry Demo:** Execute `window.__simulateShiftApiError = true`, trigger refresh, tap "Retry" after resetting.
  8. **Architecture:** Briefly explain separation of UI, Services (`shifts.ts`, `auth.ts`), State (`ShiftContext`, `AuthContext`), and persistence.