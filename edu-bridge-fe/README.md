# Edu Bridge Frontend

A React Native mobile application built with Expo for the Edu Bridge educational platform.

## Features

- **Modern UI**: Clean and intuitive interface
- **API Integration**: Connects to the Edu Bridge backend API
- **Navigation**: Stack-based navigation between screens
- **TypeScript**: Full TypeScript support for type safety

## Screens

- **Home Screen**: Welcome screen with navigation options
- **Hello Screen**: Tests the backend API connection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Scan the QR code with Expo Go app on your mobile device

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## Project Structure

```
src/
├── screens/          # App screens
│   ├── HomeScreen.tsx
│   └── HelloScreen.tsx
├── services/          # API services
│   └── apiService.ts
└── navigation/        # Navigation configuration
```

## API Integration

The app connects to the Edu Bridge backend API running on `http://localhost:3000`:

- **GET /api/hello** - Test endpoint that returns a hello message

## Backend Connection

Make sure the Edu Bridge backend (`edu-bridge-be`) is running on port 3000 before testing the API integration.

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- Axios (for API calls)
