# Project Roadmap

This document outlines the planned features and strategic direction for the AI Creative Suite. Our roadmap is divided into phases, moving from enhancing the core creative experience to pioneering new forms of immersive and interactive content.

---

## Part 1: The World Builder

**Goal:** Evolve the application from a tech demo into a complete, self-contained tool for creating polished, narrative-driven short videos.

### 1.1. Core Experience (COMPLETE)
- ✅ **Text-to-World Generation:** Use `imagen-4.0-generate-001` for the initial frame.
- ✅ **Steerable Video:** Use `veo-2.0-generate-001` for camera-controlled video clips.
- ✅ **"Living Canvas" Scene Editor:** Use `gemini-2.5-flash-image-preview` for in-place scene modification.
- ✅ **Asset Library:** Save/load worlds to `localStorage`.

### 1.2. Immersive Viewing (COMPLETE)
- ✅ **WebXR "Virtual Cinema":** View 2D video on an immersive screen.
- ✅ **"True Depth" 3D Video:** Generate and view stereoscopic 3D video in VR.
- ✅ **Video Export:** Download generated clips as MP4 files.

### 1.3. "Magic Polish" Layer (IN PROGRESS)
- ✅ **AI-Powered Audio:** Generate ambient soundtracks (currently with a placeholder).
- **Style Lock:** Allow users to provide a reference image to maintain a consistent artistic style.

### 1.4. The AI Storyboard (Future)
- **Visual Timeline:** A UI to arrange saved frames ("keyframes") into a sequence.
- **AI-Powered Transitions:** Allow users to provide narrative prompts (e.g., "whip pan," "dramatic zoom") to generate video transitions between keyframes.
- **Full Sequence Rendering:** A "Render Storyboard" button to generate and stitch all clips and transitions into a final video file.

---

## Part 2: The AR Filter Forge

**Goal:** To become the fastest and easiest way for anyone to go from an idea to a published AR filter, using AI to automate the most difficult parts of the workflow.

### 2.1. The "Magic Mirror" Workshop (COMPLETE)
- ✅ **Split-Screen UI:** A two-panel "workshop" for asset loading and live camera preview.
- ✅ **Live AR Preview:** Merge the views to see a 3D model tracked to your face in real-time, powered by MediaPipe and Three.js.
- ✅ **The Creator's Toolkit:** A full suite of controls for asset placement, including:
    - ✅ Direct mouse manipulation (drag-and-drop).
    - ✅ Anchor point snapping (head, nose, etc.).
    - ✅ Sliders for fine-tuning position, rotation, and scale.

### 2.2. The AI Asset Pipeline (Future)
- **Text/Image-to-3D Model:** Integrate a future Google model to generate the 3D asset (GLB) from a text prompt or image.
- **AI-Powered Animation:** Allow users to describe animations in plain English (e.g., "make it float") and have an AI generate the animation code.
- **AI-Powered Triggers:** Allow users to create simple rules (`When [user smiles] -> Then [play animation]`) using natural language.

### 2.3. The "One-Click" Tutorial (Future)
- **AI-Generated Guides:** Provide a button to generate a personalized, step-by-step tutorial on how to import the created asset into Spark AR or Lens Studio and publish it.

---

## Part 3: The Interactive World Engine (Long-Term Vision)

**Goal:** To be the premier creation suite for the next generation of generative AI models that can produce fully interactive, playable environments.
- **Integration with "World Models" (e.g., Genie):** When a model capable of generating interactive environments becomes available via API, we will integrate it as a new creation mode.
- **Action Mapping:** A UI for mapping user inputs (keyboard, controller) to actions within the generated world (e.g., jump, move, interact).
