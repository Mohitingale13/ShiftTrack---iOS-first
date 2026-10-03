# ShiftTrack

A mobile shift-tracking application designed for hospitality staff (servers, bartenders, hosts, and kitchen teams) to manage and track work shifts, breaks, and hourly earnings.

## Current Status: Milestone 1 — Project Foundation

This milestone establishes a clean, minimal project foundation using Expo, React Native, and TypeScript. No application business logic, authentication, or mock data stores are implemented at this stage.

## Technology Stack

- Framework: Expo SDK 57 (57.0.26)
- Runtime: React Native 0.86.3, React 19.2.3
- Language: TypeScript 6.0.3 (Strict mode enabled)
- Package Manager: npm 11.2.0
- Node Engine: Node.js 22.23.0

## Architecture and Project Structure

The project uses a structured layout under `src/` to support upcoming assessment milestones:

```
ShiftTrack/
├── assets/             # Application icons and splash assets
├── src/
│   ├── components/     # Reusable UI elements (cards, buttons, glass surfaces)
│   ├── navigation/     # Navigation containers and route parameters
│   ├── screens/        # Screen-level views
│   ├── services/       # API clients and mock data stores
│   ├── state/          # Session and shift state management
│   ├── theme/          # Design tokens, frosted glass materials, spacing, colors
│   └── types/          # Domain data models (shifts, breaks, user roles)
├── App.tsx             # Root application entry component
├── app.json            # Expo configuration manifest
├── index.ts            # Application registration entry point
├── package.json        # Project dependencies and run scripts
└── tsconfig.json       # TypeScript compiler options
```

## Design Direction

ShiftTrack targets an iOS-first visual language with restrained frosted-glass materials:

- Translucent elevated cards with subtle shadow depth.
- 1px hairline borders (`rgba(60, 60, 67, 0.12)`) replicating native iOS separators.
- Clear visual hierarchy with system fonts and WCAG-compliant contrast ratios.
- Minimum 44x44pt touch targets aligned with iOS Human Interface Guidelines.
- Solid and translucent fallbacks for platforms where hardware blur acceleration is not available.

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
# Start Metro bundler
npx expo start

# Run on Android emulator / connected device
npx expo start --android

# Run in web browser (preview)
npx expo start --web
```

### Verification and Checks

```bash
# Run TypeScript type check
npx tsc --noEmit

# Run Expo dependency diagnostics
npx expo-doctor

# Validate Metro production bundling for iOS
npx expo export -p ios
```

## Platform Support and Limitations

- Host OS: Windows 11.
- iOS Testing: Native iOS Simulator builds require macOS with Xcode. On Windows, iOS testing is conducted via the Expo Go client app on a physical iOS device connected to the same local network.
- Android Testing: Android Studio and Android SDK are available locally; an Android Virtual Device (AVD) or physical device can be launched via ADB.
