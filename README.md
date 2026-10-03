# ShiftTrack

A mobile shift-tracking application designed for hospitality staff (servers, bartenders, hosts, and kitchen teams) to manage and track work shifts, breaks, and hourly earnings.

## Current Status: Milestone 2 — Core Architecture and Authentication

This milestone implements the core navigation architecture using Expo Router and an iOS-first authentication flow with token and session persistence.

### Implemented Features and Behavior

- Authentication Service (`src/services/auth.ts`):
  - Mock authentication endpoint verifying the assessment credentials (`staff@shifttrack.test` / `Password123`).
  - Returns a mock authentication token and user profile object (`Alex Morgan`, `server`, `$18.50/hr`).
  - Rejects invalid emails and passwords with clear user-facing error messages.
- Session Persistence (`src/services/storage.ts`):
  - Uses `expo-secure-store` to safely persist and restore the session token and user profile across app restarts.
  - Gracefully handles environments where SecureStore is unavailable.
  - Clears stored session tokens on user logout.
- Authentication State Management (`src/state/AuthContext.tsx`):
  - React Context and custom `useAuth()` hook providing `user`, `token`, `isAuthenticated`, `isLoading`, and `error` states.
  - Automatically attempts session restoration when the application starts.
  - Provides `signIn()` and `signOut()` operations.
- Navigation Flow & Route Guards (`src/app/`):
  - Powered by Expo Router with route groups `(auth)` and `(app)`.
  - Unauthenticated users are restricted to the login screen (`/(auth)/login`).
  - Authenticated users automatically enter the main application (`/(app)`).
  - Logging out immediately clears persisted state and redirects back to the login screen.
- User Interface:
  - iOS-first design using restrained frosted-glass surfaces, hairline borders, and subtle depth.
  - Keyboard-aware layout (`KeyboardAvoidingView` + `ScrollView`) preventing inputs or submit buttons from being obscured.
  - Form validation for email format and password length.
  - Submit button is disabled while an authentication request is in flight.
  - Clear error banner when incorrect credentials are submitted.
  - Quick-fill button for testing convenience during assessment review.

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
|-- assets/             # Application icons, adaptive icons, splash screens
|-- scripts/
|   \-- test-auth-logic.js  # Node.js automated test suite for authentication
|-- src/
|   |-- app/            # Expo Router file-based screens and layouts
|   |   |-- _layout.tsx # Root layout with SafeAreaProvider, AuthProvider, and route guard
|   |   |-- index.tsx   # Entry redirector
|   |   |-- (auth)/     # Authentication route group
|   |   |   |-- _layout.tsx
|   |   |   \-- login.tsx
|   |   \-- (app)/      # Authenticated application group
|   |       |-- _layout.tsx
|   |       \-- index.tsx
|   |-- components/     # Reusable UI components (Button, GlassCard, Input, LoadingScreen)
|   |-- services/       # Mock auth service and SecureStore session storage
|   |-- state/          # AuthContext and state hooks
|   |-- theme/          # Design tokens: frosted glass, spacing, colors, HIG metrics
|   \-- types/          # Domain types (UserProfile, UserSession, ShiftRecord)
|-- app.json            # Expo configuration manifest with scheme and plugins
|-- package.json        # Dependencies, Expo Router entry, and run scripts
\-- tsconfig.json       # Strict TypeScript compiler configuration
```

## Test Credentials

For testing the authentication flow:

- Email: `staff@shifttrack.test`
- Password: `Password123`

A "Use Staff Demo Credentials" button is also provided directly on the login screen for testing convenience.

## Getting Started

### Prerequisites

- Node.js 22.x or 20.x
- npm 10.x or 11.x
- Expo Go on a mobile device (iOS/Android) or an Android Virtual Device

### Installation

```bash
npm install
```

### Running Locally

```bash
# Start Metro bundler with Expo Router
npx expo start

# Run on Android emulator / connected device
npx expo start --android

# Run in web browser (preview)
npx expo start --web
```

### Verification and Checks

```bash
# Run automated authentication unit tests
npm run test:auth

# Run TypeScript type check
npx tsc --noEmit

# Run Expo dependency diagnostics
npx expo-doctor

# Validate Metro production bundling for iOS
npx expo export -p ios
```

## Platform Support and Limitations

- Host OS: Windows 11.
- iOS Testing: Native iOS Simulator builds require macOS with Xcode. On Windows, iOS testing is conducted via the Expo Go client app on a physical iOS device connected to the same local network, or web preview.
- Android Testing: Android Studio and Android SDK are available locally; an Android Virtual Device (AVD) or physical device can be launched via ADB.