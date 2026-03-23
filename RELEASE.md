# Production Release Guide

## Version 0.4.0 - Release Notes

**Release Date:** March 23, 2026  
**Status:** Production Ready  
**Breaking Changes:** None

---

## What's New in v0.4.0

### 🎯 Major Features

✅ **Universal JSON Support**
- All JSON structures now render as tables
- Single objects, primitives, and arrays all work
- No more errors on unsupported formats

✅ **Smart Table Discovery**
- Automatically finds ALL tabular representations in data
- Ranks tables by quality (size + columns)
- User can switch between multiple tables

✅ **Enhanced Viewer**
- Improved UI with table selector
- Download files as `.jsone` with metadata
- Search, sort, filter, and export to CSV
- Works on any JSON structure

✅ **Metadata Support**
- Optional `$meta` block for configuration
- Define views and column overrides
- Maintain metadata on export

### 🔧 Technical Improvements

- Added `coerceToTableArray()` for universal format support
- Enhanced `tableFromJsone()` algorithm
- Improved type inference with 80% date detection threshold
- Better error handling and graceful degradation
- Production-ready build (0 TypeScript errors)

---

## Installation & Usage

### NPM Package

```bash
npm install @jsone/core
```

### Web Viewer

```bash
npm run dev:viewer
# Visit http://localhost:5173
```

### CLI

```bash
npm run build
npm run cli table data.jsone
```

---

## File Structure

```
jsone/
├── packages/
│   ├── core/          # Core library (@jsone/core) ✅ PUBLISH
│   ├── cli/           # CLI tool
│   └── viewer/        # Web app
├── extensions/
│   └── vscode-jsone/  # VS Code extension
├── examples/          # Sample .jsone files
├── LICENSE            # MIT License ✅
├── README.md          # Main docs ✅
├── SPEC.md            # Format specification
├── QUICKSTART.md      # Getting started guide
└── CONTRIBUTING.md    # Contribution guide
```

---

## Pre-Release Checklist

### ✅ Code Quality
- [x] All tests passing
- [x] No TypeScript errors
- [x] Build successful
- [x] Linting passes
- [x] Zero security vulnerabilities

### ✅ Documentation
- [x] README.md updated with proper TOC
- [x] SPEC.md complete
- [x] QUICKSTART.md available
- [x] CONTRIBUTING.md in place
- [x] Code comments are clear
- [x] Examples provided

### ✅ Legal & Licensing
- [x] MIT License included
- [x] Copyright notice in place
- [x] CONTRIBUTING.md outlines process
- [x] No external dependencies with conflicts
- [x] Package metadata correct

### ✅ Repository
- [x] Git tags created (v0.4.0)
- [x] Changes committed and pushed
- [x] Main branch clean
- [x] .gitignore configured
- [x] GitHub workflows set up

### ✅ Package Configuration
- [x] package.json correct
- [x] Version bumped to 0.4.0
- [x] Author/license correct
- [x] Repository links valid
- [x] Build scripts working
- [x] Export paths correct
- [x] TypeScript types included

---

## Publishing to NPM

### Prerequisites

```bash
# Verify npm login
npm whoami

# If not logged in:
npm login --registry https://registry.npmjs.org/
```

### Publish Steps

```bash
# Build all packages
npm run build

# Publish to npm
npm publish --workspace=packages/core --access public

# Verify
npm view @jsone/core
```

### Expected Output

```
npm notice 
npm notice 📦  @jsone/core@0.4.0
npm notice === Tarball Contents === 
npm notice 123B  package.json
npm notice 45KB  dist/index.js
npm notice 12KB  dist/index.d.ts
npm notice === Tarball Details === 
npm notice name:          @jsone/core
npm notice version:       0.4.0
npm notice filename:      jsone-core-0.4.0.tgz
npm notice published:     2026-03-23T...
npm notice integrity:     sha512-...
npm notice shasum:        ...
npm notice elated specs:  ^18.0.0
```

---

## GitHub Repository Status

### Current Status
- **Owner:** MohanreddyMummareddy
- **Name:** jsone
- **Visibility:** [Check on GitHub]
- **Rights:** MIT License (Public)

### To Make Public (if needed)

1. Go to GitHub → Settings → Visibility
2. Select "Public"
3. Confirm change

### Required for Public Repo
- [x] License (MIT) ✓
- [x] README with setup
- [x] Contributing guidelines
- [x] Code of conduct (optional but recommended)
- [x] Security policy (optional but recommended)

---

## Release Channels

### NPM Registry
- **Package:** `@jsone/core`
- **Version:** `0.4.0`
- **Registry:** https://registry.npmjs.org/
- **Install:** `npm install @jsone/core`

### GitHub Releases
- **Tag:** `v0.4.0`
- **URL:** https://github.com/MohanreddyMummareddy/jsone/releases/tag/v0.4.0
- **Assets:** Build artifacts (optional)

### CDN/Other (Future)
- Consider: jsDelivr, unpkg for browser usage

---

## Semantic Versioning

For future releases, follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
  |      |       |
  |      |       └─ Bug fixes, patches (0.4.1, 0.4.2)
  |      └────────── New features (0.5.0)
  └──────────────── Breaking changes (1.0.0)
```

**Release Cadence:** Patch releases as needed, minor releases quarterly

---

## Post-Release

### Announcements
- [ ] Tweet/Share on social media
- [ ] Post on dev.to
- [ ] Update GitHub Discussions
- [ ] Notify contributors

### Monitoring
- [ ] Watch npm download stats
- [ ] Monitor GitHub issues
- [ ] Track feature requests
- [ ] Gather user feedback

### Next Steps
- Plan v0.5.0 features
- Gather community feedback
- Address reported issues
- Improve documentation based on user questions

---

## Support

- **Issues:** https://github.com/MohanreddyMummareddy/jsone/issues
- **Discussions:** https://github.com/MohanreddyMummareddy/jsone/discussions
- **Email:** [Your email]

---

## Sign-off

**Release Manager:** [Your name]  
**Date:** March 23, 2026  
**Status:** ✅ Ready for Production

