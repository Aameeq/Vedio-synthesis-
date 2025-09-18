# Application Architecture

This document provides a technical overview of the AI Creative Suite. It is intended for developers and AI agents (e.g., Jules) who will be contributing to the codebase.

## 1. High-Level Design

The application is a single-page application (SPA) built with **React** and **TypeScript**. It operates entirely on the client-side, making API calls to Google's AI services for generative content. There is no custom backend server.

A simple hash-based router in `App.tsx` directs the user to one of two main "pages": `WorldBuilder.tsx` or `ARForge.tsx`.

## 2. Core Technologies

- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **AI Models (via `@google/genai`):**
  - `imagen-4.0-generate-001`: For 2D image generation.
  - `veo-2.0-generate-001`: For steerable video generation.
  - `gemini-2.5-flash-image-preview`: For in-place scene editing and stereoscopic view generation.
  - `gemini-2.5-flash`: For auxiliary text-based tasks (e.g., generating tutorials).
- **3D/AR:**
  - **Three.js:** For all real-time 3D rendering.
  - **Google's `<model-viewer>`:** For static, interactive previews of 3D models.
  - **Google's MediaPipe:** For high-performance, in-browser face and head tracking.
  - **WebXR API:** For the "Virtual Cinema" immersive viewing mode.
- **Persistence:** Browser `localStorage` (managed by `utils/worldManager.ts`).

## 3. Component Breakdown

### Core
- **`App.tsx`**: The root component. Manages routing.
- **`Header.tsx`**: The main navigation bar.

### World Builder (`pages/WorldBuilder.tsx`)
This page manages all state for the steerable video feature.
- **`PromptInput.tsx`**: The initial UI for entering a text prompt.
- **`VideoDisplay.tsx`**: The main viewscreen. Renders either the current frame image or the playing video. Captures the final frame using an HTML canvas. Also manages the WebXR session for VR playback.
- **`Controls.tsx` / `PresetSelector.tsx`**: UI for camera movement.
- **`SceneEditor.tsx`**: UI for `Edit Mode`.
- **`AssetLibrary.tsx`**: Modal for saved worlds.

### AR Filter Forge (`pages/ARForge.tsx`)
This page manages the state for the AR creation tool. It has two primary modes: `setup` and `live`.
- **`ModelViewer.tsx`**: A wrapper for Google's `<model-viewer>` used in `setup` mode.
- **`ARPreview.tsx`**: The core "Magic Mirror" component used in `live` mode. This is a complex component that integrates the `<video>` stream, a transparent Three.js `<canvas>`, and the MediaPipe face tracking loop. It also handles mouse-based drag-and-drop for the 3D model.
- **`ARControls.tsx`**: The "Creator's Toolkit" UI with sliders and a dropdown for manipulating the 3D model's transform.

## 4. Services and Utilities

-   **`services/geminiService.ts`**: The sole interface to the Google GenAI APIs. It abstracts all API calls and response processing.
-   **`utils/worldManager.ts`**: A simple utility for abstracting `localStorage` interactions for the Asset Library.

## 5. Key Data Flows

### A. AR "Magic Mirror" Flow (`ARForge.tsx`)
1.  **User** is in `setup` mode. They upload a `.glb` file and click "Start Camera".
2.  The `modelSrc` (an object URL) and `stream` (a `MediaStream`) are stored in state.
3.  The "Merge to Live Preview" button becomes enabled.
4.  **User** clicks the "Merge" button.
5.  The `arMode` state is changed to `live`.
6.  `ARForge.tsx` now renders the `<ARPreview>` and `<ARControls>` components, passing down the `modelFile`, `stream`, and `transform` state.
7.  `<ARPreview>` initializes MediaPipe and Three.js. It starts a `requestAnimationFrame` loop.
8.  In the loop, MediaPipe provides the latest head position. `<ARPreview>` updates the Three.js model's position to match, creating the tracking effect.
9.  **User** interacts with `<ARControls>` (e.g., moves a slider).
10. The `onChange` callback in `<ARControls>` fires, calling a state setter function passed down from `ARForge.tsx`.
11. The `transform` state in `ARForge.tsx` is updated.
12. This new `transform` is passed as a prop to `<ARPreview>`, which applies the new position/scale to the model in the next frame of its animation loop.