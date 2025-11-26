# Implementation Plan: 3D Repository Explorer

**Branch**: `001-3d-repo-explorer` | **Date**: November 26, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-3d-repo-explorer/spec.md`

## Summary

Build a 3D spatial visualization application for exploring git repositories, where users navigate through code structures using first-person controls similar to Minecraft. Files appear as interactive 3D objects, directories as buildings/structures, with visual encoding of metrics (size, language, recency). Core technical approach: Web-based using Three.js for rendering, Node.js for repository analysis, with spatial layout algorithms transforming file trees into navigable 3D worlds.

## Technical Context

**Language/Version**: TypeScript 5.3, Node.js 20.x  
**Primary Dependencies**: Three.js (3D rendering), NodeGit (git integration), Tree-sitter (code parsing), Vite (build tool), React (UI overlays)  
**Storage**: IndexedDB for caching repository metadata and file contents, file system access for local repo reading  
**Testing**: Vitest (unit), Playwright (E2E), visual regression testing for 3D rendering  
**Target Platform**: Web (Chrome/Firefox/Safari latest), packaged as Electron app for desktop  
**Project Type**: Web application (frontend + local backend via Electron IPC)  
**Performance Goals**: 60 FPS rendering, <10s load time for 2000-file repos, <5GB memory for 10K-file repos, <100ms search response  
**Constraints**: Must work offline (local processing only), <200ms interaction latency, support repos up to 100K files, accessible via keyboard-only navigation  
**Scale/Scope**: Support 10K files smoothly (target), 100K files maximum (with degraded performance), 50+ programming languages, 10+ visualization modes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Architecture Principles
- ✅ Separation of concerns: Rendering layer (Three.js) separate from data layer (repository analysis) separate from interaction layer (React UI)
- ✅ Single responsibility: Each module handles one aspect (git parsing, spatial layout, rendering, input handling)
- ✅ Performance-first: LOD, culling, instancing, lazy loading designed in from start

### Code Quality Gates  
- ✅ Type safety: Full TypeScript with strict mode
- ✅ Testing: Unit tests for layout algorithms, integration tests for git parsing, E2E tests for navigation
- ✅ Documentation: Architecture docs, API documentation, user guide

### User Experience Requirements
- ✅ Performance: 60 FPS target defined
- ✅ Accessibility: Keyboard navigation, screen reader support for UI elements, motion sensitivity options
- ✅ Error handling: Graceful degradation for large repos, clear error messages

### Security/Privacy
- ✅ Local-first: All processing happens client-side, no data sent to servers
- ✅ No telemetry in MVP (add opt-in later)

### Complexity Budget
- **Estimated complexity**: High (8/10) - 3D rendering + git integration + spatial algorithms
- **Justification**: Core value proposition requires complexity; mitigate with phased delivery and proven libraries
- **Risk mitigation**: Use established rendering engine (Three.js), limit MVP scope to P1 user stories

## Project Structure

### Documentation (this feature)

```
specs/001-3d-repo-explorer/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (data structures)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── rendering-api.md
│   ├── repository-api.md
│   └── spatial-layout-api.md
└── tasks.md             # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```
modeler/
├── frontend/
│   ├── src/
│   │   ├── core/              # Core 3D engine
│   │   │   ├── World.ts       # Main 3D world manager
│   │   │   ├── Camera.ts      # First-person camera controller
│   │   │   ├── Renderer.ts    # Three.js renderer wrapper
│   │   │   └── SceneGraph.ts  # Scene hierarchy management
│   │   ├── entities/          # 3D object representations
│   │   │   ├── FileObject.ts  # 3D representation of files
│   │   │   ├── DirectoryStructure.ts  # 3D buildings for folders
│   │   │   └── WorldGrid.ts   # Spatial layout grid
│   │   ├── input/             # User input handling
│   │   │   ├── KeyboardController.ts
│   │   │   ├── MouseController.ts
│   │   │   └── InteractionRaycast.ts
│   │   ├── ui/                # React UI components
│   │   │   ├── FilePanel.tsx  # File content viewer
│   │   │   ├── SearchBar.tsx  # Search interface
│   │   │   ├── Minimap.tsx    # Overview map
│   │   │   └── HUD.tsx        # Heads-up display
│   │   ├── layout/            # Spatial layout algorithms
│   │   │   ├── TreemapLayout.ts
│   │   │   ├── GridLayout.ts
│   │   │   └── LayoutEngine.ts
│   │   ├── repository/        # Repository data handling
│   │   │   ├── RepositoryLoader.ts
│   │   │   ├── GitAnalyzer.ts
│   │   │   ├── FileSystemScanner.ts
│   │   │   └── MetricsCalculator.ts
│   │   ├── utils/             # Shared utilities
│   │   │   ├── LanguageDetector.ts
│   │   │   ├── SyntaxHighlighter.ts
│   │   │   └── ColorPalette.ts
│   │   ├── performance/       # Optimization
│   │   │   ├── LODManager.ts  # Level of detail
│   │   │   ├── FrustumCuller.ts
│   │   │   └── InstanceManager.ts
│   │   └── main.ts            # Application entry point
│   ├── public/
│   │   └── assets/            # 3D models, textures
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                   # Electron main process (if desktop)
│   ├── src/
│   │   ├── main.ts            # Electron entry
│   │   └── ipc/               # IPC handlers
│   └── package.json
├── tests/
│   ├── unit/                  # Unit tests
│   │   ├── layout.test.ts
│   │   ├── git-analyzer.test.ts
│   │   └── metrics.test.ts
│   ├── integration/           # Integration tests
│   │   ├── repository-loading.test.ts
│   │   └── rendering-pipeline.test.ts
│   └── e2e/                   # End-to-end tests
│       ├── navigation.spec.ts
│       ├── file-interaction.spec.ts
│       └── search.spec.ts
├── docs/
│   ├── architecture.md        # System architecture
│   ├── api/                   # API documentation
│   └── user-guide.md          # User manual
├── package.json               # Root package.json
└── README.md
```

**Structure Decision**: Web application architecture selected for maximum accessibility and rapid development. Frontend uses Vite + TypeScript + Three.js for 3D rendering with React for UI overlays. Optional Electron wrapper for desktop distribution adds backend/ with IPC for file system access (beyond web security limits). All repository analysis happens client-side in frontend or via Electron IPC, ensuring privacy and offline capability.

## Complexity Tracking

**Justified Complexity**:

1. **3D Rendering Engine (High Complexity)**
   - **Why necessary**: Core differentiator - spatial visualization is the entire value proposition
   - **Mitigation**: Use proven library (Three.js) rather than building from scratch
   - **Team requirement**: Need 3D graphics expertise or dedicated learning time

2. **Spatial Layout Algorithms (Medium-High Complexity)**
   - **Why necessary**: Transforming arbitrary file trees into intuitive 3D spaces is non-trivial
   - **Mitigation**: Start with simple grid layout, iterate to treemap if needed
   - **Validation**: Can prototype with simple algorithm first

3. **Performance Optimization (High Complexity)**
   - **Why necessary**: Real-time 3D rendering of potentially 100K objects demands optimization
   - **Mitigation**: Phase 1 focuses on small repos (<1K files), add optimizations in Phase 2+
   - **Monitoring**: Set clear performance budgets and measure continuously

**Complexity Budget Status**: 8/10 used - at upper limit. Recommend aggressive scope control and phased delivery.

## Development Phases

### Phase 0: Research & Validation (Week 1)
**Output**: `research.md` documenting findings

**Research Questions**:
1. **Three.js Capabilities**: Can Three.js handle 10K+ instanced objects at 60 FPS?
   - Prototype: Create test scene with 10K cubes, measure FPS
   - Decision point: If <30 FPS, consider Unity or Godot instead

2. **Git Integration**: What's the best library for git history analysis in Node.js?
   - Evaluate: NodeGit vs simple-git vs isomorphic-git
   - Test: Clone test repo, extract commit history, measure performance

3. **Spatial Layout**: Which algorithm produces most intuitive file organization?
   - Prototype: Implement simple grid, treemap, and force-directed layouts
   - User test: Show 5 users same repo in different layouts, measure comprehension

4. **File System Access**: Web vs Electron for local repository access?
   - Decision: If web File System Access API sufficient, avoid Electron complexity
   - Fallback: Electron if need deeper git integration

**Deliverables**:
- Technical spikes for each research question
- Performance benchmarks
- Technology stack recommendation
- Risk assessment update

### Phase 1: Design & Contracts (Week 2)
**Output**: `data-model.md`, `quickstart.md`, `contracts/`

**Data Model Design**:
- Define core data structures: Repository, FileNode, DirectoryNode, Camera, WorldMap
- Design spatial index structure (octree vs quadtree)
- Cache strategy for file contents and metrics
- State management architecture

**API Contracts**:
1. **Repository API** (`contracts/repository-api.md`)
   - `loadRepository(path: string): Promise<Repository>`
   - `scanFileSystem(root: string): FileNode[]`
   - `analyzeGitHistory(repo: Repository): GitMetrics`
   - `calculateMetrics(node: FileNode): CodeMetrics`

2. **Spatial Layout API** (`contracts/spatial-layout-api.md`)
   - `generateLayout(rootNode: DirectoryNode): WorldMap`
   - `positionNode(node: Node, parent: Node): Vector3`
   - `optimizeLayout(map: WorldMap): void`

3. **Rendering API** (`contracts/rendering-api.md`)
   - `initializeScene(): Scene`
   - `renderFileObject(node: FileNode): Object3D`
   - `renderDirectoryStructure(node: DirectoryNode): Object3D`
   - `updateCamera(delta: number): void`
   - `performRaycast(screenPos: Vector2): Intersection[]`

**Quickstart Guide**:
- Development environment setup
- Project structure explanation
- Build and run instructions
- Testing strategy

### Phase 2: MVP Implementation - Core Navigation (Weeks 3-4)
**Focus**: P1 User Stories 1-2 (Navigate + Inspect)

**Implementation Tasks**:
1. **Project Setup**
   - Initialize Vite + TypeScript + Three.js project
   - Configure build pipeline and dev server
   - Set up testing infrastructure (Vitest + Playwright)

2. **Repository Loading**
   - Implement FileSystemScanner to read directory structure
   - Build FileNode/DirectoryNode tree from file system
   - Calculate basic metrics (file size, line count)
   - Add language detection (file extension based initially)

3. **3D World Generation**
   - Implement simple grid-based spatial layout
   - Create basic cube geometry for files
   - Create platform/box geometry for directories
   - Position objects in 3D space based on layout

4. **Camera & Navigation**
   - Implement first-person camera controller
   - Add WASD movement with collision detection
   - Mouse look controls
   - Smooth movement and acceleration

5. **File Interaction**
   - Implement raycast-based selection
   - Create file panel UI (React component)
   - Load and display file contents with syntax highlighting
   - Show file metadata (size, lines, language)

**Success Criteria**:
- Can load a 100-file repo in <5 seconds
- Navigate smoothly at 60 FPS
- Click any file to view its contents
- No crashes or freezes

### Phase 3: Visual Enhancements (Week 5)
**Focus**: P2 User Stories 3-4 (Metrics + Colors)

**Implementation Tasks**:
1. **Size-Based Visualization**
   - Scale file objects by line count or file size
   - Scale directory structures by complexity
   - Add configurable scale factors

2. **Language Color Coding**
   - Create color palette for top 20 languages
   - Apply materials/colors based on language
   - Add legend/key in UI

3. **Improved Visual Design**
   - Better lighting and shadows
   - Texture application
   - Particle effects for accent
   - Post-processing (bloom, ambient occlusion)

4. **HUD & Information Display**
   - Current location breadcrumbs
   - FPS counter and performance stats
   - Hover tooltips for quick info

**Success Criteria**:
- Visual representation clearly communicates file importance
- Can identify languages at a glance
- World feels cohesive and aesthetically pleasing

### Phase 4: Advanced Navigation (Week 6)
**Focus**: P2 User Story 5 (Search & Teleport)

**Implementation Tasks**:
1. **Search Infrastructure**
   - Build search index (file names, paths, symbols)
   - Implement fuzzy search algorithm
   - Create search UI component

2. **Teleport System**
   - Smooth camera interpolation to target
   - Target highlighting/glow effect
   - Breadcrumb trail showing teleport history

3. **Minimap**
   - Render top-down view of world
   - Show player position
   - Click-to-teleport from minimap

4. **Performance Optimization Round 1**
   - Implement frustum culling
   - Add LOD system (reduce geometry for distant objects)
   - Instance rendering for repeated objects

**Success Criteria**:
- Find and teleport to any file in <5 seconds
- Minimap provides useful overview
- Performance still 60 FPS in 1000-file repos

### Phase 5: Git Integration (Week 7)
**Focus**: P3 User Story 6 (Git History)

**Implementation Tasks**:
1. **Git Analysis**
   - Integrate NodeGit or chosen git library
   - Extract commit history per file
   - Calculate recency and change frequency

2. **Temporal Visualization**
   - Add glow/emission to recently changed files
   - Implement time-based color gradients
   - Create commit heat map mode

3. **Git History UI**
   - Show commit timeline in file panel
   - Display commit messages and authors
   - Link to diffs (if possible)

**Success Criteria**:
- Active areas of codebase immediately visible
- Git history loads in <3 seconds for typical repos
- Visualization helps identify recent work

### Phase 6: Polish & Testing (Week 8)
**Focus**: Bug fixes, performance tuning, documentation

**Implementation Tasks**:
1. **Performance Optimization Round 2**
   - Profile and optimize hotspots
   - Reduce memory usage
   - Improve load times
   - Test with large repos (10K+ files)

2. **Comprehensive Testing**
   - Achieve 80%+ unit test coverage
   - E2E tests for all user stories
   - Visual regression tests
   - Cross-browser testing

3. **Documentation**
   - User guide with screenshots/videos
   - API documentation
   - Architecture documentation
   - Deployment guide

4. **Accessibility**
   - Keyboard navigation for all features
   - Screen reader support for UI
   - Motion sensitivity options
   - High contrast mode

**Success Criteria**:
- All P1 and P2 user stories fully functional
- Performance targets met
- <5 critical bugs
- Documentation complete

## Technical Risks & Mitigation

### Risk 1: Performance with Large Repositories
**Severity**: High | **Probability**: High

**Mitigation**:
- Implement aggressive LOD and culling from start (Phase 4)
- Set hard limits on initial load (10K files max MVP)
- Add progressive loading/streaming for large repos
- Provide performance warnings and degraded modes

**Fallback**: If web tech insufficient, pivot to Unity/Godot in Phase 2

### Risk 2: Spatial Layout Intuitiveness
**Severity**: Medium | **Probability**: Medium

**Mitigation**:
- User testing after Phase 0 prototypes
- Make layout algorithm configurable/swappable
- Provide multiple layout options in final product
- Add strong search to compensate for layout confusion

**Fallback**: Focus on search/teleport if layout doesn't work

### Risk 3: Git Integration Complexity
**Severity**: Medium | **Probability**: Low

**Mitigation**:
- Evaluate git libraries in Phase 0 thoroughly
- Limit git features to MVP essentials (commit history only)
- Graceful degradation if git unavailable
- Make git features optional add-on

**Fallback**: Ship without git features if integration too complex

### Risk 4: Browser Memory Limits
**Severity**: High | **Probability**: Medium

**Mitigation**:
- Aggressive memory profiling
- Unload distant objects from memory
- Compress cached data
- Consider Electron for desktop (no browser limits)

**Fallback**: Desktop-only distribution via Electron

## Dependencies

**External**:
- Three.js (3D rendering engine)
- NodeGit or simple-git (git integration)
- Vite (build tool)
- React (UI framework)
- highlight.js or Prism.js (syntax highlighting)
- Tree-sitter (code parsing for advanced features)

**Internal**:
- None (standalone application)

**Platform**:
- Node.js 20.x runtime
- Modern browser (Chrome 100+, Firefox 100+, Safari 15+)
- GPU with WebGL 2.0 support
- 4GB+ RAM recommended
- File system access (Electron or File System Access API)

## Testing Strategy

### Unit Tests (Vitest)
- Layout algorithm correctness
- Metric calculations
- Language detection
- Search indexing and query

**Target**: 80% coverage of non-rendering code

### Integration Tests
- Repository loading end-to-end
- Git analysis pipeline
- Rendering pipeline (basic)
- State management

**Target**: All major workflows covered

### E2E Tests (Playwright)
- Navigate through sample repository
- File interaction (click, view content)
- Search and teleport
- Settings and preferences

**Target**: All user stories have E2E test

### Performance Tests
- Load time benchmarks (100, 1K, 10K files)
- FPS measurements under various conditions
- Memory usage over time
- Search response time

**Target**: Meet performance goals from Technical Context

### Visual Regression Tests
- Screenshot comparison of 3D scenes
- UI component rendering
- Color schemes and themes

**Target**: Prevent visual regressions

## Deployment Strategy

### Development
- Vite dev server for local development
- Hot module replacement for fast iteration

### Staging
- Deploy to GitHub Pages or Netlify for web version
- Test with real repositories
- Beta testing with small user group

### Production

**Option 1: Web Application**
- Static site hosting (Vercel, Netlify, GitHub Pages)
- No backend required
- Users access via browser

**Option 2: Desktop Application (Electron)**
- Package for Windows, macOS, Linux
- Distribute via GitHub Releases
- Auto-update capability

**Recommendation**: Start with web for accessibility, add Electron packaging in Phase 5 if needed

## Success Metrics (Recap)

**Performance**:
- ✓ 60 FPS in repos up to 10K files
- ✓ <10s load time for 2000-file repos
- ✓ <100ms search response time

**Usability**:
- ✓ Users navigate to any file in <30s
- ✓ 70%+ report better spatial understanding
- ✓ Average 10+ minute initial session

**Quality**:
- ✓ <5 critical bugs at launch
- ✓ 80%+ test coverage
- ✓ Works on 3 major browsers

## Next Steps

1. **Immediate**: Kick off Phase 0 research
   - Set up spike projects for each research question
   - Schedule user testing session for layout algorithms
   - Begin evaluating git libraries

2. **Week 2**: Design phase
   - Finalize data model based on research findings
   - Write API contracts
   - Create quickstart guide

3. **Week 3**: Start implementation
   - Set up project structure
   - Begin core navigation development
   - Establish testing infrastructure

4. **Week 8**: Beta release
   - Launch to small user group
   - Gather feedback
   - Plan Phase 7+ based on learning

## Open Questions for Phase 0 Research

1. Can Three.js maintain 60 FPS with 10K+ instanced objects? → Prototype and benchmark
2. NodeGit vs simple-git vs isomorphic-git? → Evaluate performance and API
3. Grid vs treemap vs force-directed layout? → User testing
4. Web File System Access API vs Electron? → Feature comparison and testing
5. How to handle repositories with 100K+ files? → Streaming strategy research
6. Syntax highlighting performance with large files? → Benchmark highlight.js vs Prism.js
