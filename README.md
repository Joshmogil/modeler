# Modeler - 3D Repository Explorer

**Explore your codebase like Minecraft for code**

A local-first, privacy-focused 3D visualization tool for navigating git repositories. Walk through your code as an immersive 3D world where directories are buildings, files are blocks, and code relationships are visualized as animated connections.

## Demo

[![Modeler Demo](https://img.youtube.com/vi/9deeJ5VChbY/0.jpg)](https://www.youtube.com/watch?v=9deeJ5VChbY)

## 🎯 Core Principles

- **🔒 Local-First**: All processing happens on your machine. Your code never leaves your computer.
- **🚫 Zero Sign-Up**: No accounts, no API keys, no configuration. Download and run.
- **🛠️ Simple Tools**: Uses only standard browser APIs and embedded databases. No external services.
- **🔐 Privacy-First**: No telemetry, no tracking, no data transmission.
- **⚡ Offline-Capable**: Works completely offline. Internet not required.

## Features

### Current (MVP)
- 🌍 **3D World Navigation**: Walk through your repository using first-person controls (WASD + mouse)
- 📁 **Visual File Structure**: Directories and files laid out in organized grids with clear labels
- 🔍 **Code Inspection**: Click any file to view syntax-highlighted contents
- 🎨 **Language Colors**: Different programming languages have distinct visual colors
- 📊 **Size Visualization**: File and folder sizes represented by block dimensions
- 🔗 **Multi-Language Code Analysis**: Automatic detection of imports, dependencies, and relationships across:
  - **TypeScript/JavaScript**: ES6 imports, CommonJS requires, dynamic imports
  - **Python**: Standard imports, `from...import`, relative imports, aliases (`import numpy as np`)
  - **Java**: Package imports, static imports
  - **Swift**: Type usage detection (classes, structs, protocols across files)
  - **Go**: Package imports, multi-line import blocks
  - **C/C++**: `#include` directives (both local and system)
  - **Rust**: `use` and `mod` declarations
- ✨ **Animated Relationships**: 3D connections between related files with flowing particles
- 🏷️ **Text Labels**: Every file and directory clearly labeled in 3D space
- ⚡ **Optimized Layout**: Flat layout algorithm with reduced spacing for easy navigation

### Coming Soon
- 🔎 Search and teleport to files
- 📈 Git history visualization (recent changes glow)
- 🗺️ Minimap and overview mode
- 🎮 VR support

## Quick Start

### Prerequisites
- Node.js 20+ 
- Modern browser (Chrome, Firefox, Safari, or Edge)
- A local repository to visualize

### Installation

```bash
# Clone the repository
git clone https://github.com/Joshmogil/modeler.git
cd modeler

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:5173` and select a local folder to explore.

## Controls

### Movement
- **W**: Move forward
- **S**: Move backward
- **A**: Strafe left
- **D**: Strafe right
- **Space**: Move up
- **Shift**: Move down
- **Mouse**: Look around (click to lock cursor, ESC to unlock)

### Features
- **Left Click**: Select file/directory, view code
- **Show/Hide Links Button**: Toggle relationship visualization

## Architecture

Built with privacy and simplicity in mind:

- **Frontend**: TypeScript + Three.js + React + Vite
- **3D Rendering**: Custom world builder with flat layout algorithm
- **Code Analysis**: Multi-language import detection and relationship mapping
- **Storage**: Browser IndexedDB (local caching)
- **Testing**: Vitest (unit) + Playwright (E2E)

### Project Structure

```
modeler/
├── frontend/src/
│   ├── core/         # 3D engine, renderer, camera
│   ├── entities/     # 3D objects (files, directories)
│   ├── input/        # Keyboard, mouse, interaction
│   ├── ui/           # React UI components
│   ├── world/        # WorldBuilder, RelationshipVisualizer
│   ├── analysis/     # CodeAnalyzer (multi-language)
│   ├── repository/   # FileSystemScanner, file loading
│   ├── utils/        # Language detection, highlighting
│   └── performance/  # LOD, culling, optimization
├── tests/            # Unit, integration, E2E tests
├── docs/             # Documentation
└── specs/            # Feature specifications
```

### Key Components

#### WorldBuilder (`src/world/WorldBuilder.ts`)
- Builds 3D scene from file system structure
- Flat layout algorithm groups files by parent directory
- Creates canvas-based text labels for all objects
- Optimized spacing (2 units between files, 4 between directories)

#### CodeAnalyzer (`src/analysis/CodeAnalyzer.ts`)
- Detects imports and relationships across 9+ languages
- Handles complex patterns:
  - Python: `import X as Y`, `from . import relative`, multi-line imports
  - Swift: Type definition and usage across files (no explicit imports)
  - Go: Multi-line import blocks with parentheses
  - Rust: `use` paths and `mod` declarations
- Resolves module names to actual file paths

#### RelationshipVisualizer (`src/world/RelationshipVisualizer.ts`)
- Renders animated 3D connections between related files
- Curved bezier lines with flowing particle animations
- Color-coded by relationship type:
  - 🟢 Green: Import relationships
  - 🔵 Blue: Export relationships
  - 🟠 Orange: Function calls
  - 🟣 Magenta: Variable references

#### FileSystemScanner (`src/repository/FileSystemScanner.ts`)
- Scans file system using File API
- Loads file content for text files (20+ supported extensions)
- Handles both modern browsers and Safari compatibility

## Use Cases

### 1. Onboarding New Developers
Navigate an unfamiliar codebase spatially, see how files connect, understand project structure at a glance.

### 2. Refactoring Planning
Visualize dependencies before making changes. See which files will be affected by modifications.

### 3. Architecture Review
Review project organization in 3D. Identify tightly coupled components, spot circular dependencies.

### 4. Code Exploration
Walk through large repositories, explore directories like rooms in a building, jump between related files.

### 5. Teaching & Presentations
Demonstrate code structure in meetings, create visual walkthroughs for documentation.

## Constitution

This project follows a strict [constitution](.specify/constitution.md) that ensures:

1. **Local-First Architecture**: All data stays on your machine
2. **Zero External Dependencies**: No cloud services, APIs, or sign-ups
3. **Simple, Universal Tools**: SQLite/IndexedDB, standard libraries only
4. **Privacy & Security First**: No tracking, no telemetry, no data transmission
5. **Test-First Development**: TDD with 80%+ coverage
6. **Signed Commits**: All commits use `git commit -s`

## Contributing

Contributions welcome! Please ensure:

- All commits are signed (`git commit -s`)
- Tests written before implementation (TDD)
- Constitution compliance (no external services, local-only processing)
- Follow conventional commits format

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Roadmap

See [specs/001-3d-repo-explorer/](./specs/001-3d-repo-explorer/) for detailed specifications and implementation plan.

**Current Status**: 🚧 MVP Development - Phase 4 Complete (Multi-Language Code Analysis)

---

**Built with ❤️ for developers who love spatial thinking**
