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

I stepped away from heavy state-management libraries (like Redux or Zustand) and built a deeply integrated **Context API** architecture to manage everything. 

Here are the core pillars:

*   **React Navigation:** The app rests on `@react-navigation/native` (specifically Bottom Tabs and Material Top Tabs). You'll notice a smooth persistent `MiniPlayer` floating above the tab bar.
*   **The Music Engine (`MusicContext`)**: Built over `expo-av`, this tightly controls the streaming player, the track scrubbing, and the global queuing system. 
*   **Offline Support (`DownloadContext`)**: The app uses `expo-file-system` to fetch `.m4a` binaries straight into the device's sandbox environment. It intercepts the playback URLs dynamically so if an offline hit is detected, it plays securely off exactly zero internet data!
*   **Storage**: Handled natively by `@react-native-async-storage/async-storage` for queueing logic, player hydration, and our offline song registries.

## Trade-offs & Decisions

Building a fast music player forced some structural trade-offs:

1.  **Context vs Redux:** Using pure React Context to manage a heavy, real-time Audio object can result in unnecessary re-renders across consumers if we aren't careful. I opted for Context primarily for speed of iteration and simplicity, mitigating re-renders where possible using strict references and hooks. If the app scales to millions of users, migrating to Zustand or Redux would be a safer bet for isolating UI rerenders from the playback clock.
2.  **Filesystem Registry vs SQLite:** For offline library management, I simply map `AsyncStorage` JSON items to `expo-file-system` path strings. It's incredibly fast to read/write, but obviously lacks the relational SQL power if we wanted to deeply query "All offline songs by Artist X released in 2021". For our scope, `AsyncStorage` was the lighter, more agile pick.
3.  **Shuffle Logic:** We shuffle logic at the client level using random index generators. True server-side shuffled permutations would be tighter, but pushing this to the client saved heavy API roundtripping. 

---

Hope you enjoy looking through the source code! Let me know if you run into any build issues.
