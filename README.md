# Mume - React Native Music Player

Hey there! Welcome to the codebase for Mume, a fully-featured, cross-platform music streaming app built entirely with React Native and Expo.

This project was an incredible deep-dive into managing complex, persistent background audio states, bridging modern UI/UX with smooth screen transitions, and dealing with native device storage. 

Watch the full app demo below natively interacting with the API and playing music off the queue!

<p align="center">
  <!-- Just drop your video file here and rename the path! -->
  <video src="./assets/demo.mp4" width="300" controls="controls"></video>
</p>

## Getting Started

If you want to spin this up locally, make sure you have Node and Expo CLI installed. The setup is pretty standard!

```bash
# 1. Clone the repo and install dependencies
npm install

# 2. Boot up the Expo bundler
npx expo start --clear
```
*(If you are running this on a physical device, just scan the QR code via Expo Go. If you want to use a simulator, press `i` for iOS or `a` for Android in the terminal).*

## Architecture Overview

I utilized **Zustand** as the core state-management library, moving away from standard React Context API to ensure high-performance, background-safe audio processing without triggering massive UI rerenders.

Here are the core pillars:

*   **React Navigation:** The app rests on `@react-navigation/native` (specifically Bottom Tabs and Material Top Tabs). You'll notice a smooth persistent `MiniPlayer` floating above the tab bar.
*   **The Music Engine (`useMusicStore`)**: Built over `expo-av`, this tightly controls the streaming player, the track scrubbing, and the global queuing system entirely out of standard React DOM. 
*   **Offline Support (`useDownloadStore`)**: The app uses `expo-file-system` to fetch `.m4a` binaries straight into the device's sandbox environment. It intercepts the playback URLs dynamically so if an offline hit is detected, it plays securely off exactly zero internet data!
*   **Storage Automation**: Handled natively by `@react-native-async-storage/async-storage` via Zustand's integrated `persist()` middleware to seamlessly hydrate queue logic, repeating modes, and offline song registries.

## Trade-offs & Decisions

Building a fast music player forced some structural trade-offs:

1.  **Zustand vs Redux Toolkit:** While Redux is universally known, using pure Zustand to manage a heavy, real-time Audio object results in far less boilerplate and completely eliminates the need for top-down root Providers tying up the App tree. The result is lightning fast synchronous access across hooks.
2.  **Filesystem Registry vs SQLite:** For offline library management, I simply map `AsyncStorage` JSON items to `expo-file-system` path strings natively via Zustand's persist handlers. It's incredibly fast to read/write, but obviously lacks the relational SQL power if we wanted to deeply query "All offline songs by Artist X released in 2021". For our scope, `AsyncStorage` was the lighter, more agile pick.
3.  **Shuffle Logic:** We shuffle logic at the client level using random index generators. True server-side shuffled permutations would be tighter, but pushing this to the client saved heavy API roundtripping. 

---

Hope you enjoy looking through the source code! Let me know if you run into any build issues.
