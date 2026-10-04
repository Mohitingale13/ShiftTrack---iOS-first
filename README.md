# ShiftTrack

A mobile shift-tracking application designed for hospitality staff to manage work shifts, breaks, live elapsed hours, and hourly earnings. Built with React Native, TypeScript, and Expo adhering to iOS-first design principles.

---

## Features

- **Shift Management:** View weekly schedules, create shifts (with validation), and end active shifts.
- **Clock-In/Out & Persistent Timer:** A wall-clock elapsed timer that calculates active duration accurately even if the app is backgrounded or killed.
- **Shift Integrity Assistant:** Deterministic overlap detection preventing scheduling conflicts, plus cautions for shifts left active over 12 hours.
- **Missed Shift Detection:** Automatically identifies and marks past scheduled shifts as missed if they were never started.
- **Earnings Calculator:** Deducts unpaid breaks from gross hours and accurately calculates per-shift and total weekly earnings based on the staff member's hourly rate.

---

## Setup & Run Instructions

### Prerequisites
- Node.js >= 18
- npm >= 9
- *Note:* Native iOS Simulator is not available on Windows. Verification was performed via Expo Go.

### Installation
`ash
git clone https://github.com/Mohitingale13/ShiftTrack---iOS-first.git
cd ShiftTrack---iOS-first
npm install
`

### Start Development Server
`ash
# Run on web browser
npx expo start --web

# Run on Android device/emulator
npx expo start --android

# Run via Expo Go app for iOS/Android
npx expo start
`

### Assessment Test Credentials
- **Email:** staff@shifttrack.test
- **Password:** Password123
*(An "Auto-fill Staff Account" button is provided on the sign-in screen for one-tap testing).*

---

## Architecture & Persistence

`
ShiftTrack/
|-- src/
|   |-- app/                # Expo Router screens
|   |-- components/         # Reusable UI components
|   |-- services/           # Service layer simulating remote API
|   |-- state/              # Global state (AuthContext, ShiftContext)
|   |-- theme/              # Apple frosted-glass design tokens
|   \-- utils/              # Time, date, and earnings utilities
`

### Mock API & Persistence
The application relies on an internal mock service layer (src/services/auth.ts, src/services/shifts.ts) simulating a REST backend with artificial latency (300ms-500ms). The app relies entirely on local storage and does not require a deployed backend to run. 

Uses **Expo SecureStore** for native session persistence, with a browser storage fallback (window.localStorage) for web. The active elapsed timer is recalculated from the persisted clock-in timestamp using the device clock, allowing the timer to resume correctly after backgrounding.

---

## Verification

The following checks pass successfully on the current codebase:

`ash
# Run full automated test suite (14 tests passed: Auth + Shift Logic + Integrity)
npm test

# Run TypeScript strict type check (0 errors)
npx tsc --noEmit

# Run Expo dependency and configuration diagnostics (20/21 checks passed)
npx expo-doctor
`

---

## Known Limitations and Unfinished Work

- The application uses a local mock service layer; no production backend is connected.
- Native iOS Simulator testing was not performed locally on Windows. The app was verified using the available Expo Go development environment.
- The expo-doctor diagnostic currently reports 20/21 checks passing due to a missing peer dependency warning (expo-font for @expo/vector-icons). This does not affect execution in the development environment.
