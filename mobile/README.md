# VapeDrop mobile (legacy)

This is the original Expo / React Native build (Expo Router, React Native Firebase,
`react-native-maps`). It is **not** part of the web deployment and is not built by Workers Builds —
it lives here for reference and possible native work later.

The shipping product is the web app in the repository root, which needs no install and works on any
phone browser.

## Running it (optional)

```bash
cd mobile
npm install
npx expo start        # or: npm run android / npm run ios
```

## Firebase config

The repo ships placeholder native config files. Replace them with the real ones from the Firebase
console:

- iOS: `mobile/GoogleService-Info.plist`
- Android: `mobile/google-services (1).json` (also referenced by `mobile/android/app`)

## Relationship to the web app

| | Web (`/`) | Mobile (`/mobile`) |
| --- | --- | --- |
| Framework | Vite + React + Tailwind | Expo Router / React Native |
| Map | MapLibre + OpenFreeMap | `react-native-maps` (Google/Apple maps) |
| Auth | Firebase Web SDK | React Native Firebase / Google Sign-In |
| Status | Deployed, actively developed | Reference only |
