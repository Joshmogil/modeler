# Tasks: 3D Repository Explorer

**Input**: Design documents from `/specs/001-3d-repo-explorer/`  
**Prerequisites**: plan.md, spec.md, constitution.md  
**Constitution**: All tasks must comply with local-first, privacy-first principles from `.specify/constitution.md`

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions
Based on plan.md: Web application structure
- Frontend: `frontend/src/`
- Tests: `tests/`
- Documentation: `docs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure - Constitutional compliance checkpoint

- [ ] T001 [P] Create project directory structure per plan.md (frontend/src/{core,entities,input,ui,layout,repository,utils,performance}/, tests/{unit,integration,e2e}/, docs/)
  - **AC**: All directories from plan.md exist and are empty
  - **AC**: README.md created with project description and setup instructions
  
- [ ] T002 Initialize TypeScript + Vite project in frontend/ with dependencies (Three.js, React, NodeGit/isomorphic-git)
  - **AC**: `npm install` runs successfully
  - **AC**: `npm run dev` starts development server
  - **AC**: All dependencies are constitution-compliant (no cloud services, no API keys required)
  
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json
  - **AC**: `strict: true` enabled in tsconfig.json
  - **AC**: All compiler options aligned with constitution quality standards
  
- [ ] T004 [P] Setup testing infrastructure (Vitest, Playwright, Testing Library)
  - **AC**: `npm run test:unit` runs Vitest
  - **AC**: `npm run test:e2e` runs Playwright
  - **AC**: Sample test passes in tests/unit/sample.test.ts
  
- [ ] T005 [P] Configure linting and formatting (ESLint, Prettier)
  - **AC**: `npm run lint` checks all TypeScript files
  - **AC**: `npm run format` formats code with Prettier
  - **AC**: Pre-commit hook configured (optional but recommended)
  
- [ ] T006 [P] Setup IndexedDB database schema for local caching
  - **AC**: Database schema defined in frontend/src/repository/DatabaseSchema.ts
  - **AC**: Schema includes tables for: repositories, file_nodes, directory_nodes, metrics, cache
  - **AC**: All storage is local-only (constitution compliance)

**Checkpoint**: Basic project structure complete, constitution-compliant ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create base TypeScript interfaces in frontend/src/types/index.ts
  - **AC**: Interfaces defined for: Repository, FileNode, DirectoryNode, GitMetrics, CodeMetrics, Vector3, WorldMap
  - **AC**: All interfaces properly exported and documented with JSDoc
  
- [ ] T008 Implement LanguageDetector utility in frontend/src/utils/LanguageDetector.ts
  - **AC**: Detects language from file extension (50+ languages)
  - **AC**: Returns language name and category (e.g., "Python", "programming")
  - **AC**: Unit tests cover common extensions (.js, .py, .go, .rs, .java, .md, etc.)
  
- [ ] T009 [P] Implement ColorPalette utility in frontend/src/utils/ColorPalette.ts
  - **AC**: Defines distinct colors for top 20 programming languages
  - **AC**: Provides fallback color for unknown languages
  - **AC**: Colors are accessible (sufficient contrast for visibility)
  
- [ ] T010 Setup Three.js scene in frontend/src/core/Renderer.ts
  - **AC**: WebGL renderer initialized with configurable quality settings
  - **AC**: Basic scene, camera, and lighting created
  - **AC**: Renders empty scene at 60 FPS
  - **AC**: Performance monitoring (FPS counter) integrated
  
- [ ] T011 Implement Camera controller base in frontend/src/core/Camera.ts
  - **AC**: Camera position and rotation properties defined
  - **AC**: Methods for setPosition, setRotation, lookAt implemented
  - **AC**: Camera update loop integrated with renderer
  
- [ ] T012 Create IndexedDB wrapper in frontend/src/repository/LocalDatabase.ts
  - **AC**: CRUD operations for all entity types (Repository, FileNode, DirectoryNode)
  - **AC**: Error handling for quota exceeded, corruption, etc.
  - **AC**: All operations return Promises
  - **AC**: Unit tests verify storage and retrieval

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Navigate Repository Structure in 3D Space (Priority: P1) 🎯 MVP

**Goal**: Users can load a local repository and navigate through it using first-person controls

**Independent Test**: Load a test repository, use WASD to move, mouse to look around, walk to any file

### Tests for User Story 1 (Write FIRST, ensure FAIL before implementation) ⚠️

- [ ] T013 [P] [US1] E2E test: Load repository and render 3D world in tests/e2e/navigation.spec.ts
  - **AC**: Test loads sample repository (10-20 files)
  - **AC**: Verifies 3D objects rendered for directories and files
  - **AC**: Test FAILS initially (no implementation yet)
  
- [ ] T014 [P] [US1] E2E test: WASD navigation in tests/e2e/navigation.spec.ts
  - **AC**: Test simulates WASD key presses
  - **AC**: Verifies camera position changes
  - **AC**: Test FAILS initially
  
- [ ] T015 [P] [US1] E2E test: Mouse look controls in tests/e2e/navigation.spec.ts
  - **AC**: Test simulates mouse movement
  - **AC**: Verifies camera rotation changes
  - **AC**: Test FAILS initially

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement FileSystemScanner in frontend/src/repository/FileSystemScanner.ts
  - **AC**: Scans local directory recursively (using File System Access API or Electron)
  - **AC**: Returns tree of FileNode and DirectoryNode objects
  - **AC**: Respects .gitignore patterns (excludes node_modules, .git, etc.)
  - **AC**: Unit tests verify scanning of test directory structure
  - **Story**: US1 - Required to load repository structure
  
- [ ] T017 [P] [US1] Implement MetricsCalculator in frontend/src/repository/MetricsCalculator.ts
  - **AC**: Calculates file size, line count for each FileNode
  - **AC**: Calculates aggregate metrics for DirectoryNode (total size, file count, max depth)
  - **AC**: Processes files in Web Worker for non-blocking performance
  - **AC**: Unit tests verify metric calculations
  - **Story**: US1 - Required for visual scaling
  
- [ ] T018 [US1] Implement GridLayout algorithm in frontend/src/layout/GridLayout.ts (depends on T016, T017)
  - **AC**: Positions FileNodes and DirectoryNodes in 3D grid
  - **AC**: Maintains parent-child spatial relationships
  - **AC**: Returns WorldMap with x,y,z coordinates for each node
  - **AC**: Unit tests verify layout spacing and positioning
  - **Story**: US1 - Converts file tree to 3D positions
  
- [ ] T019 [P] [US1] Create FileObject 3D entity in frontend/src/entities/FileObject.ts
  - **AC**: Creates Three.js Mesh (cube geometry) for a file
  - **AC**: Applies color based on language (via ColorPalette)
  - **AC**: Scales cube based on file size/line count
  - **AC**: Stores reference to FileNode data
  - **Story**: US1 - Visual representation of files
  
- [ ] T020 [P] [US1] Create DirectoryStructure 3D entity in frontend/src/entities/DirectoryStructure.ts
  - **AC**: Creates Three.js Group/Mesh for a directory
  - **AC**: Visual distinct from files (e.g., platform, building outline)
  - **AC**: Contains child FileObjects and DirectoryStructures
  - **AC**: Stores reference to DirectoryNode data
  - **Story**: US1 - Visual representation of folders
  
- [ ] T021 [US1] Implement World manager in frontend/src/core/World.ts (depends on T018, T019, T020)
  - **AC**: Loads repository data (from FileSystemScanner)
  - **AC**: Generates layout (via GridLayout)
  - **AC**: Creates 3D entities (FileObject, DirectoryStructure)
  - **AC**: Adds all entities to Three.js scene
  - **AC**: Integration test verifies world builds from sample repo
  - **Story**: US1 - Orchestrates world creation
  
- [ ] T022 [P] [US1] Implement KeyboardController in frontend/src/input/KeyboardController.ts
  - **AC**: Listens for WASD key events
  - **AC**: Calculates movement vector based on pressed keys
  - **AC**: Accounts for camera direction (W = forward in look direction)
  - **AC**: Unit tests verify movement calculations
  - **Story**: US1 - WASD movement
  
- [ ] T023 [P] [US1] Implement MouseController in frontend/src/input/MouseController.ts
  - **AC**: Listens for mouse move events (with pointer lock)
  - **AC**: Calculates rotation delta from mouse movement
  - **AC**: Applies rotation to camera (yaw/pitch)
  - **AC**: Clamps pitch to prevent camera flipping
  - **AC**: Unit tests verify rotation calculations
  - **Story**: US1 - Mouse look controls
  
- [ ] T024 [US1] Integrate movement and rotation in frontend/src/core/Camera.ts (depends on T022, T023)
  - **AC**: Update loop applies movement from KeyboardController
  - **AC**: Update loop applies rotation from MouseController
  - **AC**: Movement speed configurable (default: 5 units/sec)
  - **AC**: Smooth acceleration/deceleration applied
  - **AC**: Integration test verifies camera responds to input
  - **Story**: US1 - Complete first-person controls
  
- [ ] T025 [US1] Add collision detection in frontend/src/core/Camera.ts
  - **AC**: Camera cannot pass through DirectoryStructure boundaries
  - **AC**: Uses bounding box collision detection
  - **AC**: Sliding collision (if hitting wall at angle, slide along it)
  - **AC**: E2E test verifies cannot walk through walls
  - **Story**: US1 - Prevent walking through objects
  
- [ ] T026 [US1] Implement breadcrumb HUD in frontend/src/ui/HUD.tsx
  - **AC**: React component displays current directory path
  - **AC**: Updates as camera moves between directories
  - **AC**: Shows "root > folder1 > folder2" style path
  - **AC**: E2E test verifies breadcrumb updates
  - **Story**: US1 - Show current location

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently ✅
**Constitution Check**: All processing local? ✅ No external services? ✅ Offline-capable? ✅

---

## Phase 4: User Story 2 - Inspect Code Files as Interactive Objects (Priority: P1) 🎯 MVP

**Goal**: Users can click on files to view their contents and metadata

**Independent Test**: Click any file object, see panel with syntax-highlighted code and metadata

### Tests for User Story 2 (Write FIRST) ⚠️

- [ ] T027 [P] [US2] E2E test: Click file to open panel in tests/e2e/file-interaction.spec.ts
  - **AC**: Test clicks on a file object in 3D world
  - **AC**: Verifies file panel appears with content
  - **AC**: Test FAILS initially
  
- [ ] T028 [P] [US2] E2E test: Close file panel in tests/e2e/file-interaction.spec.ts
  - **AC**: Test presses ESC key
  - **AC**: Verifies panel disappears
  - **AC**: Test FAILS initially
  
- [ ] T029 [P] [US2] Unit test: File content loading in tests/unit/file-loader.test.ts
  - **AC**: Test loads sample file
  - **AC**: Verifies content matches expected text
  - **AC**: Test FAILS initially

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implement InteractionRaycast in frontend/src/input/InteractionRaycast.ts
  - **AC**: Performs raycast from camera through mouse position
  - **AC**: Returns intersected 3D objects (if any)
  - **AC**: Filters for FileObject entities only
  - **AC**: Unit tests verify raycast calculations
  - **Story**: US2 - Detect which file user clicked
  
- [ ] T031 [P] [US2] Implement file content loader in frontend/src/repository/FileContentLoader.ts
  - **AC**: Reads file contents from local file system
  - **AC**: Caches content in IndexedDB for quick re-access
  - **AC**: Handles large files (truncate if >1MB)
  - **AC**: Returns content as string
  - **AC**: Unit tests verify loading and caching
  - **Story**: US2 - Load file contents
  
- [ ] T032 [P] [US2] Implement SyntaxHighlighter in frontend/src/utils/SyntaxHighlighter.ts
  - **AC**: Uses highlight.js or Prism.js for syntax highlighting
  - **AC**: Supports top 20 languages (JS, Python, Go, Java, etc.)
  - **AC**: Returns highlighted HTML
  - **AC**: Unit tests verify highlighting for sample code
  - **Story**: US2 - Pretty code display
  
- [ ] T033 [US2] Create FilePanel React component in frontend/src/ui/FilePanel.tsx (depends on T031, T032)
  - **AC**: Displays file name, path, and metadata (size, lines, language, modified date)
  - **AC**: Displays syntax-highlighted file contents
  - **AC**: Scrollable content area
  - **AC**: Close button and ESC key handler
  - **AC**: Component tests verify rendering
  - **Story**: US2 - UI for file inspection
  
- [ ] T034 [US2] Integrate click handling in frontend/src/core/World.ts (depends on T030, T033)
  - **AC**: On mouse click, performs raycast
  - **AC**: If FileObject hit, loads file content
  - **AC**: Opens FilePanel with content
  - **AC**: ESC key closes panel
  - **AC**: Integration test verifies full click-to-view flow
  - **Story**: US2 - Complete file interaction
  
- [ ] T035 [US2] Add file metadata display in FilePanel
  - **AC**: Shows file size (formatted: KB, MB)
  - **AC**: Shows line count
  - **AC**: Shows detected language
  - **AC**: Shows last modified timestamp (formatted)
  - **AC**: E2E test verifies metadata displayed
  - **Story**: US2 - File information

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently ✅
**Constitution Check**: File contents stay local? ✅ No transmission? ✅

---

## Phase 5: User Story 3 - Visual Representation of Code Metrics (Priority: P2)

**Goal**: Visual size/scale indicates file/folder complexity

**Independent Test**: Load repository with varying file sizes, observe proportional scaling

### Tests for User Story 3 ⚠️

- [ ] T036 [P] [US3] Unit test: File scaling calculation in tests/unit/file-object.test.ts
  - **AC**: Test file with 100 lines vs 1000 lines
  - **AC**: Verifies 1000-line file is larger
  - **AC**: Test FAILS initially
  
- [ ] T037 [P] [US3] E2E test: Visual size differences in tests/e2e/visual-metrics.spec.ts
  - **AC**: Loads repository with small and large files
  - **AC**: Verifies bounding box sizes differ proportionally
  - **AC**: Test FAILS initially

### Implementation for User Story 3

- [ ] T038 [US3] Update FileObject to scale by metrics in frontend/src/entities/FileObject.ts
  - **AC**: Cube size scales based on FileNode.lineCount
  - **AC**: Configurable min/max size limits
  - **AC**: Logarithmic scaling option (for wide size ranges)
  - **AC**: Unit tests verify scaling calculations
  - **Story**: US3 - Size represents complexity
  
- [ ] T039 [US3] Update DirectoryStructure to scale by metrics in frontend/src/entities/DirectoryStructure.ts
  - **AC**: Height/size scales based on total files or max depth
  - **AC**: Visual clearly distinguishes small vs large directories
  - **AC**: Unit tests verify scaling
  - **Story**: US3 - Folder size indicates contents
  
- [ ] T040 [P] [US3] Create tooltip system in frontend/src/ui/Tooltip.tsx
  - **AC**: React component shows tooltip near mouse
  - **AC**: Displays on hover over FileObject or DirectoryStructure
  - **AC**: Shows name, size, lines, and other metrics
  - **AC**: Hides when mouse moves away
  - **AC**: Component tests verify display
  - **Story**: US3 - Show exact metrics on hover
  
- [ ] T041 [US3] Integrate hover detection in frontend/src/input/InteractionRaycast.ts
  - **AC**: Separate raycast for hover (non-click)
  - **AC**: Triggers on mouse move (throttled for performance)
  - **AC**: Returns hovered object and position
  - **AC**: Integration test verifies hover detection
  - **Story**: US3 - Detect hover for tooltips

**Checkpoint**: Visual metrics working independently ✅

---

## Phase 6: User Story 4 - Color-Coded Language Visualization (Priority: P2)

**Goal**: Different languages have distinct colors

**Independent Test**: Load multi-language repo, observe different colors

### Tests for User Story 4 ⚠️

- [ ] T042 [P] [US4] E2E test: Language colors in tests/e2e/visual-metrics.spec.ts
  - **AC**: Loads repository with .py, .js, .go files
  - **AC**: Verifies each has different color material
  - **AC**: Test FAILS initially

### Implementation for User Story 4

- [ ] T043 [US4] Update FileObject color assignment in frontend/src/entities/FileObject.ts
  - **AC**: Gets color from ColorPalette based on detected language
  - **AC**: Applies color to cube material
  - **AC**: Visual test verifies distinct colors
  - **Story**: US4 - Language-based coloring
  
- [ ] T044 [P] [US4] Create language legend UI in frontend/src/ui/LanguageLegend.tsx
  - **AC**: React component shows color-to-language mapping
  - **AC**: Lists all languages present in current repository
  - **AC**: Can be toggled on/off
  - **AC**: Component tests verify rendering
  - **Story**: US4 - Show color key
  
- [ ] T045 [US4] Add language to hover tooltip
  - **AC**: Tooltip explicitly states detected language
  - **AC**: E2E test verifies language shown on hover
  - **Story**: US4 - Confirm language visually

**Checkpoint**: Language visualization working ✅

---

## Phase 7: User Story 5 - Search and Teleport to Files (Priority: P2)

**Goal**: Quickly find and jump to specific files

**Independent Test**: Search for filename, teleport to it in 3D world

### Tests for User Story 5 ⚠️

- [ ] T046 [P] [US5] E2E test: File search in tests/e2e/search.spec.ts
  - **AC**: Opens search dialog (Ctrl+F)
  - **AC**: Types filename
  - **AC**: Verifies results appear
  - **AC**: Test FAILS initially
  
- [ ] T047 [P] [US5] E2E test: Teleport to file in tests/e2e/search.spec.ts
  - **AC**: Selects search result
  - **AC**: Verifies camera moves to file location
  - **AC**: Verifies file is highlighted
  - **AC**: Test FAILS initially

### Implementation for User Story 5

- [ ] T048 [P] [US5] Implement search indexer in frontend/src/repository/SearchIndex.ts
  - **AC**: Builds index of all file names and paths
  - **AC**: Supports fuzzy search (typo tolerance)
  - **AC**: Returns results sorted by relevance
  - **AC**: Unit tests verify search accuracy
  - **Story**: US5 - Find files by name
  
- [ ] T049 [P] [US5] Create SearchBar UI in frontend/src/ui/SearchBar.tsx
  - **AC**: Input field with Ctrl+F keyboard shortcut
  - **AC**: Real-time search results as user types
  - **AC**: Keyboard navigation (up/down arrows, Enter)
  - **AC**: ESC closes search
  - **AC**: Component tests verify interactions
  - **Story**: US5 - Search interface
  
- [ ] T050 [US5] Implement camera teleport in frontend/src/core/Camera.ts
  - **AC**: Smoothly interpolates camera from current to target position
  - **AC**: Animation duration ~1 second
  - **AC**: Easing function for smooth motion
  - **AC**: Unit tests verify interpolation
  - **Story**: US5 - Move to target
  
- [ ] T051 [US5] Add file highlighting effect in frontend/src/entities/FileObject.ts
  - **AC**: Teleport target glows or pulses
  - **AC**: Highlight lasts 3-5 seconds then fades
  - **AC**: Visual distinct from normal files
  - **AC**: Visual test verifies effect
  - **Story**: US5 - Draw attention to target
  
- [ ] T052 [US5] Integrate search with teleport in frontend/src/core/World.ts (depends on T048, T049, T050, T051)
  - **AC**: Selecting search result triggers teleport
  - **AC**: Camera moves to file location
  - **AC**: File highlighted after arrival
  - **AC**: Integration test verifies full flow
  - **Story**: US5 - Complete search-to-teleport

**Checkpoint**: Search and navigation working ✅

---

## Phase 8: User Story 6 - Git History Visualization (Priority: P3)

**Goal**: Recently modified files visually indicated

**Independent Test**: Load repository, enable recent changes view, observe glowing files

### Tests for User Story 6 ⚠️

- [ ] T053 [P] [US6] Unit test: Git history parsing in tests/unit/git-analyzer.test.ts
  - **AC**: Parses sample git repository
  - **AC**: Extracts commit timestamps per file
  - **AC**: Test FAILS initially

### Implementation for User Story 6

- [ ] T054 [P] [US6] Implement GitAnalyzer in frontend/src/repository/GitAnalyzer.ts
  - **AC**: Uses NodeGit or isomorphic-git to parse local .git folder
  - **AC**: Extracts commit history per file (last modified timestamp, commit count)
  - **AC**: Processes in Web Worker for performance
  - **AC**: Gracefully handles missing/corrupt .git folder
  - **AC**: Unit tests verify parsing
  - **Story**: US6 - Extract git data locally
  - **Constitution**: Local-only, no git remote access
  
- [ ] T055 [US6] Add recency visualization to FileObject in frontend/src/entities/FileObject.ts
  - **AC**: Files modified <24h have bright glow/emission
  - **AC**: Files modified <7d have dim glow
  - **AC**: Files modified >30d have no glow
  - **AC**: Glow intensity scales with recency
  - **AC**: Visual test verifies effect
  - **Story**: US6 - Show recent activity
  
- [ ] T056 [P] [US6] Create commit history display in FilePanel in frontend/src/ui/FilePanel.tsx
  - **AC**: Shows timeline of recent commits (last 10)
  - **AC**: Each commit shows: hash, date, message, author
  - **AC**: Component tests verify rendering
  - **Story**: US6 - Show git history details
  
- [ ] T057 [P] [US6] Add heat map mode toggle in frontend/src/ui/HUD.tsx
  - **AC**: Button or toggle to enable "commit heat map"
  - **AC**: Changes file colors: red = frequently modified, blue = stable
  - **AC**: E2E test verifies mode toggle
  - **Story**: US6 - Alternative visualization mode

**Checkpoint**: Git history visualization working ✅
**Constitution Check**: Git parsed locally? ✅ No remote access? ✅

---

## Phase 9: Performance Optimization & Polish

**Purpose**: Ensure constitutional performance standards met

- [ ] T058 [P] Implement LOD (Level of Detail) in frontend/src/performance/LODManager.ts
  - **AC**: Distant objects use simplified geometry (fewer polygons)
  - **AC**: 3 LOD levels: high (near), medium (mid), low (far)
  - **AC**: Automatically switches based on camera distance
  - **AC**: Performance test shows FPS improvement
  - **Constitution**: Must achieve 60 FPS on mid-range hardware
  
- [ ] T059 [P] Implement frustum culling in frontend/src/performance/FrustumCuller.ts
  - **AC**: Objects outside camera view are not rendered
  - **AC**: Uses Three.js frustum culling or custom implementation
  - **AC**: Performance test shows reduced draw calls
  
- [ ] T060 [P] Implement instanced rendering in frontend/src/performance/InstanceManager.ts
  - **AC**: Identical FileObjects use instanced meshes
  - **AC**: Reduces draw calls for repeated geometries
  - **AC**: Performance test shows memory reduction
  
- [ ] T061 Add performance settings UI in frontend/src/ui/SettingsPanel.tsx
  - **AC**: Quality presets: Low, Medium, High, Ultra
  - **AC**: Settings persist in localStorage (constitution-compliant)
  - **AC**: Settings affect: shadow quality, LOD distance, post-processing
  - **AC**: E2E test verifies settings apply
  
- [ ] T062 [P] Add minimap in frontend/src/ui/Minimap.tsx
  - **AC**: React component shows top-down view of world
  - **AC**: Player position indicated
  - **AC**: Click minimap to teleport
  - **AC**: Component tests verify rendering
  
- [ ] T063 [P] Add accessibility features
  - **AC**: Keyboard-only navigation possible (tab through UI)
  - **AC**: Screen reader announcements for major actions
  - **AC**: Motion sensitivity option (reduce camera smoothing)
  - **AC**: High contrast mode option
  - **Constitution**: Accessibility required
  
- [ ] T064 Performance testing with large repositories in tests/performance/large-repo.test.ts
  - **AC**: Test with 1K, 10K, 50K file repositories
  - **AC**: Measure load time, FPS, memory usage
  - **AC**: Verify constitution performance standards met
  - **AC**: Document performance characteristics

**Checkpoint**: Performance optimization complete, constitution standards verified ✅

---

## Phase 10: Documentation & Final Polish

**Purpose**: Production-ready release

- [ ] T065 [P] Write user guide in docs/user-guide.md
  - **AC**: Getting started section (download, open, load repo)
  - **AC**: Controls reference (WASD, mouse, keyboard shortcuts)
  - **AC**: Features walkthrough with screenshots
  - **AC**: Troubleshooting common issues
  
- [ ] T066 [P] Write architecture documentation in docs/architecture.md
  - **AC**: System overview diagram
  - **AC**: Component descriptions
  - **AC**: Data flow diagrams
  - **AC**: Performance considerations
  - **AC**: Constitution compliance documented
  
- [ ] T067 [P] Create demo video/GIF
  - **AC**: 30-60 second walkthrough
  - **AC**: Shows: loading repo, navigating, inspecting file, searching
  - **AC**: Embedded in README.md
  
- [ ] T068 [P] Add comprehensive README.md
  - **AC**: Project description and value proposition
  - **AC**: Installation instructions (npm install, run)
  - **AC**: Quick start guide
  - **AC**: Links to documentation
  - **AC**: Constitution principles highlighted (local-first, privacy)
  - **AC**: Demo video/screenshots
  
- [ ] T069 Final constitution compliance audit
  - **AC**: Verify no external API calls in production code
  - **AC**: Verify all storage is local (IndexedDB, localStorage)
  - **AC**: Verify no telemetry or tracking
  - **AC**: Verify offline-first functionality
  - **AC**: Document any exceptions (if any)
  
- [ ] T070 [P] Create quickstart validation script
  - **AC**: Script verifies README instructions work
  - **AC**: Tests: clone, install, run, open sample repo
  - **AC**: Fails if any step doesn't work
  - **AC**: Constitution: User productive in <2 minutes

**Checkpoint**: Production-ready release ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational completion
  - US1 (P1) → US2 (P1): Sequential or parallel
  - US3-US5 (P2): Can start after Foundational
  - US6 (P3): Can start after Foundational
- **Performance (Phase 9)**: After core features complete
- **Documentation (Phase 10)**: After all features complete

### User Story Dependencies

- **US1 (Navigate)**: Foundation only - no other story dependencies
- **US2 (Inspect)**: Depends on US1 for navigation to files
- **US3 (Metrics)**: Enhances US1 - can run in parallel
- **US4 (Colors)**: Enhances US1 - can run in parallel
- **US5 (Search)**: Depends on US1 for world existence
- **US6 (Git)**: Independent - can run in parallel

### Critical Path (MVP)

```
Phase 1 (Setup) →
Phase 2 (Foundation) →
Phase 3 (US1 - Navigate) →
Phase 4 (US2 - Inspect) →
Phase 10 (Documentation) →
MVP RELEASE
```

### Parallel Opportunities

**After Phase 2 completes**:
- Developer A: US1 (Navigate)
- Developer B: US3 (Metrics)
- Developer C: US4 (Colors)

**After US1 completes**:
- Developer A: US2 (Inspect)
- Developer B: US5 (Search)
- Developer C: US6 (Git)

**Tasks marked [P]** within same phase can run in parallel (different files)

---

## Implementation Strategy

### MVP First (Minimal Viable Product)

**Goal**: Deliver core value ASAP

1. Phase 1: Setup (1-2 days)
2. Phase 2: Foundation (2-3 days)
3. Phase 3: US1 - Navigate (3-4 days)
4. Phase 4: US2 - Inspect (2-3 days)
5. Phase 10: Basic docs (1 day)

**Total MVP**: ~2 weeks

**Deliverable**: Users can load a repo, walk around, and inspect files. Core value demonstrated.

### Incremental Delivery

After MVP:
1. Add US3 (Metrics) → Visual analysis capability
2. Add US4 (Colors) → Better language identification
3. Add US5 (Search) → Practical navigation
4. Add US6 (Git) → Temporal insights
5. Phase 9 (Performance) → Scale to larger repos
6. Full documentation

Each addition provides incremental value.

### Constitution Checkpoints

**After each phase**, verify:
- ✅ All processing local?
- ✅ No external services?
- ✅ No API keys required?
- ✅ Offline-functional?
- ✅ Privacy preserved?
- ✅ Performance standards met?

**Fail any checkpoint** → Fix before proceeding

---

## Testing Strategy

### Test-First Mandate (Constitution)

**TDD Cycle for EVERY feature**:
1. Write test (should fail)
2. Verify test FAILS
3. Write minimum code to pass
4. Verify test PASSES
5. Refactor
6. Commit with signed commit

### Test Coverage Requirements

- **Unit tests**: 80%+ coverage (constitution standard)
- **Integration tests**: All major workflows
- **E2E tests**: Each user story acceptance scenario
- **Performance tests**: FPS, load time, memory

### Local Testing Only

- All tests run offline (constitution)
- No network mocking (nothing to mock)
- Use sample repository in tests/fixtures/

---

## Constitution Compliance Summary

**Local-First** ✅
- All tasks use IndexedDB, localStorage, local file system
- No cloud services (T002 explicitly checks dependencies)
- Offline-first (T069 audits this)

**Zero Sign-Up** ✅
- No authentication tasks
- No API key configuration
- No user accounts

**Simple Tools** ✅
- SQLite replaced with IndexedDB (browser built-in)
- Three.js (WebGL, browser native)
- No complex database servers

**Privacy** ✅
- File contents never transmitted (T069 verifies)
- Git analysis local-only (T054)
- No telemetry tasks

**Performance** ✅
- 60 FPS targets (T064 tests this)
- Load time requirements (T064)
- Memory limits (T064)

**Test-First** ✅
- All user stories have tests written first (T013-T015, T027-T029, etc.)
- Tests marked to FAIL initially

**Signed Commits** ✅
- Constitution requires `git commit -s`
- Documented in T005 pre-commit hook setup

---

## Notes

- All tasks include acceptance criteria (constitution requirement)
- Each task references user story for traceability
- [P] tasks can parallelize (different files)
- Constitution checkpoints after each phase
- MVP can ship after Phase 4
- Tests MUST be written and failing before implementation
- No external dependencies that violate constitution
- All data stays local, all processing offline

**Total Estimated Tasks**: 70 tasks
**MVP Tasks**: ~25 tasks (Phases 1-4 + minimal docs)
**Estimated MVP Duration**: 2 weeks (single developer)
**Full Feature Set**: 6-8 weeks (single developer)
