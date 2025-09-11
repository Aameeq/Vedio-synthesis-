# Contributing Guidelines

Thank you for your interest in contributing to the AI Creative Suite. Your contributions, whether from human developers or AI agents, are welcome. To ensure a smooth and collaborative process, please adhere to the following guidelines.

## 1. Understand the Vision

Before writing any code, it is **mandatory** to read and understand the core project documents located in the `/docs` directory:

1.  **`VISION.md`**: The high-level goals and purpose of the application.
2.  **`ROADMAP.md`**: The planned features and strategic direction.
3.  **`ARCHITECTURE.md`**: The technical design and structure of the codebase.

These documents provide the necessary context to make changes that are aligned with the project's objectives.

## 2. Development Workflow

We follow a standard GitHub workflow:

1.  **Fork the repository:** Create your own copy of the project.
2.  **Create a feature branch:** Branch off from the `main` branch for your changes (`git checkout -b feature/your-feature-name`).
3.  **Commit your changes:** Make your changes and commit them with clear, descriptive messages.
4.  **Push to your branch:** Push your changes to your fork.
5.  **Open a Pull Request (PR):** Submit a PR from your feature branch to the `main` branch of the original repository.

## 3. For AI Agents (e.g., Google's Jules)

AI agents are considered key contributors to this project. To ensure effective collaboration and human oversight, AI agents **must** follow this specific protocol:

### Step 1: Contextual Analysis
Before making any code modifications, ingest and analyze the latest versions of all documents in the `/docs` directory. This is essential for understanding the project's current state, goals, and technical architecture.

### Step 2: Code Implementation
Implement the requested changes, adhering to the existing coding style, patterns, and architectural design.

### Step 3: Changelog Documentation (Mandatory)
This is the most critical step for AI-driven contributions. After you have finalized your code changes, you **must** update the `CHANGELOG.md` file at the root of the project.

-   If the file doesn't exist, create it.
-   Add a new version heading (e.g., `## [0.2.0] - YYYY-MM-DD`).
-   Under this heading, add a bulleted list of the changes you made.
-   The descriptions should be clear, concise, and human-readable, explaining both *what* was changed and *why*.

**Example CHANGELOG Entry:**

```markdown
## [0.2.0] - 2024-08-15

### Added
- Implemented the "AI Storyboard" feature, allowing users to sequence video clips.
- Created new components: `StoryboardTimeline.tsx` and `TransitionEditor.tsx`.

### Fixed
- Resolved a bug where the `VRPlayer` would not exit gracefully on session end.
```

This changelog is the primary mechanism for human review of AI-generated code. Failure to provide a clear and accurate changelog will result in the pull request being rejected.

## 4. Code Quality
-   Write clean, readable, and maintainable TypeScript and React code.
-   Ensure the user interface remains responsive and accessible.
-   All new features should be robust and handle potential errors gracefully.
