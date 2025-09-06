# VR QOL (Expo + TypeScript + NativeWind)

A React Native (Expo) project that implements all requested study forms/screens, with shared components and NativeWind (Tailwind) styling.

## Quick start
```bash
npm i -g expo-cli # if needed
npm install
npx expo start
```

> NativeWind works automatically via the Babel plugin and `tailwind.config.js`. Use className on React Native components.

## Screens included
- Home (screen picker)
- Investigators’ Brochure (Annexure B)
- Socio-Demographic (Annexure C)
- Patient Screening (Annexure D)
- FACT-G (Annexure G) – live scoring & reverse scoring
- Pre-VR Assessment (Annexure H)
- Pre & Post VR Questions (Annexure I)
- Post-VR Assessment & Questionnaires (Annexure J)
- Study Observation (Annexure K)
- Exit Interview
- Distress Thermometer (component and demo screen)

## Notes
- This project uses functional components with TypeScript.
- Reusable UI in `src/components`: `FormCard`, `Segmented`, `PillGroup`, `Chip`, `Thermometer`, `BottomBar`, `Field`.
- FACT-G items & scoring logic in `src/data/factg.ts`.
