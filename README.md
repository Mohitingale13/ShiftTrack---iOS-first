# ShiftTrack

A mobile shift-tracking application designed for hospitality staff (servers, bartenders, hosts, and kitchen teams) to manage and track work shifts, breaks, and hourly earnings.

## Current Status: Milestone 3 — Shift Management

This milestone implements the core shift-management workflows, live elapsed-time tracking, and a deterministic Shift Integrity Assistant:

### 1. Weekly Shifts Overview
- Displays shifts scheduled or completed for the current week (Monday through Sunday).
- For each shift, displays:
  - Date and day of week (`formatDate`)
  - Scheduled time interval (`formatTime`)
  - Status indicator badge (`SCHEDULED`, `ACTIVE`, `COMPLETED`)
  - Break duration in minutes
  - Net working duration deducting breaks (`formatDuration`)
  - Work location / section
- Handles loading indicator, empty schedule state with a quick schedule prompt, and an error state with an instant retry action.

### 2. Create Shift Workflow (`/(app)/create-shift`)
- Accessible, keyboard-aware form supporting date, start time (24h), end time (24h), break duration, location, and optional notes.
- Strict input validation:
  - Validates date and time formats.
  - Ensures the scheduled end time is strictly after the start time.
  - Ensures break duration is non-negative and strictly less than the total shift duration.
  - Prevents duplicate form submissions while a request is in flight.
  - Displays inline field validation and top-level API error messages.

### 3. Active Shift & Live Elapsed Timer
- Supports clocking in to start a shift and clocking out to end an active shift.
- Displays a live elapsed timer (`HH:MM:SS`) for active shifts.
- **Wall-clock accuracy**: Elapsed time is calculated strictly from persisted ISO timestamps (`actualClockIn`) against `Date.now()`. It does not rely on an incrementing counter, ensuring 100% accuracy when the application is backgrounded, device is locked, or app is restarted.
- State transitions enforce business rules:
  - Prevents starting multiple concurrent active shifts.
  - Prevents ending shifts that are not currently active.
  - Prevents restarting already completed shifts.
- Shift records and active statuses persist across app restarts using Expo SecureStore.

### 4. Shift Integrity Assistant
- Deterministic, explainable conflict detection engine (`src/services/integrity.ts`):
  - **Overlap Detection**: Analyzes time intervals across all active and scheduled shifts. When an overlap is detected, displays an alert explaining the exact conflict, the dates, times, and overlapping duration in minutes.
  - **Unusually Long Shifts**: Emits a caution notice if an active shift has been open for more than 12 hours to alert staff to check if clock-out was missed.

## Technology Stack

- Framework: Expo SDK 57 (57.0.26)
- Navigation: Expo Router 57.0.24 (File-based routing)
- Persistence: Expo SecureStore 57.0.4
- Runtime: React Native 0.86.3, React 19.2.3
- Language: TypeScript 6.0.3 (Strict mode enabled)
- Package Manager: npm 11.2.0
- Node Engine: Node.js 22.23.0

## Architecture and Project Structure

```
ShiftTrack/
|-- assets/                 # Application icons and splash screens
|-- scripts/
|   |-- test-auth-logic.js  # Automated authentication & session test suite
|   \-- test-shifts-logic.js# Automated shift transitions, timer, & integrity test suite
|-- src/
|   |-- app/                # Expo Router screens and layouts
|   |   |-- _layout.tsx     # Root layout with SafeAreaProvider, AuthProvider, and ShiftProvider
|   |   |-- index.tsx       # Entry redirector
|   |   |-- (auth)/         # Authentication flow
|   |   |   |-- _layout.tsx
|   |   |   \-- login.tsx   # Frosted-glass staff sign-in screen
|   |   \-- (app)/          # Authenticated application
|   |       |-- _layout.tsx
|   |       |-- index.tsx   # Dashboard: weekly shifts, active timer, integrity alerts
|   |       \-- create-shift.tsx # Form to record/schedule new shifts
|   |-- components/         # Reusable UI components
|   |   |-- ActiveShiftCard.tsx # Live elapsed-time active shift card
|   |   |-- ShiftItem.tsx       # Weekly shift schedule item card
|   |   |-- IntegrityBanner.tsx # Shift Integrity Assistant conflict notifications
|   |   |-- Button.tsx          # Accessible iOS button
|   |   |-- GlassCard.tsx       # Restrained frosted-glass elevated card
|   |   |-- Input.tsx           # Accessible text input with label and error state
|   |   \-- LoadingScreen.tsx   # Splash/session restoration loading indicator
|   |-- services/           # Service layer
|   |   |-- auth.ts             # Mock authentication API
|   |   |-- storage.ts          # SecureStore session storage
|   |   |-- shifts.ts           # Mock shifts API with SecureStore persistence
|   |   \-- integrity.ts        # Shift Integrity Assistant conflict detector
|   |-- state/              # Application state providers
|   |   |-- AuthContext.tsx     # Session management and auth state
|   |   \-- ShiftContext.tsx    # Shift schedule, active timer, and conflict state
|   |-- theme/              # iOS frosted-glass tokens, spacing, colors, HIG metrics
|   |-- types/              # Domain types (ShiftRecord, ShiftConflict, UserProfile)
|   \-- utils/              # Pure utilities
|       |-- date.ts             # Date and duration formatters, week range calculations
|       \-- time.ts             # Live elapsed timer calculations from timestamps
|-- app.json                # Expo configuration manifest
|-- package.json            # Dependencies, scripts, and Expo entry
\-- tsconfig.json           # Strict TypeScript configuration
```

## Mock API Contracts & Limitations

The application uses an isolated mock service layer (`src/services/shifts.ts` and `src/services/auth.ts`) simulating network latency (300ms–500ms):
- Authentication verifies the exact assessment credentials:
  - Email: `staff@shifttrack.test`
  - Password: `Password123`
- Shifts are seeded for the current week and stored securely via `expo-secure-store` (`shifttrack_mock_shifts_data`).
- Changes made during the session (creating shifts, clocking in, clocking out) are persisted locally across application restarts.
- **Limitation**: The mock service operates entirely client-side. There is no remote backend server or multi-device synchronization.

## Verification and Testing

```bash
# Run full automated test suite (Auth + Shift Management + Integrity Assistant)
npm test

# Run authentication unit tests specifically
npm run test:auth

# Run shift logic and integrity detector tests specifically
npm run test:shifts

# Run TypeScript type check
npx tsc --noEmit

# Run Expo dependency diagnostics
npx expo-doctor

# Validate Metro production bundling for iOS
npx expo export -p ios
```

## Platform Support

- Host Environment: Windows 11.
- Testing on iOS: Supported via Expo Go on physical iOS devices or web preview (`npx expo start --web`). Native iOS Simulator builds require macOS and Xcode.
- Testing on Android: Supported via Android Studio AVD or connected Android devices.