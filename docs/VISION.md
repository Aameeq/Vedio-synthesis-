# Project Vision: AI Creative Suite

## 1. Core Concept

This project is an exploration into the future of creative tooling, moving beyond simple, single-shot generative AI outputs to create a persistent, explorable, and directable world. Our core mission is to empower creators—from novice storytellers to professional artists—to build and share immersive, AI-generated scenes and narratives with an intuitive and powerful workflow.

We are not just a wrapper around an API; we are an integrated creative suite that manages state, provides an iterative workflow, and solves the "hard problems" of consistency, polish, and export that raw generative models do not address.

## 2. Project Documentation

This project is maintained with the help of both human developers and AI agents (e.g., Google's Jules). To ensure seamless collaboration, all contributors **must** familiarize themselves with the following core documents before making changes:

- **`VISION.md` (This file):** Outlines the "why" – the project's high-level goals and user-facing purpose.
- **`ROADMAP.md`:** Details the "what" and "when" – the planned features and strategic phases of development.
- **`ARCHITECTURE.md`:** Explains the "how" – the technical design, component structure, and data flow of the application.
- **`CONTRIBUTING.md`:** Defines the rules of engagement – the process for making changes, versioning, and communication.

## 3. Current Features

The application is a client-side web application built with a modern frontend stack. For a detailed technical breakdown, please refer to **`docs/ARCHITECTURE.md`**.

- **World Builder:**
  - Generate a world from a text prompt using `imagen-4.0-generate-001`.
  - Explore the world with camera controls, generating steerable video clips with `veo-2.0-generate-001`.
  - Edit the scene in-place using `gemini-2.5-flash-image-preview`.
  - View the generated content in a VR headset using the WebXR API.
  - Generate stereoscopic 3D video for a true depth experience.
  - Save, load, and manage a library of created worlds.

- **AR Filter Forge:**
  - An interactive "workshop" to design and test AR filters in real-time.
  - Live camera preview with head tracking powered by Google's MediaPipe.
  - Upload a 3D model (GLB/gLTF) and see it overlaid on your face.
  - Control the asset's placement with a combination of anchor points, mouse dragging, and fine-tuning sliders.

## 4. The Vision for the Future

Our long-term vision is detailed in **`docs/ROADMAP.md`**. The key phases are:

- **Phase 1: Complete Creative Control:** Evolve from a clip generator to a full storyboard and narrative creation tool with automated sound design and style locking.
- **Phase 2: True Immersion & Interactivity:** Move beyond 2D video to generating and exporting stereoscopic 3D video and, eventually, full 3D world models (GLB/gLTF).
- **Phase 3: The AI Game Engine (Long-Term):** Be prepared to integrate foundational "World Models" (like Genie) to enable the creation of fully interactive and playable experiences.
