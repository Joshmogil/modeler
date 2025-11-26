# 3D Repository Explorer Constitution

**Project**: 3D Repository Visualization (Modeler)  
**Version**: 1.0.0  
**Ratified**: November 26, 2025  
**Status**: Active

## Core Principles

### I. Local-First Architecture (NON-NEGOTIABLE)

**All data processing MUST happen on the user's local machine. Zero external dependencies.**

**Rules**:
- ✅ **ALLOWED**: Local file system access, browser IndexedDB/localStorage, SQLite embedded databases
- ✅ **ALLOWED**: Static assets loaded from local storage or CDN (read-only, public libraries only)
- ❌ **FORBIDDEN**: API calls to external servers for data processing
- ❌ **FORBIDDEN**: Cloud services requiring authentication or data upload
- ❌ **FORBIDDEN**: Telemetry, analytics, or usage tracking (unless explicitly opt-in and local-only)
- ❌ **FORBIDDEN**: Features requiring internet connectivity (offline-first mandatory)

**Rationale**: User privacy is paramount. Repository code is sensitive intellectual property that never leaves the user's machine.

**Exceptions**: 
- Documentation/help content may link to external resources
- Optional: Check for updates (user consent required, version check only, no data sent)

---

### II. Zero Sign-Up, Zero Configuration (NON-NEGOTIABLE)

**Users MUST be able to run the application immediately with zero account creation, API keys, or service registration.**

**Rules**:
- ❌ **FORBIDDEN**: User accounts, authentication, or login systems
- ❌ **FORBIDDEN**: API keys or service credentials (AWS, Firebase, etc.)
- ❌ **FORBIDDEN**: OAuth flows or third-party authentication
- ✅ **ALLOWED**: Local preferences stored in browser storage or config files
- ✅ **ALLOWED**: Optional settings for customization (saved locally)

**Rationale**: Reduce friction to zero. Download → Open → Use. No barriers.

**Test**: New user should go from download to visualizing their first repository in under 2 minutes.

---

### III. Simple, Universal Tools Only (NON-NEGOTIABLE)

**Use only technologies and databases that are universally available, simple to install, and require no external services.**

**Approved Technologies**:

**Languages**:
- ✅ JavaScript/TypeScript (runs in any browser)
- ✅ Python (ubiquitous, simple installer)
- ✅ Go (single binary, no runtime dependencies)
- ❌ Languages requiring complex runtimes or platform-specific SDKs

**Databases**:
- ✅ SQLite (embedded, single file, no server)
- ✅ Browser IndexedDB (web apps, built-in)
- ✅ JSON files (for simple config/cache)
- ✅ CSV files (for exports/imports)
- ❌ PostgreSQL, MySQL, MongoDB (require server installation)
- ❌ Cloud databases (Firebase, Supabase, etc.)

**Storage**:
- ✅ Local file system
- ✅ Browser localStorage/sessionStorage/IndexedDB
- ❌ Cloud storage (S3, Google Cloud Storage, etc.)
- ❌ Remote file systems requiring network

**Build Tools**:
- ✅ Vite, Webpack (standard web bundlers)
- ✅ npm/yarn/pnpm (standard package managers)
- ❌ Tools requiring account registration or cloud services

**Rendering**:
- ✅ Three.js (WebGL, browser native)
- ✅ Canvas API (browser native)
- ✅ Godot, Unity (desktop apps, self-contained)
- ❌ Cloud rendering services

**Rationale**: Minimize setup complexity. Developers should install one thing (the app) and it works. No database servers, no service configuration, no cloud accounts.

**Exception**: Development dependencies (build tools, linters) are acceptable if they don't affect end users.

---

### IV. Privacy & Security First

**User data, repository contents, and usage patterns are private and never transmitted.**

**Rules**:
- ✅ All repository analysis happens in-browser or in local process
- ✅ File contents stored in local cache only
- ✅ Git history parsed locally using local git libraries
- ❌ No network requests containing user code or file paths
- ❌ No crash reports or error logs sent to external servers (unless explicit opt-in with sanitization)
- ❌ No "phone home" functionality

**Security Requirements**:
- Read-only file system access by default
- Sandboxed execution (browser or Electron renderer process)
- No arbitrary code execution from repository contents
- No network requests to untrusted domains

**Audit Trail**: Any network request must be logged and documented in code comments explaining why it's necessary.

---

### V. Performance Without Cloud

**Application MUST perform well using only local compute resources.**

**Requirements**:
- 60 FPS rendering on mid-range hardware (2020+ laptops)
- Load repositories <10,000 files in under 10 seconds
- Repository analysis fully parallelized using local CPU cores
- Progressive loading for large repositories
- Graceful degradation for lower-end hardware

**Optimization Strategies**:
- Aggressive caching (IndexedDB/SQLite)
- Lazy loading of file contents
- LOD (level of detail) for 3D rendering
- Web Workers for background processing
- WASM for compute-intensive tasks (if needed)

**NO CLOUD OFFLOADING**: Cannot use cloud computing to improve performance. Must optimize for local execution.

---

### VI. Simplicity Over Features

**Start minimal. Add complexity only when justified.**

**YAGNI (You Aren't Gonna Need It)**:
- Build core navigation BEFORE advanced features
- Prove user need BEFORE building complex visualizations
- Simple grid layout BEFORE sophisticated algorithms
- File preview BEFORE full editing capabilities

**Complexity Budget**: 
- Each major feature addition requires justification
- Document WHY complexity is needed
- Consider simpler alternatives first
- Measure actual user requests vs assumptions

**Delete Ruthlessly**:
- Remove unused features
- Eliminate dead code regularly
- Simplify overcomplicated implementations

---

### VII. Test-First Development (NON-NEGOTIABLE)

**Tests written and failing BEFORE implementation begins.**

**TDD Cycle**:
1. Write test describing desired behavior
2. Verify test FAILS (red)
3. Implement minimum code to pass (green)
4. Refactor (keeping tests green)
5. Commit

**Test Requirements**:
- Unit tests: 80%+ coverage for core logic
- Integration tests: All major user workflows
- E2E tests: Each user story from spec.md
- Performance tests: FPS, load times, memory usage

**Test Characteristics**:
- Fast: Unit tests run in <5 seconds total
- Isolated: No network, no file system (mock/stub)
- Deterministic: Same input → same output, every time
- Local: All tests run completely offline

---

### VIII. Git Commit Standards (NON-NEGOTIABLE)

**All commits MUST be signed and follow conventional commits format.**

**Format**:
```
<type>(<scope>): <description>

[optional body]

Signed-off-by: Your Name <email@example.com>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, whitespace
- `refactor`: Code restructure, no behavior change
- `perf`: Performance improvement
- `test`: Adding or fixing tests
- `chore`: Maintenance, dependencies

**Always use**: `git commit -s` to auto-sign commits

**Examples**:
```
feat(renderer): add LOD system for distant objects

Implements level-of-detail rendering to improve FPS with large repos.
Uses distance-based culling with 3 LOD levels.

Signed-off-by: Josh Mogil <josh@example.com>
```

```
fix(git-parser): handle repositories without commit history

Gracefully degrade when .git folder missing or corrupted.
Show file structure without git-dependent features.

Signed-off-by: Josh Mogil <josh@example.com>
```

**Enforcement**: PRs without signed commits will be rejected.

---

## Development Workflow

### Local Development Requirements

**Environment Setup**:
- Node.js 20+ (for TypeScript/Vite builds)
- Git (for repository analysis)
- Modern browser (Chrome/Firefox/Safari latest)
- Optional: Electron (for desktop packaging)

**NO REQUIRED**:
- ❌ Database servers
- ❌ Cloud accounts
- ❌ API keys
- ❌ Docker (nice-to-have, not required)
- ❌ Kubernetes, AWS, etc.

**Developer Experience**:
1. Clone repository
2. `npm install`
3. `npm run dev`
4. Open browser → Start coding

**Target**: Developer productive within 5 minutes of clone.

---

### Task Quality Standards (NON-NEGOTIABLE)

Every task in backlog MUST have:

1. **Acceptance Criteria** (minimum 1, typically 2-4)
   - Clear, testable conditions
   - Outcome-oriented ("User can..." not "Code should...")
   - Objectively verifiable
   
2. **Description**
   - Context: Why is this needed?
   - Scope: What's included/excluded?
   - File paths: Where will changes occur?

3. **User Story Reference**
   - Which user story (US1, US2, etc.) does this support?
   - How does this contribute to user value?

**Examples**:

✅ **GOOD TASK**:
```
Title: Implement file object rendering
Story: US1 (Navigate Repository)
Description: Render files as 3D cubes in the world using Three.js instanced meshes.
Files: frontend/src/entities/FileObject.ts

Acceptance Criteria:
- [ ] Files appear as cubes in 3D space at positions from layout engine
- [ ] Cube color matches file's programming language
- [ ] Cube size scales proportionally to file line count
- [ ] Hovering over cube displays file name tooltip
```

❌ **BAD TASK** (rejected):
```
Title: Add rendering
Description: Make files show up
```

**Enforcement**: Tasks without acceptance criteria are incomplete and will not be accepted into backlog.

---

### Quality Gates

**Pre-Commit**:
- [ ] All tests pass locally
- [ ] Code formatted (Prettier/ESLint)
- [ ] No console.log statements (use proper logging)
- [ ] Commit message follows convention
- [ ] Commit signed with DCO

**Pre-PR**:
- [ ] All acceptance criteria met
- [ ] Tests added for new functionality
- [ ] Documentation updated (if public API changed)
- [ ] No new external dependencies without justification
- [ ] Performance impact measured (if applicable)

**Pre-Merge**:
- [ ] Code review approved
- [ ] CI passes (all tests, linting)
- [ ] No merge conflicts
- [ ] User story independently testable

---

## Technology Constraints

### Approved Stack

**Frontend/Rendering**:
- Three.js (3D rendering, WebGL)
- TypeScript 5+ (type safety)
- Vite (build tool)
- React (UI components, optional Vue/Svelte)

**Repository Analysis**:
- NodeGit or isomorphic-git (git parsing, no native deps preferred)
- Tree-sitter (code parsing, optional for advanced features)

**Storage**:
- IndexedDB (browser caching)
- SQLite (desktop app caching via better-sqlite3)
- JSON files (config, small data)

**Desktop Packaging (Optional)**:
- Electron (cross-platform desktop)
- Tauri (lighter alternative, Rust-based)

**Testing**:
- Vitest (unit/integration tests)
- Playwright (E2E browser tests)
- Testing Library (React component tests)

### Forbidden Dependencies

❌ **NEVER ALLOWED**:
- Firebase, Supabase, AWS Amplify (cloud services)
- Auth0, Okta (authentication services)
- Segment, Mixpanel, Google Analytics (tracking)
- Sentry, Rollbar (error tracking without opt-in)
- Any package requiring API keys or authentication
- Any package that phones home by default

❌ **STRONGLY DISCOURAGED** (needs justification):
- Large dependencies (>5MB uncompressed)
- Native Node modules (platform-specific compilation)
- Packages with known security issues
- Unmaintained packages (no update in 2+ years)

✅ **EVALUATION CRITERIA** for new dependencies:
- Is it absolutely necessary?
- Can we implement ourselves simply?
- Does it respect user privacy?
- Is it actively maintained?
- Does it work offline?
- What's the bundle size impact?

---

## Performance Standards

**Rendering**:
- 60 FPS on mid-range hardware (2020+ laptop, integrated GPU)
- 30 FPS minimum on low-end hardware
- Frame time <16ms (60 FPS) for smooth navigation

**Loading**:
- <10s to load and render 2,000 file repository
- <30s for 10,000 file repository
- Progressive loading shows content within 2s (even if incomplete)

**Memory**:
- <500MB for typical repository (1,000-2,000 files)
- <2GB for large repository (10,000 files)
- <5GB absolute maximum (100,000+ files with degradation)

**Search**:
- <100ms response time for fuzzy file search
- <500ms for full-text code search

**Interaction**:
- <100ms from click to file panel display
- <50ms from teleport request to camera move start

**Measurement**: Performance tests run in CI. Regressions block merges.

---

## Security & Privacy

### Data Handling

**Local Only**:
- All repository data stays on user's machine
- No transmission to external servers
- No cloud sync by default

**Sensitive Information**:
- Never log file paths in external logs
- Never transmit file contents
- Sanitize error messages before any external reporting (if opt-in added)

**Sandboxing**:
- File system access limited to user-selected repositories
- No arbitrary code execution from repository contents
- No eval() or Function() with user data

### Telemetry (If Added Later)

**MUST BE**:
- Opt-in (disabled by default)
- Anonymous (no identifying information)
- Local-first (stored locally, user controls transmission)
- Transparent (show exactly what's collected)
- Deletable (user can clear all data)

**Example Acceptable Telemetry** (with consent):
- Feature usage counts (no content)
- Performance metrics (FPS, load times)
- Error frequency (no stack traces with file paths)

**NEVER**:
- File names, paths, or contents
- Repository URLs or identifiers
- User's real name or email without explicit consent
- Any PII (personally identifiable information)

---

## Governance

### Constitution Authority

This constitution is the highest authority for technical decisions in this project.

**Supersedes**:
- Individual preferences
- "Best practices" that conflict with principles
- External recommendations that violate constraints

**Conflicts**:
- If specification contradicts constitution → Constitution wins
- If feature request violates constitution → Request rejected or constitution amended

### Amendment Process

**Minor Amendments** (clarifications, examples):
- Document change rationale
- Update version (patch bump)
- Commit with `docs(constitution): <description>`

**Major Amendments** (new principles, constraint changes):
- Document in spec or RFC
- Justify why amendment needed
- Impact analysis on existing code
- Team consensus (if team project)
- Update version (minor/major bump)
- Migration plan for affected code

### Compliance

**Reviews**:
- All PRs reviewed for constitution compliance
- Checklist: Local-only? No external services? Simple tools? Tests first?

**Violations**:
- Block merge until fixed
- Document exception if truly necessary (rare)
- Consider if constitution needs update

**Complexity Justification**:
- If adding complexity, document in PR description:
  - Why simpler approach insufficient?
  - What user value does this provide?
  - What's the maintenance cost?

---

## Quick Reference

### ✅ DO
- Process everything locally
- Use SQLite, IndexedDB, JSON files
- Optimize for offline use
- Write tests first
- Sign all commits
- Keep it simple
- Respect user privacy
- Document complexity justification

### ❌ DON'T
- Send data to external servers
- Require sign-ups or API keys
- Use cloud services
- Add complexity without justification
- Commit without signing
- Track users without consent
- Use databases requiring servers
- Access network for core features

---

**Version**: 1.0.0  
**Ratified**: November 26, 2025  
**Last Amended**: November 26, 2025  
**Next Review**: December 26, 2025 (monthly review cycle)
