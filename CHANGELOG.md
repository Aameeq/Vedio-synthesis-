# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2024-08-16

### Added
- **Interactive AR Filter Forge:** Implemented a major new feature for creating and testing AR filters.
- **Live AR Preview ("Magic Mirror"):** Added a real-time view that overlays a 3D model on the user's camera feed.
- **Real-Time Head Tracking:** Integrated Google's MediaPipe for high-performance face and head tracking.
- **Creator Toolkit:** Added a full suite of controls for AR asset placement, including direct mouse manipulation, anchor point snapping, and fine-tuning sliders for position, rotation, and scale.

### Changed
- **UI/UX Overhaul:** Redesigned the entire application with a more professional, two-panel layout and a consistent, modern design system.
- **Refactored Script Loading:** Stabilized the application by resolving library conflicts with Three.js and MediaPipe, ensuring a single, consistent version of each is loaded.

### Fixed
- **AR Preview Crash:** Resolved a critical race condition where the AR preview would try to initialize MediaPipe before the library had loaded.
- **3D Model Rotation:** Corrected the 3D math for model rotation to use a more stable quaternion-based method, eliminating visual glitches.

## [0.1.0] - 2024-08-14
- **Initial Project Scaffolding:** Set up the base application with React, TypeScript, and Tailwind CSS.
- **Core AI Integration:** Integrated `imagen-4.0-generate-001` for initial image generation and `veo-2.0-generate-001` for steerable video generation.
- **Camera Controls:** Implemented basic camera movement via on-screen buttons and keyboard shortcuts.
- **Cinematic Presets:** Added a dropdown for pre-defined camera movement sequences.
- **"Living Canvas" Scene Editor:** Implemented `Edit Mode` using `gemini-2.5-flash-image-preview` for in-place scene modification.
- **WebXR "Virtual Cinema":** Added a VR Player to view generated content on immersive headsets.
- **Stereoscopic 3D Generation:** Implemented a "Generate in 3D" mode for a true depth experience in VR.
- **Video Export:** Added a "Download Video" button to save generated clips as MP4 files.
- **"Magic Polish" Audio:** Added a placeholder audio track feature.
- **Asset Library:** Implemented a system to save, load, and delete worlds using `localStorage`.
- **Project Documentation:** Created initial `VISION.md`, `ROADMAP.md`, `ARCHITECTURE.md`, and `CONTRIBUTING.md`.
